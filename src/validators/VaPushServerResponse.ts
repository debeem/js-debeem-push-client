import _ from "lodash";
import { PushServerResponse } from "../models/PushServerResponse";
import { VaTimestamp } from "./VaTimestamp";
import { ServerIdUtil } from "../utils/ServerIdUtil";


export class VaPushServerResponse
{
	/**
	 *	@param pushServerResponse	{PushServerResponse}
	 *	@returns {string | null}
	 */
	static validatePushServerResponse( pushServerResponse : any ) : string | null
	{
		if ( ! pushServerResponse )
		{
			return `invalid pushServerResponse`;
		}

		if ( undefined !== pushServerResponse.timestamp )
		{
			const errorTimestamp : string | null = VaTimestamp.validateTimestamp( pushServerResponse.timestamp );
			if ( null !== errorTimestamp )
			{
				return errorTimestamp;
			}
		}
		if ( undefined !== pushServerResponse.serverId )
		{
			if ( ! ServerIdUtil.isValidServerId( pushServerResponse.serverId ) )
			{
				return `invalid pushServerResponse.serverId`;
			}
		}
		if ( undefined !== pushServerResponse.version )
		{
			if ( ! _.isString( pushServerResponse.version ) )
			{
				return `invalid pushServerResponse.version`;
			}
		}
		if ( undefined !== pushServerResponse.status )
		{
			if ( ! _.isNumber( pushServerResponse.status ) || pushServerResponse.status <= 0 )
			{
				return `invalid pushServerResponse.status`;
			}
		}

		return null;
	}
}