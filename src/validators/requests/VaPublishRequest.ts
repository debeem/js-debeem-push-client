import _ from "lodash";
import { EtherWallet, Web3Signer } from "debeem-id";
import { Web3Digester } from "debeem-id";
import { VaTimestamp } from "../VaTimestamp";
import { VaChannel } from "../VaChannel";

export class VaPublishRequest
{
	/**
	 *	@param publishRequest			{any}
	 *	@param [simpleTimestampValidation]	{boolean}
	 *	@returns {string | null}
	 */
	static validatePublishRequest( publishRequest : any, simpleTimestampValidation : boolean = false ) : string | null
	{
		if ( ! publishRequest )
		{
			return `invalid publishRequest`;
		}

		if ( publishRequest.type )
		{
			if ( ! _.isString( publishRequest.type ) )
			{
				return `invalid publishRequest.type`;
			}
		}

		if ( ! simpleTimestampValidation )
		{
			const errorTimestamp : string | null = VaTimestamp.validateTimestampStrictly( publishRequest.timestamp );
			if ( null !== errorTimestamp )
			{
				return errorTimestamp;
			}
		}
		else
		{
			if ( ! _.isNumber( publishRequest.timestamp ) )
			{
				return `invalid publishRequest.timestamp`;
			}
			if ( publishRequest.timestamp <= 0 )
			{
				return `invalid publishRequest.timestamp, too young`;
			}
		}

		if ( ! EtherWallet.isValidAddress( publishRequest.wallet ) )
		{
			return `invalid publishRequest.wallet`;
		}

		const errorChannel : string | null = VaChannel.validateChannel( publishRequest.channel );
		if ( null !== errorChannel )
		{
			return `invalid publishRequest.channel :: ${ errorChannel }`;
		}

		if ( ! Web3Digester.isValidHash( publishRequest.hash ) )
		{
			return `invalid publishRequest.hash`;
		}
		if ( ! Web3Signer.isValidSig( publishRequest.sig ) )
		{
			return `invalid publishRequest.sig`;
		}
		if ( ! publishRequest.body || _.isEmpty( publishRequest.body ) )
		{
			//
			//	may be:
			//		null
			//		undefined
			//		false
			//		0
			//		NaN
			//
			return `invalid publishRequest.body`;
		}

		return null;
	}
}
