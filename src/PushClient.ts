import { defaultSendingRetry, defaultSendingTimeout, PushClientOptions } from "./models/PushClientOptions";
import { VaPushClientOptions } from "./validators/VaPushClientOptions";
import { DeviceIdUtil } from "./utils/DeviceIdUtil";
import { SubscribeRequest } from "./models/requests/SubscribeRequest";
import { UnsubscribeRequest } from "./models/requests/UnsubscribeRequest";
import { PublishRequest } from "./models/requests/PublishRequest";
import { WebsocketConnector } from "./connectors/impls/websocket/WebsocketConnector";
import { ConnectorMap, IConnector } from "./connectors/IConnector";
import { ServerUrlUtil } from "./utils/ServerUrlUtil";
import { PushServerResponse } from "./models/PushServerResponse";
import { ClientReceiveEventCallback } from "./models/callbacks/ClientReceiveEventCallback";
import { defaultEventPoolSize, EventPool } from "./pools/EventPool";
import { SyncService } from "./services/SyncService";
import { PullRequest } from "./models/requests/PullRequest";
import { PushClientItem } from "./entities/PushClientEntity";
import { CountRequest } from "./models/requests/CountRequest";
import _ from "lodash";


/**
 * 	@class
 */
export class PushClient
{
	/**
	 * 	push client options
	 */
	protected options ! : PushClientOptions;

	/**
	 * 	event pool
	 */
	public eventPool !: EventPool;

	/**
	 * 	services
	 */
	protected syncService !: SyncService;

	/**
	 * 	connectors
	 */
	protected connectorMap !: ConnectorMap;
	protected currentConnector !: IConnector;


	/**
	 *	@param options	{PushClientOptions}
	 */
	constructor( options : PushClientOptions )
	{
		this.options = this.optimizeOptions( options );

		/**
		 * 	create event pool
		 */
		this.eventPool = new EventPool({
			maxSize : defaultEventPoolSize,
		});

		/**
		 * 	create services
		 */
		this.syncService = new SyncService();

		/**
		 * 	create connectors
		 */
		this.connectorMap = {
			ws : new WebsocketConnector({
				...this.options,
				receiveEventCallback : this.eventPool.callbackEventReceiver
			})
		};
		if ( ServerUrlUtil.isWebsocket( this.options.serverUrl ) )
		{
			//	use Websocket connector
			this.currentConnector = this.connectorMap.ws;
		}
		if ( ! this.currentConnector )
		{
			throw new Error( `empty connector` );
		}
	}


	/**
	 * 	publish
	 *
	 *	@param publishRequest	{PublishRequest}
	 * 	@returns {Promise<PushServerResponse>}
	 */
	public publish( publishRequest : PublishRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const response : PushServerResponse = await this.currentConnector.publish( publishRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	start listening
	 *
	 * 	@param subscribeRequest		{SubscribeRequest}
	 * 	@param callback			{ClientReceiveEventCallback}
	 * 	@returns {Promise<PushServerResponse>}
	 */
	public subscribe( subscribeRequest : SubscribeRequest, callback : ClientReceiveEventCallback ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				//	subscribe
				const responseSub : PushServerResponse = await this.currentConnector.subscribe( subscribeRequest );
				if ( responseSub &&
					200 === responseSub.status )
				{
					//	...
					this.eventPool.setCallback( callback );

					//
					//	todo
					//	add channel for loadOffset
					//

					//	load maxOffset/maxTimestamp
					const loadedOffset : PushClientItem = await this.eventPool.loadOffset();
					let pullOffset = loadedOffset.maxOffset;
					if ( _.isNumber( subscribeRequest.offset ) &&
						subscribeRequest.offset > pullOffset )
					{
						pullOffset = subscribeRequest.offset;
					}

					//
					//	pull events from server
					//
					const pullRequest : PullRequest = {
						timestamp : Date.now(),
						wallet : subscribeRequest.wallet,
						deviceId : subscribeRequest.deviceId,
						channel : subscribeRequest.channel,
						offset : pullOffset			//	startTimestamp
					};
					const pulledEvents : Array<PushServerResponse>
						= await this.syncService.pullEvents( this.currentConnector, pullRequest );
					if ( Array.isArray( pulledEvents ) )
					{
						for ( const event of pulledEvents )
						{
							this.eventPool.addEvent( event );
						}
					}
				}

				resolve( responseSub );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	stop listening
	 *
	 * 	@param unsubscribeRequest	{UnsubscribeRequest}
	 * 	@returns {Promise<PushServerResponse>}
	 */
	public unsubscribe( unsubscribeRequest : UnsubscribeRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const response : PushServerResponse = await this.currentConnector.unsubscribe( unsubscribeRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	pull
	 *
	 * 	@param pullRequest	{PullRequest}
	 * 	@returns {Promise<PushServerResponse>}
	 */
	public pull( pullRequest : PullRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const response : PushServerResponse = await this.currentConnector.pull( pullRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	count
	 *
	 * 	@param countRequest	{CountRequest}
	 * 	@returns {Promise<PushServerResponse>}
	 */
	public count( countRequest : CountRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const response : PushServerResponse = await this.currentConnector.count( countRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	optimize options
	 *	@param options	{PushClientOptions}
	 *	@returns {PushClientOptions}
	 *	@private
	 */
	private optimizeOptions( options : PushClientOptions ) : PushClientOptions
	{
		const errorOptions : string | null = VaPushClientOptions.validatePushClientOptions( options );
		if ( null !== errorOptions )
		{
			throw new Error( `${ this.constructor.name }.optimizeOptions :: ${ errorOptions }` );
		}

		//	...
		let optimizedOptions : PushClientOptions = options;
		if ( ! DeviceIdUtil.isValidDeviceId( optimizedOptions.deviceId ) )
		{
			optimizedOptions.deviceId = DeviceIdUtil.generateDeviceId();
		}

		if ( null !== VaPushClientOptions.validatePushClientOptionsSendingTimeout( optimizedOptions.sendingTimeout ) )
		{
			optimizedOptions.sendingTimeout = defaultSendingTimeout;
		}
		if ( null !== VaPushClientOptions.validatePushClientOptionsSendingRetry( optimizedOptions.sendingRetry ) )
		{
			optimizedOptions.sendingRetry = defaultSendingRetry;
		}

		return optimizedOptions;
	}
}
