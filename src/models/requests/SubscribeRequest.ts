/**
 * 	define the channel string length range
 */
export const minLengthSubscribeChannel : number		= 32;
export const maxLengthSubscribeChannel : number		= 256;





export interface SubscribeRequest
{
	/**
	 * 	timestamp on device
	 */
	timestamp : number;

	/**
	 * 	wallet / account
	 */
	wallet : string;

	/**
	 * 	the globally unique id of the current device.
	 * 	one account may have multiple devices.
	 */
	deviceId : string;

	/**
	 * 	current device status
	 */
	deviceStatus ?: string;

	/**
	 * 	the offset value of the queue of the subscribed channel
	 */
	offset ?: number;

	/**
	 * 	the channel that a user subscribes to
	 */
	channel : string;

	/**
	 * 	hash value
	 */
	hash : string;

	/**
	 * 	signature
	 */
	sig : string;
}