import _ from "lodash";
import { PushServerResponse } from "../models/PushServerResponse";
import { VaPushServerResponse } from "../validators/VaPushServerResponse";
import { ClientReceiveEventCallback } from "../models/callbacks/ClientReceiveEventCallback";
import { PushClientStorageService } from "../storages/PushClientStorageService";
import { VaPublishRequest } from "../validators/requests/VaPublishRequest";
import { PublishRequest } from "../models/requests/PublishRequest";
import { PushClientItem, pushClientStorageKey } from "../entities/PushClientEntity";
import { clearInterval } from "timers";
import { Logger, LoggerUtil } from "../utils/LoggerUtil";


export const defaultEventPoolSize = 1024;

export interface EventPoolOptions
{
	maxSize : number;
}


/**
 * 	@class
 */
export class EventPool
{
	/**
	 * 	options
	 *	@protected
	 */
	protected options !: EventPoolOptions;

	/**
	 * 	callback function
	 *	@protected
	 */
	protected receiveEventCallback !: ClientReceiveEventCallback;

	/**
	 * 	event array
	 *	@protected
	 */
	protected receivedEvents : Array<PushServerResponse> = [];

	/**
	 * 	last offset
	 *	@protected
	 */
	protected pushClientStorageService : PushClientStorageService = new PushClientStorageService();
	protected minOffset : number = Number.MAX_VALUE;
	protected maxOffset : number = 0;
	protected offsetFlusherInterval : any;

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
		this.callbackEventReceiver = this.callbackEventReceiver.bind( this );

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
	 * 	set callback function address
	 *	@param callback	{ClientReceiveEventCallback}
	 */
	public setCallback( callback : ClientReceiveEventCallback ) : void
	{
		if ( ! _.isFunction( callback ) )
		{
			throw new Error( `${ this.constructor.name }.setCallback :: invalid callback` );
		}

		//	...
		this.receiveEventCallback = callback;
	}

	/**
	 * 	@returns {Array<PushServerResponse>}
	 */
	public getEvents() : Array<PushServerResponse>
	{
		return this.receivedEvents;
	}

	/**
	 * 	receive event
	 *
	 *	@param event		{PushServerResponse}
	 *	@param callback		{( ack : any ) => void}
	 *	@returns {void}
	 */
	public callbackEventReceiver( event : PushServerResponse, callback ?: ( ack : any ) => void ) : void
	{
		setTimeout( () =>
		{
			this.addEvent( event );
		}, 1 );
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

		const publishRequest : PublishRequest = event.data;
		if ( null !== VaPublishRequest.validatePublishRequest( publishRequest, true ) )
		{
			this.log.warn( `${ this.constructor.name }.addEvent :: invalid event.data :`, publishRequest );
			return;
		}

		//	...
		if ( _.isFunction( this.receiveEventCallback ) )
		{
			this.receiveEventCallback( event );
		}

		//	...
		this.receivedEvents.push( event );
		if ( this.receivedEvents.length > this.options.maxSize )
		{
			//	delete the oldest data
			this.receivedEvents.shift();
		}

		//	sort events
		this.receivedEvents.sort( ( a : PushServerResponse, b : PushServerResponse ) => a.timestamp! - b.timestamp! );

		//	update the lastOffset
		if ( publishRequest.timestamp > this.maxOffset )
		{
			this.maxOffset = publishRequest.timestamp;
		}
		if ( publishRequest.timestamp < this.minOffset )
		{
			this.minOffset = publishRequest.timestamp;
		}
	}

	/**
	 * 	get earliest/min offset
	 *	@returns { number }
	 */
	public getMinOffset() : number
	{
		return this.minOffset;
	}

	/**
	 * 	get latest/max Offset
	 * 	@returns { number }
	 */
	public getMaxOffset() : number
	{
		return this.maxOffset;
	}

	/**
	 * 	load lastOffset/maxOffset from local database
	 * 	@returns {Promise< number >}
	 */
	public loadOffset() : Promise< PushClientItem >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const pushClientItem : PushClientItem | null = await this.pushClientStorageService.get( pushClientStorageKey );
				if ( ! pushClientItem )
				{
					return resolve( {
						minOffset : 0,
						maxOffset : 0,
					});
				}

				//	...
				resolve( pushClientItem );
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

			//	...
			const pushClientItem : PushClientItem = {
				minOffset : this.minOffset,
				maxOffset : this.maxOffset,
			};
			await this.pushClientStorageService.put( pushClientStorageKey, pushClientItem );
			//const readItem : PushClientItem | null = await this.pushClientStorageService.get( pushClientStorageKey );
			//console.log( `)) flushed lastOffset to local storage, lastOffset in db : `, readItem );

		}, 3000 );
	}
	//
	// protected threadOffsetFlusher() : Promise<void>
	// {
	// 	return new Promise( async ( resolve, reject ) =>
	// 	{
	// 		try
	// 		{
	// 			if ( ! this.pushClientStorageService )
	// 			{
	// 				return reject( `${ this.constructor.name }.threadOffsetFlusher :: uninitialized this.pushClientStorageService` );
	// 			}
	//
	// 			//	...
	// 			const pushClientItem : PushClientItem = {
	// 				lastOffset : this.lastOffset,
	// 			};
	// 			await this.pushClientStorageService.put( pushClientStorageKey, pushClientItem );
	//
	// 			//	...
	// 			resolve();
	// 		}
	// 		catch ( err )
	// 		{
	// 			reject( err );
	// 		}
	// 	});
	// }
}
