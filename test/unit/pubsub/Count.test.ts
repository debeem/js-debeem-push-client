import { describe, expect } from '@jest/globals';
import {
	CountRequest,
	PublishRequest,
	PushClient,
	PushServerResponse,
	SubscribeRequest,
	VaPushServerResponse
} from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";


/**
 *	unit test
 */
describe( "Count", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "Count", () =>
	{
		it( "should return unread count by .startTimestamp", async () =>
		{
			let receivedEvents: any[] = [];

			/**
			 *	@param channel		{string}
			 *	@param event		{string}
			 *	@param callback		{( ack : any ) => void}
			 */
			const callbackEventReceiver = ( channel : string, event: any, callback: any ) =>
			{
				const errorEvent = VaPushServerResponse.validatePushServerResponse( event );
				if ( null !== errorEvent )
				{
					console.warn( `callbackEventReceiver :: errorEvent :`, errorEvent );
					return;
				}

				//console.log( `)) 🔔 Client : received event from server: `, event );
				//	    )) 🔔 Client : received event from server:  {
				//       timestamp: 1730902346970,
				//       serverId: '642a5817-1923-4148-b20c-0e0ed4641616',
				//       version: '1.0.0',
				//       status: 200,
				//       data: {
				//         timestamp: 1730902346970,
				//         wallet: '0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357',
				//         deviceId: '',
				//         channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
				//         hash: '0x794364503745ad1190ad3edc24be65d3cb71eeeca6a3a4a42aea192b01c3b684',
				//         sig: '0x35c3250cfc85a7644efaab6c987d8d847172264d6536c065e872b1227bc71dee567991e8a9c7d876bc6ebeff091e27240e7a1cba1a03e23b09afd3a8cc4437ff1b',
				//         body: { index: 5, time: '11/6/2024, 10:12:26 PM' }
				//       }
				//     }
				receivedEvents.push( event );
				receivedEvents.sort( ( a, b ) => a.timestamp - b.timestamp );
			}


			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `pch-metabeem-store-${ testWalletObjList.bob.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				//serverUrl : `http://localhost:6501`
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );

			//
			//	Alice publish some events to the channel
			//
			let firstTimestamp = 0;
			let lastTimestamp = 0;
			const maxPublishedCount = 20;
			for ( let i = 0; i < maxPublishedCount; i++ )
			{
				lastTimestamp = Date.now();
				if ( 0 === i )
				{
					firstTimestamp = lastTimestamp;
				}

				//	...
				let publishRequest : PublishRequest = {
					timestamp : lastTimestamp,
					wallet : testWalletObjList.alice.address,
					deviceId : ``,
					channel : channel,
					hash : ``,
					sig : ``,
					body : {
						index : i,
						time : new Date().toLocaleString(),
						"postHash": "0xf9f3f8687a8a0eaf77827ea007270c6987f9d563fdbf7cb80d8f51f141e8d691",
						"timestamp": 1731291629673,
						"hash": "0xc04ce18f621a912b27124865a227edf5f9fae5de06e89ebafc534d6f0132ddb6",
						"version": "1.0.0",
						"deleted": "000000000000000000000000",
						"wallet": "0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8",
						"sig": "0x03b411ec8b19723e9b86712bd5863b88c35e9f8bed8700f0a850ee4fffad95e5135e1474594a90745c99b93872d0f09044e895e0f10a46317d41b4998735b85e1c",
						"authorName": "Bob",
						"authorAvatar": "https://avatars.githubusercontent.com/u/142800322?v=4",
						"replyTo": "Alice",
						"replyToWallet": "0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357",
						"postSnippet": "post name abc",
						"body": "Hello 1",
						"pictures": [],
						"videos": [],
						"bitcoinPrice": 26888,
						"statisticView": 0,
						"statisticRepost": 0,
						"statisticQuote": 0,
						"statisticLike": 0,
						"statisticFavorite": 0,
						"statisticReply": 0,
						"remark": "no ...",
						"createdAt": "2024-11-11T02:20:29.673Z",
						"updatedAt": "2024-11-11T02:20:29.673Z"
					}

				};
				//console.log( `🎾 will publish an event to server: ${ pushClientOptions.serverUrl } :`, publishRequest );
				publishRequest.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequest );
				publishRequest.hash = await Web3Digester.hashObject( publishRequest );
				const response : PushServerResponse = await pushClient.publish( publishRequest );
				//console.log( `Client : server response of the publish request: `, response );
				await TestUtil.sleep( 100 );
			}

			//
			//	Bob subscribes to the channel
			//
			let subscribeRequest : SubscribeRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.bob.address,
				deviceId : deviceId,
				deviceStatus : `working`,
				offset : 0,
				channel : channel,
				hash : ``,
				sig : ``
			};
			subscribeRequest.sig = await Web3Signer.signObject( testWalletObjList.bob.privateKey, subscribeRequest );
			subscribeRequest.hash = await Web3Digester.hashObject( subscribeRequest );
			const subscribeResponse : PushServerResponse = await pushClient.subscribe( subscribeRequest, callbackEventReceiver );
			//console.log( `Client : 🐹 server response of the subscription request: `, subscribeResponse );
			expect( subscribeResponse && 200 === subscribeResponse.status ).toBeTruthy();
			//	wait 1 second
			await TestUtil.sleep( 1000 );

			//
			//	count all
			//
			const countRequest1 : CountRequest = {
				options : [
					{
						timestamp : new Date().getTime(),
						wallet : testWalletObjList.bob.address,
						deviceId : deviceId,
						channel : channel,
						startTimestamp: 0,
						endTimestamp: -1,
						lastElement: 10
					}
				]
			};
			const countResponse1 : PushServerResponse = await pushClient.count( countRequest1 );
			//console.log( `countResponse1 :`, countResponse1 );
			//console.log( `countResponse1.data :`, countResponse1.data );
			//	    countResponse1.data : {
			//       resultList: [
			//         {
			//           channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
			//           count: 383,
			//           lastElementList: [Array]
			//         }
			//       ]
			//     }

			//	...
			expect( countResponse1 ).not.toBeNull();
			expect( countResponse1.data ).not.toBeNull();
			expect( countResponse1 ).not.toBeNull();
			expect( countResponse1.data ).not.toBeNull();
			expect( countResponse1.data.resultList ).not.toBeNull();
			expect( Array.isArray( countResponse1.data.resultList ) ).toBeTruthy();
			expect( countResponse1.data.resultList.length ).toBeGreaterThan( 0 );
			for ( const item of countResponse1.data.resultList )
			{
				expect( item ).not.toBeNull();
				expect( _.isObject( item ) ).toBeTruthy();
				expect( item.channel ).toBe( channel );
				expect( item.count ).toBeGreaterThanOrEqual( 0 );
				expect( Array.isArray( item.lastElementList ) ).toBeTruthy();
				//console.log( `item.lastElementList :`, item.lastElementList );
				//	item.lastElementList : [
				//       {
				//         channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
				//         timestamp: 1730978478672,
				//         data: {
				//           timestamp: 1730978478672,
				//           serverId: 'f1a0277f-a907-4d98-945a-3c1884c323c4',
				//           version: '1.0.0',
				//           status: 200,
				//           data: [Object]
				//         }
				//       },
				//	 ...
				//     ]

				//	because it returns a maximum of 3 records.
				expect( item.lastElementList.length ).toBeLessThanOrEqual( 3 );
			}

			await TestUtil.sleep( 1000 );


			//	startTimestamp
			//
			//	count all
			//
			const countRequest2 : CountRequest = {
				options : [
					{
						timestamp : new Date().getTime(),
						wallet : testWalletObjList.bob.address,
						deviceId : deviceId,
						channel : channel,
						startTimestamp: firstTimestamp,
						endTimestamp: -1,
						lastElement: 10
					}
				]
			};
			const countResponse2 : PushServerResponse = await pushClient.count( countRequest2 );
			//console.log( `countResponse2 :`, countResponse2 );
			//	    countResponse2.data : {
			//       resultList: [
			//         {
			//           channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
			//           count: 20,
			//           lastElementList: [Array]
			//         }
			//       ]
			//     }

			//console.log( `countResponse2.data :`, countResponse2.data );
			//	    countResponse2.data : {
			//       resultList: [
			//         {
			//           channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
			//           count: 20,
			//           lastElementList: [Array]
			//         }
			//       ]
			//     }

			expect( countResponse2 ).not.toBeNull();
			expect( countResponse2.data ).not.toBeNull();
			expect( countResponse2 ).not.toBeNull();
			expect( countResponse2.data ).not.toBeNull();
			expect( countResponse2.data.resultList ).not.toBeNull();
			expect( Array.isArray( countResponse2.data.resultList ) ).toBeTruthy();
			expect( countResponse2.data.resultList.length ).toBeGreaterThan( 0 );
			expect( countResponse2.data.resultList[ 0 ].channel ).toBe( channel );
			expect( countResponse2.data.resultList[ 0 ].count ).toBe( maxPublishedCount );
			expect( Array.isArray( countResponse2.data.resultList[ 0 ].lastElementList ) ).toBeTruthy();

			//	because it returns a maximum of 3 records
			expect( countResponse2.data.resultList[ 0 ].lastElementList.length ).toBeLessThanOrEqual( 3 );

			pushClient.close();
			await TestUtil.sleep( 3000 );

		}, 25000 );
	} );
} );
