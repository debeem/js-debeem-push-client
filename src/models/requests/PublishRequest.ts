export interface PublishRequest
{
	/**
	 * 	type
	 */
	type ?: string;

	/**
	 * 	timestamp on device
	 */
	timestamp : number;

	/**
	 * 	publisher's wallet / account
	 */
	wallet : string;

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

	/**
	 * 	body
	 */
	body : any;
}