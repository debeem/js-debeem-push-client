import _ from "lodash";
import { IConnector } from "../connectors/IConnector";
import { PullRequest } from "../models/requests/PullRequest";
import { PushServerResponse } from "../models/PushServerResponse";
import { EtherWallet, Web3Signer, Web3Validator } from "debeem-id";
import { VaPullRequest } from "../validators/requests/VaPullRequest";
import { TestUtil } from "debeem-utils";
import { Logger, LoggerUtil } from "../utils/LoggerUtil";


/**
 * 	@class
 */
export class SyncService
{
	/**
	 * 	log
	 */
	log : Logger = new LoggerUtil().logger;



	/**
	 * 	pull events from server
	 *
	 * 	@param connector	{IConnector}
	 * 	@param pullRequest	{PullRequest}
	 * 	@returns {Promise< Array<PushServerResponse> >}
	 */
	public pullEvents( connector : IConnector, pullRequest : PullRequest ) : Promise< Array<PushServerResponse> >
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! connector )
				{
					return reject( `${ this.constructor.name }.pullEvents :: invalid connector` );
				}
				if ( null !== VaPullRequest.validatePullRequest( pullRequest ) )
				{
					return reject( `${ this.constructor.name }.pullEvents :: invalid pullRequest` );
				}

				let maxLoop : number = 1000;
				let pulledEvents : Array<PushServerResponse> = [];
				while( true )
				{
					if ( -- maxLoop <= 0 )
					{
						break;
					}

					//	...
					const pullResponse : PushServerResponse = await connector.pull( pullRequest );
					const result : any = pullResponse?.data?.result;
					if ( ! result )
					{
						this.log.warn( `${ this.constructor.name }.pullEvents :: null pull result` );
						continue;
					}
					if ( ! _.isNumber( result.total ) ||
						! _.isNumber( result.pageKey ) ||
						! Array.isArray( result.list ) )
					{
						this.log.warn( `${ this.constructor.name }.pullEvents :: invalid result format : `, result );
						continue;
					}

					for ( let publishedItem of result.list )
					{
						//console.log( `publishedItem :`, publishedItem );
						//	publishedItem : {
						//       channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
						//       timestamp: 1724268783988,
						//       data: {
						//         timestamp: 1724268783988,
						//         serverId: 'd1322dc6-9aa2-4a54-b074-eb2ab8748bdf',
						//         version: '1.0.0',
						//         status: 200,
						//         data: {
						//           timestamp: 1724268783988,
						//           wallet: '0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357',
						//           channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
						//           hash: '0x702129610f3477dbb69605226a04fbce2ba53531bcaebb958f385235b6aea266',
						//           sig: '0xf0c842aff6eae31bed6e1f163d419599e92a8395a13183f5769bf1ad30522aaf5c8ffa84734465a8581f65555e541497e337ac5d644be015c56ed7f56998ac401b',
						//           body: [Object]
						//         }
						//       }
						//     }
						if ( ! publishedItem ||
							! publishedItem.data ||
							! publishedItem.data.data )
						{
							continue;
						}

						const itemWallet = publishedItem?.data?.data?.wallet;
						const itemData = publishedItem?.data?.data;
						const itemSig = publishedItem?.data?.data?.sig;
						if ( ! EtherWallet.isValidAddress( itemWallet ) ||
							! Web3Signer.isValidSig( itemSig ) ||
							! await Web3Validator.validateObject( itemWallet, itemData, itemSig ) )
						{
							continue;
						}

						//	...
						pulledEvents.push( publishedItem.data );
					}

					const pageKey = result.pageKey;
					if ( ! pageKey || 0 === pageKey )
					{
						this.log.debug( `${ this.constructor.name }.pullEvents :: 🦄 pageKey === 0, stop pulling from server` );
						break;
					}

					//	apply the next request
					pullRequest.offset = pageKey;
					await TestUtil.sleep( 60 );
				}

				//	...
				resolve( pulledEvents );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
}
