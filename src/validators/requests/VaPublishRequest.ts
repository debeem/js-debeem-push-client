import _ from "lodash";
import { EtherWallet, Web3Signer } from "debeem-id";
import { Web3Digester } from "debeem-id";
import { VaTimestamp } from "../VaTimestamp";
import { VaChannel } from "../VaChannel";

export class VaPublishRequest
{
	static validateVaPublishRequest( publishRequest : any ) : string | null
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

		const errorTimestamp : string | null = VaTimestamp.validateTimestamp( publishRequest.timestamp );
		if ( null !== errorTimestamp )
		{
			return errorTimestamp;
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
