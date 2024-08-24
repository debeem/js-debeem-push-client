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


/**
 * 	@class
 */
export class PushClient
{
	/**
	 * 	push client options
	 */
	options ! : PushClientOptions;

	/**
	 * 	connectors
	 */
	connectorMap !: ConnectorMap;
	currentConnector !: IConnector;


	/**
	 *	@param options	{PushClientOptions}
	 */
	constructor( options : PushClientOptions )
	{
		this.options = this.optimizeOptions( options );

		/**
		 * 	create connectors
		 */
		this.connectorMap = {
			ws : new WebsocketConnector( this.options )
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
				if ( responseSub && 200 === responseSub.status )
				{
					this.options.receiveEventCallback = callback;

					//
					//	todo
					//	pull events
					//
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
