import { BaseRequest } from "../BaseRequest";


/**
 * 	count
 */
export interface CountOptionItem extends BaseRequest
{
	/**
	 *	when an exact search cannot precisely find the specified member,
	 *	allow searching for the closest one instead
	 */
	allowClosestMemberSearch ?: boolean;

	/**
	 * 	if the user specifies this parameter,
	 * 	statistics will start from this parameter.
	 * 	default to 0
	 */
	startTimestamp ?: number;

	/**
	 * 	if the user specifies this parameter,
	 * 	statistics will end with this parameter.
	 * 	default to -1
	 */
	endTimestamp ?: number;

	/**
	 * 	if the user specifies this parameter,
	 * 	the last [lastElement] elements will be returned.
	 */
	lastElement ?: number;
}

export interface CountRequest
{
	options : Array< CountOptionItem >;
}
