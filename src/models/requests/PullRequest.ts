import { PaginationOptions } from "../PaginationOptions";
import { BaseRequest } from "../BaseRequest";

export interface PullRequest extends BaseRequest
{
	/**
	 *	offset = start timestamp
	 */
	offset : number;

	/**
	 * 	pull options
	 */
	options ?: PaginationOptions;
}
