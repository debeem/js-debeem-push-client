import { v4 as UUIDv4 } from "uuid";
import _ from "lodash";

/**
 * 	@class
 */
export class ServerIdUtil
{
	public static generateServerId() : string
	{
		return UUIDv4().toString();
	}

	public static isValidServerId( serverId : any ) : boolean
	{
		return _.isString( serverId ) && ! _.isEmpty( serverId );
	}
}