import { v4 as UUIDv4 } from "uuid";
import _ from "lodash";

/**
 * 	@class
 */
export class DeviceIdUtil
{
	public static generateDeviceId() : string
	{
		return UUIDv4().toString();
	}

	public static isValidDeviceId( deviceId : any ) : boolean
	{
		return _.isString( deviceId ) && ! _.isEmpty( deviceId );
	}
}