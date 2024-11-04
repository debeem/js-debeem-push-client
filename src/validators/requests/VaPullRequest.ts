import _ from "lodash";
import { EtherWallet } from "debeem-id";
import { VaChannel } from "../VaChannel";
import { VaTimestamp } from "../VaTimestamp";


export class VaPullRequest
{
	static validatePullRequest( pullRequest : any ) : string | null
	{
		if ( ! pullRequest )
		{
			return `invalid pullRequest`;
		}

		const errorTimestamp : string | null = VaTimestamp.validateTimestampStrictly( pullRequest.timestamp );
		if ( null !== errorTimestamp )
		{
			return `invalid pullRequest.timestamp, ${ errorTimestamp }`;
		}

		if ( ! EtherWallet.isValidAddress( pullRequest.wallet ) )
		{
			return `invalid pullRequest.wallet`;
		}
		if ( ! _.isString( pullRequest.deviceId ) || _.isEmpty( pullRequest.deviceId ) )
		{
			return `invalid pullRequest.deviceId`;
		}

		const errorChannel : string | null = VaChannel.validateChannel( pullRequest.channel );
		if ( null !== errorChannel )
		{
			return `invalid pullRequest.channel :: ${ errorChannel }`;
		}

		if ( ! _.isNumber( pullRequest.offset ) )
		{
			return `invalid pullRequest.offset`;
		}

		return null;
	}
}
