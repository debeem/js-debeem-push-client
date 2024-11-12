import { DBSchema } from "idb";


/**
 * 	push client storage key
 */
export const pushClientStorageKey : string = `push_client_storage_key`;


/**
 * 	@interface
 */
export interface PushClientOffsetItem
{
	minOffset : number;
	maxOffset : number;
}

export const defaultPushClientMinOffset = Number.MAX_VALUE;
export const defaultPushClientMaxOffset = 0;
export const defaultPushClientOffsetItem =
{
	minOffset : defaultPushClientMinOffset,
	maxOffset : defaultPushClientMaxOffset
};

/**
 * 	@interface
 */
export interface PushClientEntity extends DBSchema
{
	//	store name
	root : {
		key : string;
		value : PushClientOffsetItem;
		//indexes : { 'by-key' : string };
	};
}
