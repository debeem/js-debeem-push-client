import { BaseRequest } from "../BaseRequest";


/**
 * 	client reports status data and
 * 	obtains its subscription information on the server
 */
export interface StatusRequest extends BaseRequest
{
	/**
	 * 	current device status
	 */
	deviceStatus ?: string;

	/**
	 * 	the offset value of the queue of the subscribed channel
	 */
	offset ?: number;
}
