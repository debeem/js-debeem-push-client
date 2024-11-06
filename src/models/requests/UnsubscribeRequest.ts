import { BaseRequest } from "../BaseRequest";

export interface UnsubscribeRequest extends BaseRequest
{
	/**
	 * 	hash value
	 */
	hash : string;

	/**
	 * 	signature
	 */
	sig : string;
}
