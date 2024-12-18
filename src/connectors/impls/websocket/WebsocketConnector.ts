import { IConnector } from "../../IConnector";
import { ConnectorOptions } from "../../../models/PushClientOptions";
import { io as SocketClient, Socket } from "socket.io-client";
import _ from "lodash";
import { TestUtil } from "debeem-utils";
import { PublishRequest } from "../../../models/requests/PublishRequest";
import { PushServerResponse } from "../../../models/PushServerResponse";
import { SubscribeRequest } from "../../../models/requests/SubscribeRequest";
import { UnsubscribeRequest } from "../../../models/requests/UnsubscribeRequest";
import { PullRequest } from "../../../models/requests/PullRequest";
import { StatusRequest } from "../../../models/requests/StatusRequest";
import { VaPublishRequest } from "../../../validators/requests/VaPublishRequest";
import { VaSubscribeRequest } from "../../../validators/requests/VaSubscribeRequest";
import { VaUnsubscribeRequest } from "../../../validators/requests/VaUnsubscribeRequest";
import { VaStatusRequest } from "../../../validators/requests/VaStatusRequest";
import { VaPullRequest } from "../../../validators/requests/VaPullRequest";
import { LoggerUtil, Logger } from "../../../utils/LoggerUtil";
import { CountRequest } from "../../../models/requests/CountRequest";
import { VaCountRequest } from "../../../validators/requests/VaCountRequest";
import { CallbackNetworkStatusListener } from "../../../models/callbacks/NetworkStatusListener";


/**
 * 	@class
 */
export class WebsocketConnector implements IConnector
{
	/**
	 * 	push client options
	 */
	options ! : ConnectorOptions;

	/**
	 * 	client socket
	 */
	socket ! : Socket;

	/**
	 * 	hello interval
	 */
	helloInterval : any;

	/**
	 * 	network status listener
	 */
	callbackNetworkStatusListener ! : CallbackNetworkStatusListener;

	/**
	 *	log
	 */
	log : Logger = new LoggerUtil().logger


	constructor( options : ConnectorOptions )
	{
		//	...
		this.options = options;
		this.socket = SocketClient( this.options.serverUrl, {
			/**
			 * 	should we allow reconnections?
			 */
			reconnection : true,

			/**
			 * 	how many reconnection attempts should we try?
			 */
			reconnectionAttempts : Infinity,

			/**
			 * 	the time delay in milliseconds between reconnection attempts
			 */
			reconnectionDelay : 1000,

			/**
			 * 	the max time delay in milliseconds between reconnection attempts
			 */
			reconnectionDelayMax : 3000,

			/**
			 * 	the timeout in milliseconds for our connection attempt
			 */
			timeout : 10 * 1000
		} );

		//	...
		this.setupEvents();
		//this.setupHelloThread();
	}

	/**
	 * 	setup
	 *	@private
	 *	@returns {void}
	 */
	private setupEvents() : void
	{
		/**
		 * 	events
		 */
		this.socket.on( `connect`, () =>
		{
			//	x8WIv7-mJelg7on_ALbx
			this.log.debug( `${ this.constructor.name }.setupEvents on[connect] :: connected to server, socket.id :`, this.socket.id );

			/**
			 * 	callback network status information
			 */
			if ( _.isFunction( this.callbackNetworkStatusListener ) )
			{
				this.callbackNetworkStatusListener( `connect`, { socket : this.socket } );
			}
		} );
		this.socket.on( `connect_error`, ( error ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[connect_error] :: connect error, will reconnect later ...` );
			if ( this.socket.active )
			{
				//	temporary failure, the socket will automatically try to reconnect
			}
			else
			{
				//	the connection was denied by the server
				//	in that case, `socket.connect()` must be manually called in order to reconnect
				this.log.error( `${ this.constructor.name }.setupEvents on[connect_error] :: connect error, denied by the server : ${ error?.message }` );
				setTimeout( () =>
				{
					this.socket.connect();

				}, 1000 );
			}

			/**
			 * 	callback network status information
			 */
			if ( _.isFunction( this.callbackNetworkStatusListener ) )
			{
				this.callbackNetworkStatusListener( `connect_error`, {
					socket : this.socket,
					active : this.socket.active,
					error : error,
				} );
			}
		} );
		this.socket.on( `disconnect`, ( reason, details ) =>
		{
			/**
			 * 	https://socket.io/docs/v4/client-socket-instance/#disconnect
			 *
			 * 	io server disconnect
			 *	The server has forcefully disconnected the socket with socket.disconnect()
			 *	(do not auto reconnection)
			 *
			 * 	io client disconnect
			 * 	The socket was manually disconnected using socket.disconnect()
			 * 	(do not auto reconnection)
			 *
			 * 	ping timeout
			 * 	The server did not send a PING within the pingInterval + pingTimeout range
			 * 	(will auto reconnection)
			 *
			 * 	transport close
			 * 	The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
			 * 	(will auto reconnection)
			 *
			 * 	transport error
			 * 	The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)
			 * 	(will auto reconnection)
			 */
			this.log.debug( `${ this.constructor.name }.setupEvents on[disconnect] :: disconnected from server, socket.id: ${ this.socket.id }, reason: ${ reason }` );
			if ( this.socket.active )
			{
				//	temporary disconnection, the socket will automatically try to reconnect
			}
			else
			{
				//	the connection was forcefully closed by the server or the client itself
				//	in that case, `socket.connect()` must be manually called in order to reconnect
				this.log.debug( `${ this.constructor.name }.setupEvents on[disconnect] :: disconnected from server, forcefully closed by server or client itself, reason: ${ reason }` );
				console.warn( details );
				if ( `io server disconnect` === reason )
				{
					/**
					 * 	the server has forcefully disconnected the socket with socket.disconnect()
					 * 	try to reconnect manually
					 */
					this.socket.connect();
				}
			}

			/**
			 * 	callback network status information
			 */
			if ( _.isFunction( this.callbackNetworkStatusListener ) )
			{
				this.callbackNetworkStatusListener( `disconnect`, {
					socket : this.socket,
					active : this.socket.active,
					reason : reason,
					details : details,
				} );
			}
		} );
		this.socket.on( "reconnect", ( attemptNumber ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[reconnect] :: reconnected successfully after ${ attemptNumber } attempts.` );
		} );
		this.socket.on( "reconnect_attempt", ( attemptNumber ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[reconnect_attempt] :: attempting to reconnect... Attempt #${ attemptNumber }` );
		} );
		this.socket.on( "reconnect_failed", () =>
		{
			this.log.error( `${ this.constructor.name }.setupEvents on[reconnect_failed] :: reconnection failed. Please check your network.` );
		} );

