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


/**
 * 	@class
 */
export class WebsocketConnector implements IConnector
{
	/**
	 * 	push client options
	 */
	options !: ConnectorOptions;

	/**
	 * 	client socket
	 */
	socket ! : Socket;

	/**
	 *	log
	 */
	log : Logger = new LoggerUtil().logger


	constructor( options : ConnectorOptions )
	{
		//	...
		this.options = options;
		this.socket = SocketClient( this.options.serverUrl );

		//	...
		this.setupEvents();
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
		} );
		this.socket.on( `connect_error`, () =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[connect_error] :: connect error, will reconnect later ...` )
			setTimeout( () =>
			{
				this.socket.connect();
			}, 1000 );
		} );
		this.socket.on( `disconnect`, ( reason ) =>
		{
			this.log.debug( `${ this.constructor.name }.setupEvents on[disconnect] :: disconnected from server, socket.id :`, this.socket.id );
			if ( `io server disconnect` === reason )
			{
				//	the disconnection was initiated by the server, you need to reconnect manually
				this.socket.connect();
			}
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
			this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: `, response );
			this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: ackCallback :`, ackCallback );
			this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: received event: ackCallback is function: `, _.isFunction( ackCallback ) );

			if ( _.isFunction( this.options.serverEventReceiver ) )
			{
				this.options.serverEventReceiver( response, ackCallback );
			}

			//
			//	send ack
			//
			if ( _.isFunction( ackCallback ) )
			{
				this.log.debug( `${ this.constructor.name }.setupEvents on[event] :: will call callback to server` );
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
	public publish( publishRequest : PublishRequest ) : Promise< PushServerResponse >
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
		});
	}

	/**
	 * 	@implements
	 *	@param subscribeRequest		{SubscribeRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public subscribe( subscribeRequest : SubscribeRequest ) : Promise< PushServerResponse >
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
		});
	}

	/**
	 * 	@implements
	 *	@param unsubscribeRequest	{UnsubscribeRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public unsubscribe( unsubscribeRequest : UnsubscribeRequest ) : Promise< PushServerResponse >
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
		});
	}

	/**
	 * 	@implements
	 *	@param statusRequest	{StatusRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	status( statusRequest : StatusRequest ) : Promise< PushServerResponse >
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
		});
	}

	/**
	 * 	@implements
	 *	@param pullRequest	{PullRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public pull( pullRequest : PullRequest ) : Promise< PushServerResponse >
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
		});
	}

	/**
	 * 	@implements
	 *	@param countRequest	{CountRequest}
	 *	@returns {Promise< PushServerResponse >}
	 */
	public count( countRequest : CountRequest ) : Promise< PushServerResponse >
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
		});
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
		});
	}
}
