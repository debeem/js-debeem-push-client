import { describe, expect } from '@jest/globals';
import { PublishRequest, PushClient, PushServerResponse, SubscribeRequest, VaPushServerResponse } from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";


/**
 *	unit test
 */
describe( "Heartbeat", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "Heartbeat", () =>
	{
		it( "should receive event continuously", async () =>
		{
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

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
				//serverUrl : `http://localhost:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

			//
			//	Bob subscribes to the channel
			//
			let subscribeRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.bob.address,
				deviceId : deviceId,
				deviceStatus : `working`,
				offset : 0,
				channel : channel,
				hash : ``,
				sig : ``,
			};
			subscribeRequest.sig = await Web3Signer.signObject( testWalletObjList.bob.privateKey, subscribeRequest );
			subscribeRequest.hash = await Web3Digester.hashObject( subscribeRequest );
			const subscribeResponse = await pushClient.subscribe( subscribeRequest, callbackEventReceiver );
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
			const firstEventLength : number = receivedEvents.length;

			//
			//	Alice publish some events to the channel
			//
			let publishRequest1 : PublishRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.alice.address,
				deviceId : ``,
				channel : channel,
				hash : ``,
				sig : ``,
				body : {
					index : 0,
					time : new Date().toLocaleString()
				}
			};
			publishRequest1.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequest1 );
			publishRequest1.hash = await Web3Digester.hashObject( publishRequest1 );
			const response1 = await pushClient.publish( publishRequest1 );
			console.log( `Client : server response of the publish request: `, response1 );
			expect( response1 ).toBeDefined();
			expect( response1 ).toHaveProperty( `timestamp` );
			expect( response1 ).toHaveProperty( `serverId` );
			expect( response1 ).toHaveProperty( `version` );
			expect( response1 ).toHaveProperty( `status` );
			expect( response1 ).toHaveProperty( `data` );
			expect( _.isObject( response1.data ) ).toBeTruthy();
			await TestUtil.sleep( 1000 );

			//console.log( `receivedEvents :`, receivedEvents );
			expect( receivedEvents ).toBeDefined();
			expect( Array.isArray( receivedEvents ) ).toBeTruthy();
			expect( receivedEvents.length ).toBeGreaterThan( 0 );
			expect( receivedEvents.length ).toBe( firstEventLength + 1 );

			await TestUtil.sleep( 60 * 1000 );

			//	...
			const secondEventLength = receivedEvents.length;

			//
			//	Alice publish some events to the channel
			//
			let publishRequest2 : PublishRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.alice.address,
				deviceId : ``,
				channel : channel,
				hash : ``,
				sig : ``,
				body : {
					index : 0,
					time : new Date().toLocaleString()
				}
			};
			publishRequest2.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequest2 );
			publishRequest2.hash = await Web3Digester.hashObject( publishRequest2 );
			const response2 = await pushClient.publish( publishRequest2 );
			console.log( `Client : server response of the publish request: `, response2 );
			expect( response2 ).toBeDefined();
			expect( response2 ).toHaveProperty( `timestamp` );
			expect( response2 ).toHaveProperty( `serverId` );
			expect( response2 ).toHaveProperty( `version` );
			expect( response2 ).toHaveProperty( `status` );
			expect( response2 ).toHaveProperty( `data` );
			expect( _.isObject( response2.data ) ).toBeTruthy();
			await TestUtil.sleep( 1000 );

			//console.log( `receivedEvents :`, receivedEvents );
			expect( receivedEvents.length ).toBe( secondEventLength + 1 );

			//	...
			await TestUtil.sleep( 60 * 1000 );
			pushClient.close();


		}, 120 * 10e3 );
	} );

} );
