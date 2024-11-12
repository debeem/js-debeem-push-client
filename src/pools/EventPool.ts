import _ from "lodash";
import { PushServerResponse } from "../models/PushServerResponse";
import { VaPushServerResponse } from "../validators/VaPushServerResponse";
import { CallbackClientEventReceiver } from "../models/callbacks/ClientEventReceiver";
import { PushClientStorageService } from "../storages/PushClientStorageService";
import { VaPublishRequest } from "../validators/requests/VaPublishRequest";
import { PublishRequest } from "../models/requests/PublishRequest";
import {
	defaultPushClientOffsetItem, defaultPushClientMaxOffset,
	defaultPushClientMinOffset,
	PushClientOffsetItem
} from "../entities/PushClientEntity";
import { clearInterval } from "timers";
import { Logger, LoggerUtil } from "../utils/LoggerUtil";
import { VaChannel } from "../validators/VaChannel";
import { IServerEventReceiver } from "../models/callbacks/ServerEventReceiver";


export const defaultEventPoolSize = 1024;

/**
 * 	class options
 */
export interface EventPoolOptions
{
	maxSize : number;
}

/**
 * 	define client item type
 */
export type EventPoolClientItem =
{
	eventReceiver : CallbackClientEventReceiver | null;
	events : Array<PushServerResponse>;
	offset : PushClientOffsetItem;
};

export const defaultEventPoolClientItem =
{
	eventReceiver : null,
	events : [],
	offset : _.cloneDeep( defaultPushClientOffsetItem ),
};


/**
 * 	@class
 */
export class EventPool implements IServerEventReceiver
{
	/**
	 * 	options
	 *	@protected
	 */
	protected options !: EventPoolOptions;

	/**
	 * 	last offset
	 *	@protected
	 */
	protected pushClientStorageService : PushClientStorageService = new PushClientStorageService();

	/**
	 *	@protected
	 */
	protected offsetFlusherInterval : NodeJS.Timeout | number | undefined = undefined;

	/**
	 * 	- key 	: channel
	 * 	- value	: {EventPoolClientItem}
	 *	@protected
	 */
	protected clientItems : { [ key : string ] : EventPoolClientItem } = {};

	// protected minOffset : number = Number.MAX_VALUE;
	// protected maxOffset : number = 0;


	/**
	 * 	log
	 */
	log : Logger = new LoggerUtil().logger;


	constructor( options : EventPoolOptions )
	{
		if ( ! options )
		{
			throw new Error( `${ this.constructor.name }.constructor :: invalid options` );
		}
		if ( ! _.isNumber( options.maxSize ) || options.maxSize <= 0 )
		{
			throw new Error( `${ this.constructor.name }.constructor :: invalid options.maxSize` );
		}

		//	...
		this.options = options;

		//	bind pointer `this` to the function callbackEventReceiver for callback
		this.serverEventReceiver = this.serverEventReceiver.bind( this );

		//	create an interval for flushing offset into local database
		this.startOffsetFlusher();
	}

	/**
	 * 	destroy
	 */
	public destroy()
	{
		if ( this.offsetFlusherInterval )
		{
			clearInterval( this.offsetFlusherInterval );
		}
	}

	/**
	 * 	set client receiver function address
	 *	@param channel		{string}
	 *	@param callback		{CallbackClientEventReceiver}
	 *	@returns {void}
	 */
	public setClientEventReceiver( channel : string, callback : CallbackClientEventReceiver ) : void
	{
		const errorChannel : string | null = VaChannel.validateChannel( channel );
		if ( null !== errorChannel )
		{
			throw new Error( `${ this.constructor.name }.setClientEventReceiver :: invalid channel, ${ errorChannel }` );
		}
		if ( ! _.isFunction( callback ) )
		{
			throw new Error( `${ this.constructor.name }.setClientEventReceiver :: invalid callback` );
		}

		//	...
		this.initClientItemIfNeeded( channel );
		this.clientItems[ channel ].eventReceiver = callback;
	}

	/**
	 * 	@param channel	{string}
	 * 	@returns {Array<PushServerResponse>}
	 */
	public getEvents( channel : string ) : Array<PushServerResponse>
	{
		const errorChannel : string | null = VaChannel.validateChannel( channel );
		if ( null !== errorChannel )
		{
			throw new Error( `${ this.constructor.name }.getEvents :: invalid channel, ${ errorChannel }` );
		}

		if ( _.has( this.clientItems, channel ) &&
			Array.isArray( this.clientItems[ channel ].events ) )
		{
			return this.clientItems[ channel ].events;
		}

		return [];
	}

	/**
	 * 	receive event
	 * 	@implements
	 *
	 *	@param event		{PushServerResponse}
	 *	@param ackCallback	{( ack : any ) => void}
	 *	@returns {void}
	 */
	public serverEventReceiver( event : PushServerResponse, ackCallback ?: ( ack : any ) => void ) : void
	{
		//	...
		this.addEvent( event );

		//	...
		if ( _.isFunction( ackCallback ) )
		{
			this.log.debug( `${ this.constructor.name }.serverEventReceiver :: received event: will call callback` );
			ackCallback( {
				status : `ok`
			} );
		}
	}

