import { PushClientOffsetItem } from "../entities/PushClientEntity";


if ( typeof process !== 'undefined' && process.env )
{
	//import "fake-indexeddb/auto";
	require('fake-indexeddb/auto');
}

import { AbstractStorageService } from "./AbstractStorageService";
import { IStorageService } from "./IStorageService";
import { openDB, StoreNames } from "idb";
import { IDBPDatabase } from "idb/build/entry";
import _ from "lodash";


/**
 * 	@class
 */
export class PushClientStorageService extends AbstractStorageService<PushClientOffsetItem> implements IStorageService
{
	protected db !: IDBPDatabase<PushClientOffsetItem>;
	protected storeName !: StoreNames<PushClientOffsetItem>;

	constructor()
	{
		super( 'debeem_push_client_entity' );
		this.autoIncrementKey = true;
		this.storeName = 'root';
	}

	protected async init()
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( this.db )
				{
					return resolve( this.db );
				}
				if ( ! _.isString( this.databaseName ) || _.isEmpty( this.databaseName ) )
				{
					return reject( `${ this.constructor.name }.init :: invalid databaseName` );
				}

				const _this = this;
				this.db = await openDB<PushClientOffsetItem>
				(
					this.databaseName,
					this.version,
					{
						upgrade( db )
						{
							db.createObjectStore( _this.storeName );
							//const store = db.createObjectStore( _this.storeName );
							//store.createIndex( 'by-roomId', 'roomId' );
						},
					});
				if ( ! this.db )
				{
					return reject( `${ this.constructor.name }.init :: failed to init database` );
				}

				resolve( this.db );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param item	{any}
	 *	@returns {string | null}
	 */
	public validateValidItem( item : any ) : string | null
	{
		if ( ! _.isObject( item ) )
		{
			return `invalid item`;
		}
		// if ( ! _.isNumber( item.minOffset ) )
		// {
		// 	return `invalid item.minOffset`;
		// }
		// if ( ! _.isNumber( item.maxOffset ) )
		// {
		// 	return `invalid item.maxOffset`;
		// }

		return null;
	}

	/**
	 * 	get a storage key
	 *
	 *	@param value	{PushClientOffsetItem}
	 *	@returns {string | null}
	 */
	public getKeyByItem( value : PushClientOffsetItem ) : string | null
	{
		return null;
	}
}
