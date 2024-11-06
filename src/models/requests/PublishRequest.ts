import { BaseRequest } from "../BaseRequest";


export interface PublishRequest extends BaseRequest
{
	/**
	 * 	type
	 */
	type ?: string;

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
