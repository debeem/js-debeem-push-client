import { describe } from '@jest/globals';
import { PublishRequest, PushClient, VaPushServerResponse } from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";


/**
 *	unit test
 */
describe( "PubSub", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "PubSub", () =>
	{
		it( "should subscribe a channel", async () =>
		{
			let receivedEvents: any[] = [];

			/**
			 *	@param event		{string}
			 *	@param callback		{( ack : any ) => void}
			 */
			const callbackEventReceiver = ( event: any, callback: any ) =>
			{
				const errorEvent = VaPushServerResponse.validatePushServerResponse( event );
				if ( null !== errorEvent )
				{
					console.warn( `callbackEventReceiver :: errorEvent :`, errorEvent );
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
				serverUrl : `http://localhost:6501`
			};
			const pushClient = new PushClient( pushClientOptions );

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
				sig : ``
			};
			subscribeRequest.sig = await Web3Signer.signObject( testWalletObjList.bob.privateKey, subscribeRequest );
			subscribeRequest.hash = await Web3Digester.hashObject( subscribeRequest );
			const subscribeResponse = await pushClient.subscribe( subscribeRequest, callbackEventReceiver );
			console.log( `Client : 🐹 server response of the subscription request: `, subscribeResponse );
			//expect( subscribeResponse && 200 === subscribeResponse.status ).toBeTruthy();
			//	wait 1 second
			await TestUtil.sleep( 1000 );


			//
			//	Alice publish some events to the channel
			//
			let publishRequest : PublishRequest = {
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
			publishRequest.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequest );
			publishRequest.hash = await Web3Digester.hashObject( publishRequest );
			const response = await pushClient.publish( publishRequest );
			console.log( `Client : server response of the publish request: `, response );
			await TestUtil.sleep( 10 );

			await TestUtil.sleep( 5000 );


			console.log( `receivedEvents :`, receivedEvents );
		}, 9000 );
	} );
} );