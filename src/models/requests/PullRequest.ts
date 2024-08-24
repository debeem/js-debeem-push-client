export interface PullPageOptions
{
	pageNo ?: number;
	pageSize ?: number;
}

export interface PullRequest
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
	 */
	channel : string;

	/**
	 *	offset = start timestamp
	 */
	offset : number;

	/**
	 * 	pull options
	 */
	options ?: PullPageOptions;
}