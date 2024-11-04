import _ from "lodash";
import { EtherWallet, Web3Signer } from "debeem-id";
import { Web3Digester } from "debeem-id";
import { VaChannel } from "../VaChannel";
import { VaTimestamp } from "../VaTimestamp";

export class VaSubscribeRequest
{
	static validateSubscribeRequest( subscribeRequest : any ) : string | null
	{
		if ( ! subscribeRequest )
		{
			return `invalid subscribeRequest`;
		}

		const errorTimestamp : string | null = VaTimestamp.validateTimestampStrictly( subscribeRequest.timestamp );
		if ( null !== errorTimestamp )
		{
			return `invalid subscribeRequest.timestamp, ${ errorTimestamp }`;
		}

		if ( ! EtherWallet.isValidAddress( subscribeRequest.wallet ) )
		{
			return `invalid subscribeRequest.wallet`;
		}
		if ( ! _.isString( subscribeRequest.deviceId ) || _.isEmpty( subscribeRequest.deviceId ) )
		{
			return `invalid subscribeRequest.deviceId`;
		}

		if ( undefined !== subscribeRequest.deviceStatus )
		{
			if ( ! _.isString( subscribeRequest.deviceStatus ) )
			{
				return `invalid subscribeRequest.deviceStatus`;
			}
		}
		if ( undefined !== subscribeRequest.offset )
		{
			if ( ! _.isNumber( subscribeRequest.offset ) )
			{
				return `invalid subscribeRequest.offset`;
			}
		}

		const errorChannel : string | null = VaChannel.validateChannel( subscribeRequest.channel );
		if ( null !== errorChannel )
		{
			return `invalid subscribeRequest.channel :: ${ errorChannel }`;
		}

		if ( ! Web3Digester.isValidHash( subscribeRequest.hash ) )
		{
			return `invalid subscribeRequest.hash`;
		}
		if ( ! Web3Signer.isValidSig( subscribeRequest.sig ) )
		{
			return `invalid subscribeRequest.sig`;
		}

		return null;
	}
}
