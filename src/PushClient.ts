import { defaultSendingRetry, defaultSendingTimeout, PushClientOptions } from "./models/PushClientOptions";
import { VaPushClientOptions } from "./validators/VaPushClientOptions";
import { DeviceIdUtil } from "./utils/DeviceIdUtil";
import { SubscribeRequest } from "./models/requests/SubscribeRequest";
import { UnsubscribeRequest } from "./models/requests/UnsubscribeRequest";
import { PublishRequest } from "./models/requests/PublishRequest";


/**
 * 	@class
 */
export class PushClient
{
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
	}


	/**
	 * 	publish
	 *	@param publishRequest	{PublishRequest}
	 *	@returns {Promise<void>}
	 */
	public publish( publishRequest : PublishRequest ) : Promise<void>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				//	subscribe
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	start listening
	 *
	 * 	@param subscribeRequest		{SubscribeRequest}
	 * 	@returns {Promise<void>}
	 */
	public subscribe( subscribeRequest : SubscribeRequest ) : Promise<void>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				//	subscribe
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	stop listening
	 *
	 * 	@param unsubscribeRequest	{UnsubscribeRequest}
	 * 	@returns {Promise<void>}
	 */
	public unsubscribe( unsubscribeRequest : UnsubscribeRequest ) : Promise<void>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				//	unsubscribe
			}
			catch ( err )
			{
				reject( err );
			}
		});
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
}
