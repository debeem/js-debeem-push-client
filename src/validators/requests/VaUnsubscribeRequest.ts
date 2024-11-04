import _ from "lodash";
import { EtherWallet, Web3Signer } from "debeem-id";
import { Web3Digester } from "debeem-id";
import { VaChannel } from "../VaChannel";
import { VaTimestamp } from "../VaTimestamp";

export class VaUnsubscribeRequest
{
	static validateUnsubscribeRequest( unsubscribeRequest : any ) : string | null
	{
		if ( ! unsubscribeRequest )
		{
			return `invalid unsubscribeRequest`;
		}

		const errorTimestamp : string | null = VaTimestamp.validateTimestampStrictly( unsubscribeRequest.timestamp );
		if ( null !== errorTimestamp )
		{
			return `invalid unsubscribeRequest.timestamp, ${ errorTimestamp }`;
		}

		if ( ! EtherWallet.isValidAddress( unsubscribeRequest.wallet ) )
		{
			return `invalid unsubscribeRequest.wallet`;
		}
		if ( ! _.isString( unsubscribeRequest.deviceId ) || _.isEmpty( unsubscribeRequest.deviceId ) )
		{
			return `invalid unsubscribeRequest.deviceId`;
		}

		const errorChannel : string | null = VaChannel.validateChannel( unsubscribeRequest.channel );
		if ( null !== errorChannel )
		{
			return `invalid unsubscribeRequest.channel :: ${ errorChannel }`;
		}

		if ( ! Web3Digester.isValidHash( unsubscribeRequest.hash ) )
		{
			return `invalid unsubscribeRequest.hash`;
		}
		if ( ! Web3Signer.isValidSig( unsubscribeRequest.sig ) )
		{
			return `invalid unsubscribeRequest.sig`;
		}

		return null;
	}
}
