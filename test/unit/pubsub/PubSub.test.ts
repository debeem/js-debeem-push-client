import { describe, expect } from '@jest/globals';
import { PublishRequest, PushClient, PushServerResponse, SubscribeRequest, VaPushServerResponse } from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";


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

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
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
			firstEventLength = receivedEvents.length;

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

			//	...
			pushClient.close();
			await TestUtil.sleep( 3000 );

		}, 25000 );
	} );

	//
	describe( "Channel name", () =>
	{
		it( "should subscribe to a channel, even if the channel name doesn't include the sub's wallet address", async () =>
		{
			//
			//	Bob subscribes to a channel
			//
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `bch-bobo-${ testWalletObjList.alice.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

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

			let subscribedSuccessfully = false;
			const responseSub : PushServerResponse = await pushClient.subscribe( subscribeRequest,  ( channel : string, response: any, _callback: any ) =>
			{
				console.log( `Client : server of channel [${ channel }] respond: `, response );
				if ( response && 200 === response.status )
				{
					subscribedSuccessfully = true;
				}
			});
			console.log( `responseSub: `, responseSub );
			expect( responseSub ).toBeDefined();
			expect( responseSub ).toHaveProperty( `status` );
			expect( responseSub ).toHaveProperty( `data` );
			expect( responseSub ).toHaveProperty( `serverId` );
			expect( responseSub ).toHaveProperty( `timestamp` );
			expect( responseSub ).toHaveProperty( `version` );
			expect( responseSub.status ).toBe( 200 );

			//	...
			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 60 * 10e3 );

		it( "should return error `invalid personal subscription channel name`", async () =>
		{
			//
			//	Bob subscribes to a channel
			//
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `pch-bobo-${ testWalletObjList.alice.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

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

			const responseSub : PushServerResponse = await pushClient.subscribe( subscribeRequest,  ( channel : string, response: any, _callback: any ) =>
			{
				console.log( `Client : server of channel [${ channel }] respond: `, response );
			});
			console.log( `responseSub: `, responseSub );
			expect( responseSub ).toBeDefined();
			expect( responseSub ).toHaveProperty( `status` );
			expect( responseSub ).toHaveProperty( `error` );
			expect( responseSub ).toHaveProperty( `serverId` );
			expect( responseSub ).toHaveProperty( `timestamp` );
			expect( responseSub ).toHaveProperty( `version` );
			expect( responseSub.status ).toBe( 400 );
			expect( responseSub.error ).toBe( `SubscribeAuth.auth :: invalid personal subscription channel name` );

			//	...
			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 60 * 10e3 );

		it( "should return error `invalid subscribeRequest.channel :: length of .channel exceeds limit to 45-64`", async () =>
		{
			//
			//	Bob subscribes to a channel
			//
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `pch-bobo-`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

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

			try
			{
				await pushClient.subscribe( subscribeRequest,  ( channel : string, response: any, _callback: any ) =>
				{
					console.log( `Client : server of channel [${ channel }] respond: `, response );
				});
			}
			catch ( err )
			{
				expect( err ).toBe( `invalid subscribeRequest.channel :: length of .channel exceeds limit to 45-64` );
			}

			//	...
			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 60 * 10e3 );

		it( "should return error `invalid subscribeRequest.channel :: invalid .channel, must consist of ...`", async () =>
		{
			//
			//	Bob subscribes to a channel
			//
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `pch-|-${ testWalletObjList.bob.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

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

			try
			{
				await pushClient.subscribe( subscribeRequest,  ( channel : string, response: any, _callback: any ) =>
				{
					console.log( `Client : server of channel [${ channel }] respond: `, response );
				});
			}
			catch ( err )
			{
				expect( err ).toBe( `invalid subscribeRequest.channel :: invalid .channel, must consist of English letters, numbers and characters -,_` );
			}

			//	...
			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 60 * 10e3 );
	});
} );
