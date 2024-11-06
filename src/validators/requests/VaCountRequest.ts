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

		if ( ! Array.isArray( countRequest.options ) )
		{
			return `invalid countRequest.options`;
		}
		if ( 0 === countRequest.options.length )
		{
			return `invalid countRequest.options :: empty list`;
		}

		for ( let i = 0; i < countRequest.options.length; i ++ )
		{
			const option = countRequest.options[ i ];
			const errorTimestamp : string | null = VaTimestamp.validateTimestampStrictly( option.timestamp );
			if ( null !== errorTimestamp )
			{
				return `invalid countRequest.options[ ${ i } ].timestamp, ${ errorTimestamp }`;
			}

			if ( ! EtherWallet.isValidAddress( option.wallet ) )
			{
				return `invalid countRequest.options[ ${ i } ].wallet`;
			}
			if ( ! _.isString( option.deviceId ) )
			{
				return `invalid countRequest.options[ ${ i } ].deviceId`;
			}

			const errorChannel : string | null = VaChannel.validateChannel( option.channel );
			if ( null !== errorChannel )
			{
				return `invalid countRequest.options[ ${ i } ].channel :: ${ errorChannel }`;
			}

			if ( undefined !== option.startTimestamp )
			{
				if ( ! _.isNumber( option.startTimestamp ) )
				{
					return `invalid countRequest.options[ ${ i } ].startTimestamp`;
				}
			}

			if ( undefined !== option.endTimestamp )
			{
				if ( ! _.isNumber( option.endTimestamp ) )
				{
					return `invalid countRequest.options[ ${ i } ].endTimestamp`;
				}
			}

			if ( undefined !== option.lastElement )
			{
				if ( ! _.isNumber( option.lastElement ) )
				{
					return `invalid countRequest.options[ ${ i } ].lastElement`;
				}
			}
		}

		return null;
	}
}
