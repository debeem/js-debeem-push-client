import _ from "lodash";
import { PushClientOptions } from "../models/PushClientOptions";
import { ServerUrlUtil } from "../utils/ServerUrlUtil";


export class VaPushClientOptions
{
	public static validatePushClientOptions( pushClientOptions : PushClientOptions ) : string | null
	{
		if ( ! pushClientOptions )
		{
			return `invalid pushClientOptions`;
		}

		//
		//	documentation:
		//	https://socket.io/docs/v3/client-initialization/
		//
		//	the following forms are similar
		//	const socket = io( "https://server-domain.com" );
		//	const socket = io( "wss://server-domain.com" );
		//
		//	only in the browser when the page is served over https (will not work in Node.js)
		//	const socket = io( "server-domain.com" );
		//
		if ( ! _.isString( pushClientOptions.serverUrl ) ||
			_.isEmpty( pushClientOptions.serverUrl ) )
		{
			return `invalid pushClientOptions.serverUrl`;
		}
		if ( ! ServerUrlUtil.isWebsocket( pushClientOptions.serverUrl ) )
		{
			//	const socket = io( "https://server-domain.com" );
			//	const socket = io( "wss://server-domain.com" );
			return `invalid pushClientOptions.serverUrl, invalid format`;
		}

		if ( undefined !== pushClientOptions.sendingTimeout )
		{
			const errorSendingTimeout = this.validatePushClientOptionsSendingTimeout( pushClientOptions.sendingTimeout );
			if ( null !== errorSendingTimeout )
			{
				return errorSendingTimeout;
			}
		}
		if ( undefined !== pushClientOptions.sendingRetry )
		{
			const errorSendingRetry = this.validatePushClientOptionsSendingRetry( pushClientOptions.sendingRetry );
			if ( null !== errorSendingRetry )
			{
				return errorSendingRetry;
			}
		}

		return null;
	}

	static validatePushClientOptionsSendingTimeout( sendingTimeout : any ) : string | null
	{
		if ( ! _.isNumber( sendingTimeout ) || sendingTimeout <= 0 )
		{
			return `invalid pushClientOptions.sendingTimeout`;
		}

		return null;
	}

	static validatePushClientOptionsSendingRetry( sendingRetry : any ) : string | null
	{
		if ( ! _.isNumber( sendingRetry ) || sendingRetry <= 0 )
		{
			return `invalid pushClientOptions.sendingRetry`;
		}

		return null;
	}
}