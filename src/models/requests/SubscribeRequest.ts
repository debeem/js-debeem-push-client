import { BaseRequest } from "../BaseRequest";


/**
 * 	define the channel string length range
 */
export const minLengthSubscribeChannel : number		= 32;
export const maxLengthSubscribeChannel : number		= 256;


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
}
