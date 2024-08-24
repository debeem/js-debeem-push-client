import { IConnector } from "../../IConnector";
import { PushClientOptions } from "../../../models/PushClientOptions";
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


/**
 * 	@class
 */
export class WebsocketConnector implements IConnector
{
	/**
	 * 	push client options
	 */
	options !: PushClientOptions;

	/**
	 * 	client socket
	 */
	socket ! : Socket;


	constructor( options : PushClientOptions )
	{
		//	...
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
			console.log( `connected to server, socket.id :`, this.socket.id );
		} );
		this.socket.on( `connect_error`, () =>
		{
			console.log( `connect error, will reconnect later ...` )
			setTimeout( () =>
			{
				this.socket.connect();
			}, 1000 );
		} );
		this.socket.on( `disconnect`, ( reason ) =>
		{
			console.log( `disconnected from server, socket.id :`, this.socket.id );
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
			console.log( `Client :: received a publish response:`, response );
		} );
		this.socket.on( `subscribe`, ( response : PushServerResponse ) =>
		{
			console.log( `Client :: received subscribe response:`, response );
		} );
		this.socket.on( `unsubscribe`, ( response : PushServerResponse ) =>
		{
			console.log( `Client :: received unsubscribe response:`, response );
		} );
		this.socket.on( `status`, ( response : PushServerResponse ) =>
		{
			console.log( `Client :: received status response:`, response );
		} );
		this.socket.on( `pull`, ( response : PushServerResponse ) =>
		{
			console.log( `Client :: received pull response:`, response );
		} );
		this.socket.on( `event`, ( response : PushServerResponse, ackCallback : ( ack : any ) => void ) =>
		{
			console.log( `received event: `, response );
			console.log( `received event: ackCallback :`, ackCallback );
			console.log( `received event: ackCallback is function: `, _.isFunction( ackCallback ) );

			if ( _.isFunction( this.options.receiveEventCallback ) )
			{
				//	.payload.body is encrypted string
				this.options.receiveEventCallback( response, ( ack : any ) =>
				{
					console.log( `receiveEventCallback ack:`, ack );
				} );
			}

			//
			//	send ack
			//
			if ( _.isFunction( ackCallback ) )
			{
				console.log( `received event: will call callback` );
				ackCallback( {
					status : `ok`
				} );
			}
			else
			{
				console.log( `received event: callback is not a function` );
			}
		} );
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
				const error : string | null = VaPublishRequest.validateVaPublishRequest( publishRequest );
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
				resolve({});
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