		// this.socket.on( `message`, ( serverId : string, roomId : string, message : any ) =>
		// {
		// 	console.log( `message from server: ${ serverId }, roomId: ${ roomId }, `, message );
		// 	this.socket.emit( `ack`, `200` );
		// 	if ( _.isFunction( this.receiveMessageCallback ) )
		// 	{
		// 		this.receiveMessageCallback( serverId, roomId, message );
		// 	}
		// } );

		this.socket.on( `publish`, ( response : PushServerResponse ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[publish] :: Client :: received a publish response:`, response );
		} );
		this.socket.on( `subscribe`, ( response : PushServerResponse ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[subscribe] :: Client :: received subscribe response:`, response );
		} );
		this.socket.on( `unsubscribe`, ( response : PushServerResponse ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[unsubscribe] :: Client :: received unsubscribe response:`, response );
		} );
		this.socket.on( `status`, ( response : PushServerResponse ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[status] :: Client :: received status response:`, response );
		} );
		this.socket.on( `pull`, ( response : PushServerResponse ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[pull] :: Client :: received pull response:`, response );
		} );
		this.socket.on( `count`, ( response : PushServerResponse ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[count] :: Client :: received count response:`, response );
		} );
		this.socket.on( `event`, ( response : PushServerResponse, ackCallback : ( ack : any ) => void ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: `, { response } );
			this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: ackCallback :`, { ackCallback } );
			this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: ackCallback is function: `, { ackCallbackIsFunction : _.isFunction( ackCallback ) } );

			if ( _.isFunction( this.options.serverEventReceiver ) )
			{
				this.options.serverEventReceiver( response, ackCallback );
			}

			//
			//	send ack
			//
			if ( _.isFunction( ackCallback ) )
			{
				this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: will call callback to server` );
				ackCallback( {
					status : `ok`
				} );
			}
			else
			{
				this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: callback is not a function` );
			}
		} );
	}

	/**
	 * 	hello thread
	 *	@private
	 */
	private setupHelloThread()
	{
		if ( this.helloInterval )
		{
			clearInterval( this.helloInterval );
			this.helloInterval = null;
		}
		this.helloInterval = setInterval( async () =>
		{
			if ( ! this.socket.connected )
			{
				this.log.debug( `${ this.constructor.name }.helloThread :: not connected to server` );
				return;
			}

			this.log.debug( `${ this.constructor.name }.helloThread :: will send Hello to server` );
			const response = await this.send( `hello`, Date.now().toString() );
			this.log.debug( `${ this.constructor.name }.helloThread :: response : ${ JSON.stringify( response ) }` );

		}, 10 * 1000 );
	}

	/**
	 *	set up a callback function to listen for the network status changes
	 *
	 * 	@implements
	 * 	@param callback		{CallbackNetworkStatusListener}
	 * 	@returns { void }
	 */
	public setNetworkStatusListener( callback : CallbackNetworkStatusListener ) : void
	{
		if ( ! _.isFunction( callback ) )
		{
			throw `${ this.constructor.name }.setNetworkStatusListener :: invalid callback`;
		}

		/**
		 * 	will send network status changes about Websocket connections
		 */
		this.callbackNetworkStatusListener = callback;

		/**
		 * 	will set online/offline status
		 */
		if ( `undefined` !== typeof window && `undefined` !== typeof document )
		{
			window.addEventListener( `offline`, ( event ) =>
			{
				this.log.debug( `${ this.constructor.name }.setNetworkStatusListener :: offline, no network connection` );
				this.callbackNetworkStatusListener( `offline`, { event : event } );
			} );
			window.addEventListener( `online`, ( event ) =>
			{
				this.log.debug( `${ this.constructor.name }.setNetworkStatusListener :: online, network connected` );
				this.callbackNetworkStatusListener( `online`, { event : event } );
			} );
		}
	}

	/**
	 * 	wait until the client connected to server successfully
	 *
	 * 	@implements
	 *	@param timeout	{number} timeout in milliseconds
	 *	@returns {Promise< void >}
	 */
	public waitUntilConnected( timeout : number ) : Promise<void>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! _.isNumber( timeout ) || timeout <= 0 )
				{
					return reject( `${ this.constructor.name }.waitUntilConnected :: invalid timeout` );
				}

				const pollInterval = 100;
				let elapsed = 0;
				const intervalId = setInterval( () =>
				{
					if ( this.socket.connected )
					{
						clearInterval( intervalId );
						resolve();
					}
					else if ( elapsed >= timeout )
					{
						clearInterval( intervalId );
						return reject( `${ this.constructor.name }.waitUntilConnected :: timeout, socket did not connect within ${ timeout }ms` );
					}
					elapsed += pollInterval;

				}, pollInterval );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	close the connection to server
	 */
	public close()
	{
		if ( this.socket )
		{
			this.socket.disconnect();
		}
	}

	/**
	 * 	@implements
	 *	@param publishRequest	{PublishRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public publish( publishRequest : PublishRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const error : string | null = VaPublishRequest.validatePublishRequest( publishRequest );
				if ( null !== error )
				{
					return reject( error );
				}

				//	...
				const response : PushServerResponse = await this.send( `publish`, publishRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	@implements
	 *	@param subscribeRequest		{SubscribeRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public subscribe( subscribeRequest : SubscribeRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const error : string | null = VaSubscribeRequest.validateSubscribeRequest( subscribeRequest );
				if ( null !== error )
				{
					return reject( error );
				}

				//	...
				const response : PushServerResponse = await this.send( `subscribe`, subscribeRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	@implements
	 *	@param unsubscribeRequest	{UnsubscribeRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public unsubscribe( unsubscribeRequest : UnsubscribeRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const error : string | null = VaUnsubscribeRequest.validateUnsubscribeRequest( unsubscribeRequest );
				if ( null !== error )
				{
					return reject( error );
				}

				//	...
				const response : PushServerResponse = await this.send( `unsubscribe`, unsubscribeRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	@implements
	 *	@param statusRequest	{StatusRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	status( statusRequest : StatusRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const error : string | null = VaStatusRequest.validateStatusRequest( statusRequest );
				if ( null !== error )
				{
					return reject( error );
				}

				//	...
				const response : PushServerResponse = await this.send( `status`, statusRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	@implements
	 *	@param pullRequest	{PullRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public pull( pullRequest : PullRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const error : string | null = VaPullRequest.validatePullRequest( pullRequest );
				if ( null !== error )
				{
					return reject( error );
				}

				//	...
				const response : PushServerResponse = await this.send( `pull`, pullRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	@implements
	 *	@param countRequest	{CountRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public count( countRequest : CountRequest ) : Promise<PushServerResponse>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const error : string | null = VaCountRequest.validateCountRequest( countRequest );
				if ( null !== error )
				{
					return reject( error );
				}

				//	...
				const response : PushServerResponse = await this.send( `count`, countRequest );
				resolve( response );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	send event
	 *
	 *	@param eventName	{string}
	 *	@param arg		{any}
	 *	@param [retry]		{number}
	 *	@returns {Promise<any>}
	 */
	public send( eventName : string, arg : any, retry ? : number ) : Promise<any>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				// if ( ! this.socket.connected )
				// {
				// 	// this.socket.once(`connect`, async () =>
				// 	// {
				// 	// 	const response = await this.send( eventName, arg );
				// 	// });
				// 	return reject( `${ this.constructor.name }.send :: do not connected to server, failed to send event : ${ eventName }, arg: ${ arg }` );
				// }

				/**
				 * 	@description
				 * 	https://socket.io/docs/v4/
				 */
				this.socket.timeout( this.options.sendingTimeout! ).emit( eventName, arg, async ( err : any, response : any ) =>
				{
					if ( err )
					{
						//
						//	the other side did not acknowledge the event in the given delay.
						//	let's retry
						//
						if ( undefined === retry )
						{
							retry = 0;
						}
						if ( retry > this.options.sendingRetry! )
						{
							return reject( `${ this.constructor.name }.send :: failed to send event : ${ eventName }, arg: ${ arg }` );
						}

						//	...
						await TestUtil.sleep( 10 );
						response = await this.send( eventName, arg, ++retry );
					}

					//	...
					resolve( response );
				} );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}
