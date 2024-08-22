import _ from "lodash";
import { io, Socket } from "socket.io-client";
import { TestUtil } from "debeem-utils";
import { isHexString } from "ethers";
import { defaultSendingRetry, defaultSendingTimeout, PushClientOptions } from "./models/PushClientOptions";
import { VaPushClientOptions } from "./validators/VaPushClientOptions";
import { DeviceIdUtil } from "./utils/DeviceIdUtil";
import { ResponseCallback } from "./models/callbacks/ResponseCallback";

/**
 * 	@class
 */
export class PushClient
{
	/**
	 * 	client socket
	 */
	socket ! : Socket;

	/**
	 * 	push client options
	 */
	options !: PushClientOptions;


	/**
	 *	@param options	{PushClientOptions}
	 */
	constructor( options : PushClientOptions )
	{
		this.options = this.optimizeOptions( options );
		this.socket = io( this.options.serverUrl );

		//	...
		this._setupEvents();
	}

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


	/**
	 * 	setup
	 *	@private
	 *	@returns {void}
	 */
	private _setupEvents() : void
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

		/**
		 * 	for room
		 */
		this.socket.on( `room-join`, ( response : JoinRoomResponse ) =>
		{
			console.log( `Client :: received room-join response:`, response );
		} );
		this.socket.on( `room-leave`, ( response : LeaveRoomResponse ) =>
		{
			console.log( `Client :: received room-leave response:`, response );
		} );
		this.socket.on( `chat-message`, ( sendMessageRequest : SendMessageRequest, callback : ( ack : any ) => void ) =>
		{
			console.log( `received chat-message: `, sendMessageRequest );
			console.log( `received chat-message: callback :`, callback );
			console.log( `received chat-message: callback is function: `, _.isFunction( callback ) );
			if ( _.isFunction( callback ) )
			{
				console.log( `received chat-message: will call callback` );
				callback( {
					status : `ok`
				} );
			}
			else
			{
				console.log( `received chat-message: callback is not a function` );
			}
			if ( _.isFunction( this.receiveMessageCallback ) )
			{
				//	.payload.body is encrypted string
				this.receiveMessageCallback( sendMessageRequest, ( ack : any ) =>
				{
					console.log( `ReceiveMessageCallback ack:`, ack );
				} );
			}
		} );
	}

	/**
	 *	@param joinRoomRequest	{JoinRoomRequest}
	 *	@param [callback]	{ResponseCallback}
	 *	@returns {void}
	 */
	public joinRoom( joinRoomRequest : JoinRoomRequest, callback ? : ResponseCallback ) : void
	{
		const errorJoinRoomRequest : string | null = VaJoinRoomRequest.validateJoinRoomRequest( joinRoomRequest );
		if ( null !== errorJoinRoomRequest )
		{
			throw new Error( `${ this.constructor.name }.joinRoom :: ${ errorJoinRoomRequest }` );
		}
		this.send( `room-join`, joinRoomRequest, callback );
	}

	/**
	 * 	asynchronously join a room
	 *
	 *	@param joinRoomRequest	{JoinRoomRequest}
	 *	@returns {Promise< JoinRoomResponse | null >}
	 */
	public joinRoomAsync( joinRoomRequest : JoinRoomRequest ) : Promise< JoinRoomResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorJoinRoomRequest : string | null = VaJoinRoomRequest.validateJoinRoomRequest( joinRoomRequest );
				if ( null !== errorJoinRoomRequest )
				{
					return reject( `${ this.constructor.name }.joinRoomAsync :: ${ errorJoinRoomRequest }` );
				}

				const response : any = await this.sendAsync( `room-join`, joinRoomRequest );
				resolve( response ? response as JoinRoomResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 *	@param leaveRoomRequest		{LeaveRoomRequest}
	 *	@param [callback]		{ResponseCallback}
	 *	@returns {void}
	 */
	public leaveRoom( leaveRoomRequest : LeaveRoomRequest, callback ? : ResponseCallback ) : void
	{
		const errorLeaveRoomRequest : string | null = VaLeaveRoomRequest.validateLeaveRoomRequest( leaveRoomRequest );
		if ( null !== errorLeaveRoomRequest )
		{
			throw new Error( `${ this.constructor.name }.leaveRoom :: ${ errorLeaveRoomRequest }` );
		}
		this.send( `room-leave`, leaveRoomRequest, callback );
	}

	/**
	 * 	asynchronously leave a room
	 *
	 *	@param leaveRoomRequest		{LeaveRoomRequest}
	 *	@returns {Promise<any>}
	 */
	public leaveRoomAsync( leaveRoomRequest : LeaveRoomRequest ) : Promise< LeaveRoomResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorLeaveRoomRequest : string | null = VaLeaveRoomRequest.validateLeaveRoomRequest( leaveRoomRequest );
				if ( null !== errorLeaveRoomRequest )
				{
					return reject( `${ this.constructor.name }.leaveRoomAsync :: ${ errorLeaveRoomRequest }` );
				}

				const response : any = await this.sendAsync( `room-leave`, leaveRoomRequest );
				resolve( response ? response as LeaveRoomResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 * 	@deprecated
	 *
	 *	@param existInRoomRequest	{ExistRoomRequest}
	 *	@param [callback]		{ResponseCallback}
	 *	@returns {void}
	 */
	public existInRoom( existInRoomRequest : ExistRoomRequest, callback ? : ResponseCallback ) : void
	{
		return this.existRoom( existInRoomRequest, callback );
	}

	/**
	 *	check if a room is existed
	 *
	 *	@param existInRoomRequest	{ExistRoomRequest}
	 *	@param [callback]		{ResponseCallback}
	 *	@returns {void}
	 */
	public existRoom( existInRoomRequest : ExistRoomRequest, callback ? : ResponseCallback ) : void
	{
		const errorExistInRoomRequest : string | null = VaExistRoomRequest.validateExistRoomRequest( existInRoomRequest );
		if ( null !== errorExistInRoomRequest )
		{
			throw new Error( `${ this.constructor.name }.existRoom :: ${ errorExistInRoomRequest }` );
		}
		this.send( `room-exist`, existInRoomRequest, callback );
	}

	/**
	 * 	asynchronously check if a room is existed
	 *
	 *	@param existInRoomRequest	{ExistRoomRequest}
	 *	@returns {Promise< ExistRoomResponse | null >}
	 */
	public existRoomAsync( existInRoomRequest : ExistRoomRequest ) : Promise< ExistRoomResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorExistInRoomRequest : string | null = VaExistRoomRequest.validateExistRoomRequest( existInRoomRequest );
				if ( null !== errorExistInRoomRequest )
				{
					return reject( `${ this.constructor.name }.existRoomAsync :: ${ errorExistInRoomRequest }` );
				}

				const response : any = await this.sendAsync( `room-exist`, existInRoomRequest );
				resolve( response ? response as ExistRoomResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 *	@param sendMessageRequest	{SendMessageRequest}
	 *	@param [callback]		{ResponseCallback}
	 *	@returns {void}
	 */
	public sendMessage( sendMessageRequest : SendMessageRequest, callback ? : ResponseCallback ) : void
	{
		const errorSendMessageRequest : string | null = VaSendMessageRequest.validateSendMessageRequest( sendMessageRequest );
		if ( null !== errorSendMessageRequest )
		{
			throw new Error( `${ this.constructor.name }.sendMessage :: ${ errorSendMessageRequest }` );
		}

		//	...
		this.send( `chat-message`, sendMessageRequest, callback );
	}

	/**
	 * 	asynchronously sent chat message
	 *
	 *	@param sendMessageRequest	{SendMessageRequest}
	 *	@returns {Promise< SendMessageResponse | null >}
	 */
	public sendMessageAsync( sendMessageRequest : SendMessageRequest ) : Promise< SendMessageResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorSendMessageRequest : string | null = VaSendMessageRequest.validateSendMessageRequest( sendMessageRequest );
				if ( null !== errorSendMessageRequest )
				{
					return reject( `${ this.constructor.name }.sendMessageAsync :: ${ errorSendMessageRequest }` );
				}

				//	...
				const response : any = await this.sendAsync( `chat-message`, sendMessageRequest );
				resolve( response ? response as SendMessageResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 *	@param privateKey	{string}
	 *	@param chatMessage	{ChatMessage}
	 *	@param [callback]	{ResponseCallback}
	 */
	public sendPrivateMessage( privateKey : string, chatMessage : ChatMessage, callback ? : ResponseCallback ) : void
	{
		new PrivateMessageBuilder().buildMessage( privateKey, chatMessage ).then( ( sendMessageRequest : SendMessageRequest ) =>
		{
			this.sendMessage( sendMessageRequest, callback );

		}).catch( err =>
		{
			throw new Error( err );
		});
	}

	/**
	 *	asynchronously send private message
	 *
	 * 	@param privateKey	{string}
	 * 	@param chatMessage	{ChatMessage}
	 * 	@returns {Promise< SendMessageResponse | null >}
	 */
	public sendPrivateMessageAsync( privateKey : string, chatMessage : ChatMessage ) : Promise< SendMessageResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! isHexString( privateKey, 32 ) )
				{
					return reject( `${ this.constructor.name }.sendPrivateMessageAsync :: invalid privateKey` );
				}
				if ( ! _.isObject( chatMessage ) )
				{
					return reject( `${ this.constructor.name }.sendPrivateMessageAsync :: invalid chatMessage` );
				}

				//	...
				const sendMessageRequest : SendMessageRequest = await new PrivateMessageBuilder().buildMessage( privateKey, chatMessage );
				const response : any = await this.sendMessageAsync( sendMessageRequest );
				resolve( response ? response as SendMessageResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 *	@param privateKey	{string}
	 *	@param chatMessage	{ChatMessage}
	 *	@param pinCode		{string}
	 *	@param [callback]	{ResponseCallback}
	 */
	public sendGroupMessage( privateKey : string, chatMessage : ChatMessage, pinCode : string, callback ? : ResponseCallback ) : void
	{
		new GroupMessageBuilder().buildMessage( privateKey, chatMessage, pinCode ).then( ( sendMessageRequest : SendMessageRequest ) =>
		{
			this.sendMessage( sendMessageRequest, callback );

		}).catch( err =>
		{
			throw new Error( err );
		});
	}

	/**
	 * 	asynchronously send group message
	 *
	 *	@param privateKey	{string}
	 *	@param chatMessage	{ChatMessage}
	 *	@param pinCode		{string}
	 *	@returns {Promise< SendMessageResponse | null >}
	 */
	public sendGroupMessageAsync( privateKey : string, chatMessage : ChatMessage, pinCode : string ) : Promise< SendMessageResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const sendMessageRequest : SendMessageRequest = await new GroupMessageBuilder().buildMessage( privateKey, chatMessage, pinCode );
				const response : any = await this.sendMessageAsync( sendMessageRequest );
				resolve( response ? response as SendMessageResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 *	@param pullMessageRequest	{PullMessageRequest}
	 *	@param [callback]		{ResponseCallback}
	 *	@returns {void}
	 */
	public pullMessage( pullMessageRequest : PullMessageRequest, callback ? : ResponseCallback ) : void
	{
		const errorPullMessageRequest : string | null = VaPullMessageRequest.validatePullMessageRequest( pullMessageRequest );
		if ( null !== errorPullMessageRequest )
		{
			throw new Error( `${ this.constructor.name }.pullMessage :: ${ errorPullMessageRequest }` );
		}

		//	...
		this.send( `pull-message`, pullMessageRequest, callback );
	}

	/**
	 *	asynchronously pull message
	 *
	 *	@param pullMessageRequest	{PullMessageRequest}
	 *	@returns {Promise< PullMessageResponse | null >}
	 */
	public pullMessageAsync( pullMessageRequest : PullMessageRequest ) : Promise< PullMessageResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorPullMessageRequest : string | null = VaPullMessageRequest.validatePullMessageRequest( pullMessageRequest );
				if ( null !== errorPullMessageRequest )
				{
					return reject( `${ this.constructor.name }.pullMessageAsync :: ${ errorPullMessageRequest }` );
				}

				//	...
				const response : any = await this.sendAsync( `pull-message`, pullMessageRequest );
				resolve( response ? response as PullMessageResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 *	@param countMessageRequest	{CountMessageRequest}
	 *	@param callback			{ResponseCallback}
	 *	@returns {void}
	 */
	public countMessage( countMessageRequest : CountMessageRequest, callback ? : ResponseCallback ) : void
	{
		const errorCountMessageRequest : string | null = VaCountMessageRequest.validateCountMessageRequest( countMessageRequest );
		if ( null !== errorCountMessageRequest )
		{
			throw new Error( `${ this.constructor.name }.countMessage :: ${ errorCountMessageRequest }` );
		}

		//	...
		this.send( `count-message`, countMessageRequest, callback );
	}

	/**
	 * 	asynchronously count message
	 *
	 *	@param countMessageRequest	{CountMessageRequest}
	 *	@returns {Promise< CountMessageResponse | null >}
	 */
	public countMessageAsync( countMessageRequest : CountMessageRequest ) : Promise< CountMessageResponse | null >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorCountMessageRequest : string | null = VaCountMessageRequest.validateCountMessageRequest( countMessageRequest );
				if ( null !== errorCountMessageRequest )
				{
					return reject( `${ this.constructor.name }.countMessageAsync :: ${ errorCountMessageRequest }` );
				}

				//	...
				const response : any = await this.sendAsync( `count-message`, countMessageRequest );
				resolve( response ? response as CountMessageResponse : null );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}



	/**
	 * 	send event
	 *
	 *	@param eventName	{string}
	 *	@param arg		{any}
	 *	@param [callback]	{ResponseCallback}
	 *	@param [retry]		{number}
	 */
	public send( eventName : string, arg : any, callback ? : ResponseCallback, retry ? : number ) : void
	{
		/**
		 * 	@description
		 * 	https://socket.io/docs/v4/
		 */
		this.socket.timeout( this.options.sendingTimeout! ).emit( eventName, arg, ( err : any, response : any ) =>
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
					throw new Error( `${ this.constructor.name }.send :: failed to send event : ${ eventName }, arg: ${ arg }`, );
				}

				//	...
				this.send( eventName, arg, callback, ++retry );
			}
			else if ( _.isFunction( callback ) )
			{
				callback( response );
			}
		} );
	}

	/**
	 * 	asynchronously send event
	 *
	 *	@param eventName	{string}
	 *	@param arg		{any}
	 *	@param [retry]		{number}
	 *	@returns {Promise<any>}
	 */
	public sendAsync( eventName : string, arg : any, retry ? : number ) : Promise<any>
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
							return reject( `${ this.constructor.name }.sendAsync :: failed to send event : ${ eventName }, arg: ${ arg }` );
						}

						//	...
						await TestUtil.sleep( 10 );
						response = await this.sendAsync( eventName, arg, ++retry );
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