	/**
	 * 	add event
	 *
	 *	@param event	{PushServerResponse}
	 * 	@returns {void}
	 */
	public addEvent( event : PushServerResponse ) : void
	{
		if ( null !== VaPushServerResponse.validatePushServerResponse( event ) )
		{
			this.log.warn( `${ this.constructor.name }.addEvent :: invalid event :`, event );
			return;
		}

		/**
		 * 	extract publishRequest data
		 */
		const publishRequest : PublishRequest = event.data;
		if ( null !== VaPublishRequest.validatePublishRequest( publishRequest, true ) )
		{
			this.log.warn( `${ this.constructor.name }.addEvent :: invalid event.data :`, publishRequest );
			return;
		}

		//	...
		const channel : string = publishRequest.channel;

		this.initClientItemIfNeeded( channel );
		if ( this.clientItems[ channel ].eventReceiver &&
			_.isFunction( this.clientItems[ channel ].eventReceiver ) )
		{
			this.clientItems[ channel ].eventReceiver!( channel, event );
		}

		this.clientItems[ channel ].events.push( event );
		if ( this.clientItems[ channel ].events.length > this.options.maxSize )
		{
			//	delete the oldest data
			this.clientItems[ channel ].events.shift();
		}

		//	sort events
		this.clientItems[ channel ].events.sort( ( a : PushServerResponse, b : PushServerResponse ) => a.timestamp! - b.timestamp! );

		//	update the lastOffset
		if ( publishRequest.timestamp > this.clientItems[ channel ].offset.maxOffset )
		{
			this.clientItems[ channel ].offset.maxOffset = publishRequest.timestamp;
		}
		if ( publishRequest.timestamp < this.clientItems[ channel ].offset.minOffset )
		{
			this.clientItems[ channel ].offset.minOffset = publishRequest.timestamp;
		}
	}

	/**
	 * 	get earliest/min offset in memory
	 *
	 * 	@param channel		{string}
	 *	@returns { number }
	 */
	public getMinOffset( channel : string ) : number
	{
		const errorChannel : string | null = VaChannel.validateChannel( channel );
		if ( null !== errorChannel )
		{
			throw new Error( `${ this.constructor.name }.getMinOffset :: invalid channel, ${ errorChannel }` );
		}
		if ( _.has( this.clientItems, channel ) )
		{
			return this.clientItems[ channel ].offset.minOffset;
		}

		return defaultPushClientMinOffset;
	}

	/**
	 * 	get latest/max Offset in memory
	 *
	 * 	@param channel		{string}
	 * 	@returns { number }
	 */
	public getMaxOffset( channel : string ) : number
	{
		const errorChannel : string | null = VaChannel.validateChannel( channel );
		if ( null !== errorChannel )
		{
			throw new Error( `${ this.constructor.name }.getMaxOffset :: invalid channel, ${ errorChannel }` );
		}
		if ( _.has( this.clientItems, channel ) )
		{
			return this.clientItems[ channel ].offset.maxOffset;
		}

		return defaultPushClientMaxOffset;
	}

	/**
	 * 	load lastOffset/maxOffset from local database
	 *
	 * 	@param channel		{string}
	 * 	@returns {Promise< number >}
	 */
	public loadOffset( channel : string ) : Promise< PushClientOffsetItem >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorChannel : string | null = VaChannel.validateChannel( channel );
				if ( null !== errorChannel )
				{
					return reject( `${ this.constructor.name }.loadOffset :: invalid channel, ${ errorChannel }` );
				}

				//	...
				const offsetItem : PushClientOffsetItem | null = await this.pushClientStorageService.get( channel );
				if ( offsetItem )
				{
					this.initClientItemIfNeeded( channel );
					this.clientItems[ channel ].offset = offsetItem;

					//	...
					return resolve( offsetItem );
				}

				//	...
				resolve( defaultPushClientOffsetItem );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	start offset flusher thread
	 *
	 *	@protected
	 */
	protected startOffsetFlusher()
	{
		if ( this.offsetFlusherInterval )
		{
			clearInterval( this.offsetFlusherInterval );
		}

		//	...
		this.offsetFlusherInterval = setInterval( async () =>
		{
			if ( ! this.pushClientStorageService )
			{
				throw new Error( `${ this.constructor.name }.threadOffsetFlusher :: uninitialized this.pushClientStorageService` );
			}

			for ( const channel in this.clientItems )
			{
				//	to avoid inherited properties from being enumerated
				if ( ! this.clientItems.hasOwnProperty( channel ) )
				{
					continue;
				}
				if ( null !== VaChannel.validateChannel( channel ) )
				{
					console.warn( `${ this.constructor.name }.startOffsetFlusher->offsetFlusherInterval :: invalid channel[${ channel }]` );
					continue;
				}

				const clientItem : EventPoolClientItem = this.clientItems[ channel ];
				await this.pushClientStorageService.put( channel, clientItem.offset );
			}

		}, 3000 );
	}

	/**
	 * 	initialize client item
	 *	@param channel		{string}
	 *	@returns {void}
	 *	@private
	 */
	private initClientItemIfNeeded( channel : string ) : void
	{
		if ( ! _.has( this.clientItems, channel ) )
		{
			this.clientItems[ channel ] = _.cloneDeep( defaultEventPoolClientItem );
		}
	}

}
