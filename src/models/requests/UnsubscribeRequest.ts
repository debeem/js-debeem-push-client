export interface UnsubscribeRequest
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
	 * 	the channel that a user unsubscribes to
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