import { BaseRequest } from "../BaseRequest";


/**
 * 	define the channel string length range
 */
export const minLengthSubscribeChannel : number		= 45;
export const maxLengthSubscribeChannel : number		= 64;


export interface SubscribeRequest extends BaseRequest
{
	/**
	 * 	current device status
	 */
	deviceStatus ?: string;

	/**
	 * 	the offset value of the queue of the subscribed channel
	 */
	offset ?: number;

	/**
	 * 	hash value
	 */
	hash : string;

	/**
	 * 	signature
	 */
	sig : string;

	/**
	 *	whether to skip the automatic event fetching process from the server after a successful subscription
	 *	default to false
	 */
	skipAutoPullingData ?: boolean;
}
