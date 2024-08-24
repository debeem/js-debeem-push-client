import _ from "lodash";
import { maxLengthSubscribeChannel, minLengthSubscribeChannel } from "../models/requests/SubscribeRequest";


export class VaChannel
{
	/**
	 * 	@param channel	{any}
	 * 	@returns {string | null}
	 */
	static validateChannel( channel : any ) : string | null
	{
		if ( ! _.isString( channel ) )
		{
			return `invalid .channel`;
		}
		if ( channel.length < minLengthSubscribeChannel || channel.length > maxLengthSubscribeChannel )
		{
			return `length of .channel exceeds limit to ${ minLengthSubscribeChannel }-${ maxLengthSubscribeChannel }`;
		}
		if ( ! channel.startsWith( 'pch' ) && ! channel.startsWith( 'bch' ) )
		{
			return `invalid .channel, invalid format(must start with [pch] or [bch])`;
		}

		return null;
	}
}