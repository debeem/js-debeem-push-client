export interface BaseRequest
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
	 * 	the channel that a user subscribes to
	 * 	// the key of the Sorted Set
	 */
	channel : string;
}
