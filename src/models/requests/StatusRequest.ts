/**
 * 	client reports status data and
 * 	obtains its subscription information on the server
 */
export interface StatusRequest
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
}