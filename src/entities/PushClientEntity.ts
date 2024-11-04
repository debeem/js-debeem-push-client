import { DBSchema } from "idb";


/**
 * 	push client storage key
 */
export const pushClientStorageKey : string = `push_client_storage_key`;


/**
 * 	@interface
 */
export interface PushClientItem
{
	minOffset : number;
	maxOffset : number;
}

/**
 * 	@interface
 */
export interface PushClientEntity extends DBSchema
{
	//	store name
	root : {
		key : string;
		value : PushClientItem;
		//indexes : { 'by-key' : string };
	};
}
