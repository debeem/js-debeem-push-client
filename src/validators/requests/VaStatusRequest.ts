import _ from "lodash";
import { EtherWallet, Web3Signer } from "debeem-id";
import { Web3Digester } from "debeem-id";
import { VaChannel } from "../VaChannel";
import { VaTimestamp } from "../VaTimestamp";

export class VaStatusRequest
{
	static validateStatusRequest( statusRequest : any ) : string | null
	{
		if ( ! statusRequest )
		{
			return `invalid statusRequest`;
		}

		const errorTimestamp : string | null = VaTimestamp.validateTimestampStrictly( statusRequest.timestamp );
		if ( null !== errorTimestamp )
		{
			return `invalid statusRequest.timestamp, ${ errorTimestamp }`;
		}

		if ( ! EtherWallet.isValidAddress( statusRequest.wallet ) )
		{
			return `invalid statusRequest.wallet`;
		}
		if ( ! _.isString( statusRequest.deviceId ) || _.isEmpty( statusRequest.deviceId ) )
		{
			return `invalid statusRequest.deviceId`;
		}

		if ( undefined !== statusRequest.deviceStatus )
		{
			if ( ! _.isString( statusRequest.deviceStatus ) )
			{
				return `invalid statusRequest.deviceStatus`;
			}
		}
		if ( undefined !== statusRequest.offset )
		{
			if ( ! _.isNumber( statusRequest.offset ) )
			{
				return `invalid statusRequest.offset`;
			}
		}

		const errorChannel : string | null = VaChannel.validateChannel( statusRequest.channel );
		if ( null !== errorChannel )
		{
			return `invalid statusRequest.channel :: ${ errorChannel }`;
		}

		return null;
	}
}
