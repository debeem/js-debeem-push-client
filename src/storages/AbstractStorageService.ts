import { IDBPDatabase } from "idb/build/entry";
import { openDB, StoreNames } from "idb";
import { StorageEntity } from "../entities/StorageEntity";
import { PageUtil } from "debeem-utils";
import { ConditionCallback, HandlerCallback, IStorageService } from "./IStorageService";
import { PaginationOptions } from "../models/PaginationOptions";
import { TestUtil } from "debeem-utils";
import _ from "lodash";


/**
 * 	abstract class AbstractStorageService
 */
export abstract class AbstractStorageService<T> implements IStorageService
{
	protected db ! : IDBPDatabase<StorageEntity> | any;
	protected databaseName ! : string;
	protected version ! : number;
	protected storeName ! : StoreNames<StorageEntity> | any;
	protected autoIncrementKey : boolean = false;


	protected constructor( databaseName : string )
	{
		this.databaseName = databaseName;
		this.version = 1;
		this.storeName = 'root';
		this.autoIncrementKey = false;
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
				this.db = await openDB<StorageEntity>
				(
					this.databaseName,
					this.version,
					{
						upgrade( db )
						{
							if ( _this.autoIncrementKey )
							{
								db.createObjectStore( _this.storeName, {
									//	The 'id' property of the object will be the key.
									keyPath: 'id',
									//	if it isn't explicitly set, create a value by auto incrementing.
									autoIncrement: true,
								} );
							}
							else
							{
								db.createObjectStore( _this.storeName );
							}
						},
					} );
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
		} );
	}

	/**
	 *	@param item	{any}
	 *	@returns { string | null }
	 */
	validateValidItem( item : any ) : string | null
	{
		return `unknown error`;
	}

	/**
	 * 	delete all items
	 * 	@returns {Promise<boolean>}
	 */
	public async clear() : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				await this.init();
				await this.db.clear( 'root' );
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param key	- wallet address is the key
	 *	@returns {Promise<boolean>}
	 */
	public async delete( key : string ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! _.isString( key ) || _.isEmpty( key ) )
				{
					return reject( `${ this.constructor.name }.delete :: invalid key for .delete` );
				}

				await this.init();
				await this.db.delete( 'root', key );
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	get item by key
	 *	@param key
	 *	@returns {Promise<* | null>}
	 */
	public async get( key : string ) : Promise<T | null>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! _.isString( key ) || _.isEmpty( key ) )
				{
					return reject( `${ this.constructor.name }.get :: invalid key for .get` );
				}

				await this.init();
				await TestUtil.sleep( 1 );

				const value : T | null = await this.db.get( 'root', key );
				resolve( value ? value : null );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	Put an item into the database, and will replace the item with the same key.
	 *	@param key
	 *	@param value
	 *	@returns {Promise<boolean>}
	 */
	public async put( key : string, value : T ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( null !== this.validateValidItem( value ) )
				{
					return reject( `${ this.constructor.name }.put :: invalid value for :put` );
				}
				if ( ! _.isString( key ) || _.isEmpty( key ) )
				{
					return reject( `${ this.constructor.name }.put :: invalid key for :put` );
				}

				//	...
				await this.init();
				await this.db.put( this.storeName, value, key );
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	get the first item
	 * 	@returns {Promise<* | null>}
	 */
	public async getFirst() : Promise<T | null>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const firstItems : Array<T | null> | null = await this.getAll( undefined, 1 );
				if ( Array.isArray( firstItems ) && 1 === firstItems.length )
				{
					return resolve( firstItems[ 0 ] );
				}

				//	...
				resolve( null );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	get all of keys
	 *	@param query
	 *	@param maxCount
	 *	@returns {Promise<Array<string> | null>}
	 */
	public async getAllKeys( query? : string, maxCount? : number ) : Promise<Array<string> | null>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				await this.init();
				const value : Array<string> | null = await this.db.getAllKeys( 'root', query, maxCount );
				resolve( value ? value : null );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	query all items
	 *	@param query
	 *	@param maxCount
	 *	@returns {Promise<Array< * | null > | null>}
	 */
	public async getAll( query? : string, maxCount? : number ) : Promise<Array<T | null> | null>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				await this.init();
				const list : Array<T> | null = await this.db.getAll( 'root', query, maxCount );
				resolve( list );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	query items
	 *	@param condition	{ConditionCallback}
	 *	@param pageOptions	{PaginationOptions}
	 *	@returns {Promise<Array< * | null > | null>}
	 */
	public async query( condition ?: ConditionCallback, pageOptions ?: PaginationOptions ) : Promise<Array<T | null> | null>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				await this.init();

				const pageNo : number = PageUtil.getSafePageNo( pageOptions?.pageNo );
				const pageSize : number = PageUtil.getSafePageSize( pageOptions?.pageSize );

				let objectList : Array<T | null> = [];
				const tx = this.db.transaction( this.storeName );
				let cursor = await tx.store.openCursor();
				let index = 0;
				while ( cursor )
				{
					let cursorObject : T | null = cursor.value;
					let well : boolean = true;
					if ( _.isFunction( condition ) )
					{
						//	do not check whether cursorObject equal to null or undefined
						//	just passes it to user
						well = condition( cursor.key, cursorObject, index );
					}
					if ( well )
					{
						if ( PageUtil.pageCondition( index, pageNo, pageSize ) )
						{
							objectList.push( cursorObject );
						}

						//	...
						index++;
					}

					if ( objectList.length >= pageSize )
					{
						break;
					}

					//	next
					cursor = await cursor.continue();
				}
				await tx.done;

				//	...
				resolve( objectList );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param condition	{ConditionCallback}
	 *	@param updateHandler	{HandlerCallback}
	 *	@returns {Promise<number>}
	 */
	update( condition : ConditionCallback, updateHandler : HandlerCallback ) : Promise<number>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! _.isFunction( condition ) )
				{
					return reject( `${ this.constructor.name }.update :: invalid condition` );
				}
				if ( ! _.isFunction( updateHandler ) )
				{
					return reject( `${ this.constructor.name }.update :: invalid handler` );
				}

				await this.init();

				const tx = this.db.transaction( this.storeName );
				let cursor = await tx.store.openCursor();
				let index = 0;
				let updated = 0;
				while ( cursor )
				{
					let cursorObject : T | null = cursor.value;

					//	do not check whether cursorObject equal to null or undefined
					//	just passes it to user
					if ( condition( cursor.key, cursorObject, index ) )
					{
						updateHandler( cursor.key, cursorObject, index );
						if ( cursorObject )
						{
							//cursor.update( await this.encodeItem( cursorObject ) );
							if ( await this.put( cursor.key, cursorObject ) )
							{
								updated ++;
							}
						}

						//	...
						index++;
					}

					//	next
					cursor = await cursor.continue();
				}
				await tx.done;

				//	...
				resolve( updated );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	Retrieves the number of records matching the given condition
	 *	@param condition	{ConditionCallback}
	 *	@returns {Promise<number>}
	 */
	public async count( condition ?: ConditionCallback ) : Promise<number>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				await this.init();
				let count : number = 0;
				if ( _.isFunction( condition ) )
				{
					const tx = this.db.transaction( this.storeName );
					let cursor = await tx.store.openCursor();
					let index = 0;
					while ( cursor )
					{
						//	decrypt
						let cursorObject : T | null = cursor.value;

						//	do not check whether cursorObject equal to null or undefined
						//	just passes it to user
						if ( condition( cursor.key, cursorObject, index ) )
						{
							count ++;
						}

						//	next
						cursor = await cursor.continue();
					}
					await tx.done;
				}
				else
				{
					count = await this.db.count( this.storeName );
				}

				//	...
				resolve( count );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param value	{any}
	 *	@returns {string | null}
	 */
	getKeyByItem( value : any ) : string | null
	{
		return null;
	}
}
