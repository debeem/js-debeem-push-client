import { describe, expect } from '@jest/globals';
import {
	PaginationOrder,
	PublishRequest,
	PullRequest,
	PushClient,
	PushServerResponse,
	SubscribeRequest, VaChannel,
	VaPushServerResponse
} from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";


/**
 *	unit test
 */
describe( "PullPch", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "Pull", () =>
	{
		it( "#pull ASC/DESC", async () =>
		{
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const wallet : string = `0x8e3b27841cacdc3a68724bbc38b9390eb3f8c47c`;
			const privateKey : string = `0x64eca90384ae8dba5492d504cea66298e9438cee6954328127d2b4776660f996`;
			const channel : string = `pch-mb-post-${ wallet }`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );

			let receivedEvents: any[] = [];

			/**
			 *	@param channel		{string}
			 *	@param event		{any}
			 *	@param callback		{( ack : any ) => void}
			 */
			const callbackEventReceiver = ( channel : string, event: any, callback: any ) =>
			{
				const errorChannel : string | null = VaChannel.validateChannel( channel );
				if ( null !== errorChannel )
				{
					console.warn( `callbackEventReceiver :: errorChannel :`, errorChannel );
					return;
				}

				const errorEvent = VaPushServerResponse.validatePushServerResponse( event );
				if ( null !== errorEvent )
				{
					console.warn( `callbackEventReceiver :: errorEvent :`, errorEvent );
					return;
				}

				//console.log( `)) 🔔 Client : received event from server: `, event );
				//	Client : 🔔 received event from server:  {
				//       timestamp: 1724273039193,
				//       serverId: '28c726b7-0acf-4102-bd88-810f5494478c',
				//       version: '1.0.0',
				//       status: 200,
				//       data: {
				//         timestamp: 1724273039193,
				//         wallet: '0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357',
				//         channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
				//         hash: '0x266305d1b1b5157f335ec5b2a9066fbfed38d2f82da82886fe2283add1918fdb',
				//         sig: '0x979ce436889c0b59b2b94e67c11b4875cd93f403896b150036f98df972d126c4755fe557a86a495c8b2c5b1245672918d69993ae295f72a7352dcacf2de380741c',
				//         body: { index: 2, time: '8/22/2024, 4:43:59 AM' }
				//       }
				//     }
				//	...
				receivedEvents.push( event );
				receivedEvents.sort( ( a, b ) => a.timestamp - b.timestamp );
			}

			//
			//	Bob subscribes to the channel
			//
			let subscribeRequest : SubscribeRequest = {
				timestamp : new Date().getTime(),
				wallet : wallet,
				deviceId : deviceId,
				deviceStatus : `working`,
				offset : 0,
				channel : channel,
				hash : ``,
				sig : ``,
				skipAutoPullingData: true,
			};
			subscribeRequest.sig = await Web3Signer.signObject( privateKey, subscribeRequest );
			subscribeRequest.hash = await Web3Digester.hashObject( subscribeRequest );
			const subscribeResponse = await pushClient.subscribe( subscribeRequest, callbackEventReceiver );
			//console.log( `Client : 🐹 server response of the subscription request: `, subscribeResponse );
			expect( subscribeResponse && 200 === subscribeResponse.status ).toBeTruthy();
			//	wait 1 second
			await TestUtil.sleep( 1000 );

			//
			//	Bob pull the messages
			//
			let lastDeviceOffset = 0;
			const pullRequestAsc : PullRequest = {
				timestamp : new Date().getTime(),
				wallet : wallet,
				deviceId : deviceId,
				channel : channel,
				offset : lastDeviceOffset,
				options : {
					pageNo : 1,
					pageSize : 100,
					order : PaginationOrder.ASC
				}
			};
			const pullResponseAsc : PushServerResponse = await pushClient.pull( pullRequestAsc );
			console.log( `pullResponseAsc :`, pullResponseAsc );
			//
			//	pullResponseAsc : {
			//       status: 200,
			//       data: { result: { totalMembers: 4, total: 4, pageKey: 0, list: [Array] } },
			//       serverId: 'f40e9abf-71b8-4989-bf13-6412232e6eab',
			//       timestamp: 1731854714734,
			//       version: '1.0.0'
			//     }
			//
			expect( pullResponseAsc ).toBeDefined();
			expect( pullResponseAsc ).toHaveProperty( `status` );
			expect( pullResponseAsc ).toHaveProperty( `data` );
			expect( pullResponseAsc ).toHaveProperty( `serverId` );
			expect( pullResponseAsc ).toHaveProperty( `timestamp` );
			expect( pullResponseAsc ).toHaveProperty( `version` );
			expect( pullResponseAsc.status ).toBe( 200 );
			expect( pullResponseAsc.data ).toHaveProperty( `result` );
			expect( pullResponseAsc.data.result ).toHaveProperty( `totalMembers` );
			expect( pullResponseAsc.data.result ).toHaveProperty( `total` );

			const pullRequestDesc : PullRequest = {
				timestamp : new Date().getTime(),
				wallet : wallet,
				deviceId : deviceId,
				channel : channel,
				offset : -1,
				options : {
					pageNo : 1,
					pageSize : 100,
					order : PaginationOrder.DESC
				}
			};
			const pullResponseDesc : PushServerResponse = await pushClient.pull( pullRequestDesc );
			console.log( `pullResponseDesc :`, pullResponseDesc );
			//
			//	pullResponseDesc : {
			//       status: 200,
			//       data: { result: { totalMembers: 4, total: 4, pageKey: 0, list: [Array] } },
			//       serverId: 'f40e9abf-71b8-4989-bf13-6412232e6eab',
			//       timestamp: 1731854714818,
			//       version: '1.0.0'
			//     }
			//
			expect( pullResponseDesc ).toBeDefined();
			expect( pullResponseDesc ).toHaveProperty( `status` );
			expect( pullResponseDesc ).toHaveProperty( `data` );
			expect( pullResponseDesc ).toHaveProperty( `serverId` );
			expect( pullResponseDesc ).toHaveProperty( `timestamp` );
			expect( pullResponseDesc ).toHaveProperty( `version` );
			expect( pullResponseDesc.status ).toBe( 200 );
			expect( pullResponseDesc.data ).toHaveProperty( `result` );
			expect( pullResponseDesc.data.result ).toHaveProperty( `totalMembers` );
			expect( pullResponseDesc.data.result ).toHaveProperty( `total` );

			expect( pullResponseAsc.data.result.totalMembers ).toBe( pullResponseDesc.data.result.totalMembers );
			expect( pullResponseAsc.data.result.total ).toBe( pullResponseDesc.data.result.total );

			pushClient.close();
			await TestUtil.sleep( 3000 );

		}, 60 * 10e3 );
	} );
} );
