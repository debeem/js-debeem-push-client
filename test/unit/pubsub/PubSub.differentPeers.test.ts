import { describe, expect } from '@jest/globals';
import { PublishRequest, PushClient, PushServerResponse, SubscribeRequest, VaPushServerResponse } from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";


/**
 *	unit test
 */
describe( "PubSub.differentPeers", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "PubSub.differentPeers", () =>
	{
		it( "should receive events from the P2P broadcast", async () =>
		{
			let firstEventLength : number = 0;
			let receivedEvents: any[] = [];

			/**
			 *	@param channel		{string}
			 *	@param event		{any}
			 *	@param callback		{( ack : any ) => void}
			 */
			const callbackEventReceiver = ( channel : string, event: any, callback: any ) =>
			{
				const errorEvent = VaPushServerResponse.validatePushServerResponse( event );
				if ( null !== errorEvent )
				{
					console.warn( `callbackEventReceiver :: [${ channel }] errorEvent :`, errorEvent );
					return;
				}

				console.log( `)) 🔔 Client : received event from server: `, event );
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

			const deviceId = `device-${ testWalletObjList.bob.address }`;
			const channel = `pch-bobo-${ testWalletObjList.bob.address }`;

			//
			//	Bob subscribes to the channel on peer 01
			//
			const pushClient01 = new PushClient( {
				deviceId : deviceId,
				serverUrl : `http://dev-node01-jpe.metabeem.com:6501`
				//serverUrl : `http://localhost:6501`
			} );
			let subscribeRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.bob.address,
				deviceId : deviceId,
				deviceStatus : `working`,
				offset : 0,
				channel : channel,
				hash : ``,
				sig : ``,
				skipAutoPullingData: true,
			};
			subscribeRequest.sig = await Web3Signer.signObject( testWalletObjList.bob.privateKey, subscribeRequest );
			subscribeRequest.hash = await Web3Digester.hashObject( subscribeRequest );
			const subscribeResponse = await pushClient01.subscribe( subscribeRequest, callbackEventReceiver );
			//console.log( `Client : 🐹 server response of the subscription request: `, subscribeResponse );
			//expect( subscribeResponse && 200 === subscribeResponse.status ).toBeTruthy();
			expect( subscribeResponse ).toBeDefined();
			expect( subscribeResponse ).toHaveProperty( `status` );
			expect( subscribeResponse ).toHaveProperty( `data` );
			expect( subscribeResponse ).toHaveProperty( `serverId` );
			expect( subscribeResponse ).toHaveProperty( `timestamp` );
			expect( subscribeResponse ).toHaveProperty( `version` );
			expect( subscribeResponse.status ).toBe( 200 );
			expect( _.isObject( subscribeResponse.data ) ).toBeTruthy();
			//	wait 1 second
			await TestUtil.sleep( 3000 );

			//	...
			expect( receivedEvents ).toBeDefined();
			expect( Array.isArray( receivedEvents ) ).toBeTruthy();
			expect( receivedEvents.length ).toBeGreaterThanOrEqual( 0 );
			firstEventLength = receivedEvents.length;


			//
			//	Alice will publish an event to the channel on peer 02
			//
			const pushClient02 = new PushClient( {
				deviceId : deviceId,
				serverUrl : `http://dev-node02-jpe.metabeem.com:6501`
				// serverUrl : `http://localhost:6511`
			} );
			let publishRequest : PublishRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.alice.address,
				deviceId : ``,
				channel : channel,
				hash : ``,
				sig : ``,
				body : {
					index : 10010,
					time : new Date().toLocaleString()
				}
			};
			publishRequest.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequest );
			publishRequest.hash = await Web3Digester.hashObject( publishRequest );
			const response = await pushClient02.publish( publishRequest );
			console.log( `Client : server response of the publish request: `, response );
			expect( response ).toBeDefined();
			expect( response ).toHaveProperty( `timestamp` );
			expect( response ).toHaveProperty( `serverId` );
			expect( response ).toHaveProperty( `version` );
			expect( response ).toHaveProperty( `status` );
			expect( response ).toHaveProperty( `data` );
			expect( _.isObject( response.data ) ).toBeTruthy();
			await TestUtil.sleep( 10 );

			await TestUtil.sleep( 1000 );
			//console.log( `receivedEvents :`, receivedEvents );
			expect( receivedEvents ).toBeDefined();
			expect( Array.isArray( receivedEvents ) ).toBeTruthy();
			expect( receivedEvents.length ).toBeGreaterThan( 0 );
			expect( receivedEvents.length ).toBe( firstEventLength + 1 );

			const lastEvent = receivedEvents[ receivedEvents.length - 1 ];
			console.log( `lastEvent :`, lastEvent );
			//    lastEvent : {
			//       timestamp: 1731604176618,
			//       serverId: '6c03895c-d8e1-4c10-8e8a-644253799e1e',
			//       version: '1.0.0',
			//       status: 200,
			//       data: {
			//         timestamp: 1731604176618,
			//         wallet: '0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357',
			//         deviceId: '',
			//         channel: 'pch-bobo-0xcbb8f66676737f0423bdda7bb1d8b84fc3c257e8',
			//         hash: '0x84c8ea463de61724869e7150170136060ea063fb94fb01fc1e3d52618e1d8f39',
			//         sig: '0x0b2c8f586730a7122a0913671b53291aa783c0c650fd038148b80d8b1de49f885318915dce1f350f679750b1b260ca80f797f8a3521049c0fd9d226598f7adcb1c',
			//         body: { index: 10010, time: '11/15/2024, 1:09:36 AM' }
			//       }
			//     }
			expect( lastEvent ).toBeDefined();
			expect( lastEvent ).toHaveProperty( `data` );
			expect( _.isObject( lastEvent.data ) ).toBeTruthy();
			expect( _.isObject( lastEvent.data.body ) ).toBeTruthy();
			expect( lastEvent.data.body.index ).toBe( 10010 );

			//	...
			pushClient01.close();
			await TestUtil.sleep( 3000 );

		}, 25000 );
	} );
} );
