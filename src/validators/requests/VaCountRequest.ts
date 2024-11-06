import { VaTimestamp } from "../VaTimestamp";
import { EtherWallet } from "debeem-id";
import _ from "lodash";
import { VaChannel } from "../VaChannel";

/**
 * 	@class
 */
export class VaCountRequest
{
	/**
	 *	@param countRequest			{any}
	 *	@returns {string | null}
	 */
	static validateCountRequest( countRequest : any ) : string | null
	{
		if ( ! countRequest )
		{
			return `invalid countRequest`;
		}

		const errorTimestamp : string | null = VaTimestamp.validateTimestampStrictly( countRequest.timestamp );
		if ( null !== errorTimestamp )
		{
			return `invalid countRequest.timestamp, ${ errorTimestamp }`;
		}

		if ( ! EtherWallet.isValidAddress( countRequest.wallet ) )
		{
			return `invalid countRequest.wallet`;
		}
		if ( ! _.isString( countRequest.deviceId ) )
		{
			return `invalid countRequest.deviceId`;
		}

		const errorChannel : string | null = VaChannel.validateChannel( countRequest.channel );
		if ( null !== errorChannel )
		{
			return `invalid countRequest.channel :: ${ errorChannel }`;
		}

		if ( undefined !== countRequest.startTimestamp )
		{
			if ( ! _.isNumber( countRequest.startTimestamp ) )
			{
				return `invalid countRequest.startTimestamp`;
			}
		}

		if ( undefined !== countRequest.endTimestamp )
		{
			if ( ! _.isNumber( countRequest.endTimestamp ) )
			{
				return `invalid countRequest.endTimestamp`;
			}
		}

		if ( undefined !== countRequest.lastElement )
		{
			if ( ! _.isNumber( countRequest.lastElement ) )
			{
				return `invalid countRequest.lastElement`;
			}
		}

		return null;
	}
}
