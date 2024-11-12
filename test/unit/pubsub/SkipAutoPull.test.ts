import { describe, expect } from '@jest/globals';
import { PublishRequest, PushClient, VaPushServerResponse } from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";


/**
 *	unit test
 */
describe( "SkipAutoPull", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "Skip Auto Pull", () =>
	{
		it( "should auto pull event after a successful subscription", async () =>
		{
			let receivedChannelAEvents: any[] = [];

			/**
			 *	@param channel		{string}
			 *	@param event		{any}
			 *	@param callback		{( ack : any ) => void}
			 */
			const callbackChannelAEventReceiver = ( channel : string, event: any, callback: any ) =>
			{
				const errorEvent = VaPushServerResponse.validatePushServerResponse( event );
				if ( null !== errorEvent )
				{
					console.warn( `callbackEventReceiver :: errorEvent :`, errorEvent );
					return;
				}

				receivedChannelAEvents.push( event );
				receivedChannelAEvents.sort( ( a, b ) => a.timestamp - b.timestamp );
			}

			const deviceId = `device-${ testWalletObjList.bob.address }`;
			const channelA = `pch-bobo-${ testWalletObjList.bob.address }-a`;
			const channelB = `pch-bobo-${ testWalletObjList.bob.address }-b`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );


			//
			//	Alice publish some events to the channelA
			//
			let publishRequestA : PublishRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.alice.address,
				deviceId : ``,
				channel : channelA,
				hash : ``,
				sig : ``,
				body : {
					index : 0,
					time : new Date().toLocaleString()
				}
			};
			publishRequestA.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequestA );
			publishRequestA.hash = await Web3Digester.hashObject( publishRequestA );
			const publishResponseA = await pushClient.publish( publishRequestA );
			//console.log( `Client : server response of the publish request: `, publishResponseA );
			expect( publishResponseA ).toBeDefined();
			expect( publishResponseA ).toHaveProperty( `timestamp` );
			expect( publishResponseA ).toHaveProperty( `serverId` );
			expect( publishResponseA ).toHaveProperty( `version` );
			expect( publishResponseA ).toHaveProperty( `status` );
			expect( publishResponseA ).toHaveProperty( `data` );
			expect( _.isObject( publishResponseA.data ) ).toBeTruthy();
			expect( publishResponseA.data ).toHaveProperty( `timestamp` );
			expect( publishResponseA.data ).toHaveProperty( `wallet` );
			expect( publishResponseA.data ).toHaveProperty( `deviceId` );
			expect( publishResponseA.data ).toHaveProperty( `channel` );
			expect( publishResponseA.data ).toHaveProperty( `hash` );
			expect( publishResponseA.data ).toHaveProperty( `sig` );
			expect( publishResponseA.data ).toHaveProperty( `body` );
			await TestUtil.sleep( 10 );

			//
			//	Bob subscribes to the channel A
			//
			let subscribeRequestA = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.bob.address,
				deviceId : deviceId,
				deviceStatus : `working`,
				offset : 0,
				channel : channelA,
				hash : ``,
				sig : ``
			};
			subscribeRequestA.sig = await Web3Signer.signObject( testWalletObjList.bob.privateKey, subscribeRequestA );
			subscribeRequestA.hash = await Web3Digester.hashObject( subscribeRequestA );
			const subscribeResponseA = await pushClient.subscribe( subscribeRequestA, callbackChannelAEventReceiver );
			//console.log( `Client : 🐹 server response of the subscription request: `, subscribeResponse );
			expect( subscribeResponseA && 200 === subscribeResponseA.status ).toBeTruthy();
			expect( subscribeResponseA ).toBeDefined();
			expect( subscribeResponseA ).toHaveProperty( `status` );
			expect( subscribeResponseA ).toHaveProperty( `data` );
			expect( subscribeResponseA ).toHaveProperty( `serverId` );
			expect( subscribeResponseA ).toHaveProperty( `timestamp` );
			expect( subscribeResponseA ).toHaveProperty( `version` );
			expect( _.isObject( subscribeResponseA.data ) ).toBeTruthy();
			await TestUtil.sleep( 100 );

			await TestUtil.sleep( 2000 );

			//	...
			//console.log( `receivedChannelAEvents :`, receivedChannelAEvents );
			expect( receivedChannelAEvents ).toBeDefined();
			expect( Array.isArray( receivedChannelAEvents ) ).toBeTruthy();
			expect( receivedChannelAEvents.length ).toBeGreaterThanOrEqual( 1 );

			pushClient.close();
			await TestUtil.sleep( 3000 );

		}, 25000 );


		it( "should skip auto pulling after a successful sub. cause `skipAutoPullingData : true`", async () =>
		{
			let receivedChannelAEvents: any[] = [];

			/**
			 *	@param channel		{string}
			 *	@param event		{any}
			 *	@param callback		{( ack : any ) => void}
			 */
			const callbackChannelAEventReceiver = ( channel : string, event: any, callback: any ) =>
			{
				const errorEvent = VaPushServerResponse.validatePushServerResponse( event );
				if ( null !== errorEvent )
				{
					console.warn( `callbackEventReceiver :: errorEvent :`, errorEvent );
					return;
				}

				receivedChannelAEvents.push( event );
				receivedChannelAEvents.sort( ( a, b ) => a.timestamp - b.timestamp );

				//	...
				throw `exception call, this function should not be called!`;
			}

			const deviceId = `device-${ testWalletObjList.bob.address }`;
			const channelA = `pch-bobo-${ testWalletObjList.bob.address }-a`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );


			//
			//	Alice publish some events to the channelA
			//
			let publishRequestA : PublishRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.alice.address,
				deviceId : ``,
				channel : channelA,
				hash : ``,
				sig : ``,
				body : {
					index : 0,
					time : new Date().toLocaleString()
				}
			};
			publishRequestA.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequestA );
			publishRequestA.hash = await Web3Digester.hashObject( publishRequestA );
			const publishResponseA = await pushClient.publish( publishRequestA );
			//console.log( `Client : server response of the publish request: `, publishResponseA );
			expect( publishResponseA ).toBeDefined();
			expect( publishResponseA ).toHaveProperty( `timestamp` );
			expect( publishResponseA ).toHaveProperty( `serverId` );
			expect( publishResponseA ).toHaveProperty( `version` );
			expect( publishResponseA ).toHaveProperty( `status` );
			expect( publishResponseA ).toHaveProperty( `data` );
			expect( _.isObject( publishResponseA.data ) ).toBeTruthy();
			expect( publishResponseA.data ).toHaveProperty( `timestamp` );
			expect( publishResponseA.data ).toHaveProperty( `wallet` );
			expect( publishResponseA.data ).toHaveProperty( `deviceId` );
			expect( publishResponseA.data ).toHaveProperty( `channel` );
			expect( publishResponseA.data ).toHaveProperty( `hash` );
			expect( publishResponseA.data ).toHaveProperty( `sig` );
			expect( publishResponseA.data ).toHaveProperty( `body` );
			await TestUtil.sleep( 10 );

			//
			//	Bob subscribes to the channel A
			//
			let subscribeRequestA = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.bob.address,
				deviceId : deviceId,
				deviceStatus : `working`,
				offset : 0,
				channel : channelA,
				hash : ``,
				sig : ``,
				skipAutoPullingData : true	//	<---
			};
			subscribeRequestA.sig = await Web3Signer.signObject( testWalletObjList.bob.privateKey, subscribeRequestA );
			subscribeRequestA.hash = await Web3Digester.hashObject( subscribeRequestA );
			const subscribeResponseA = await pushClient.subscribe( subscribeRequestA, callbackChannelAEventReceiver );
			//console.log( `Client : 🐹 server response of the subscription request: `, subscribeResponse );
			expect( subscribeResponseA && 200 === subscribeResponseA.status ).toBeTruthy();
			expect( subscribeResponseA ).toBeDefined();
			expect( subscribeResponseA ).toHaveProperty( `status` );
			expect( subscribeResponseA ).toHaveProperty( `data` );
			expect( subscribeResponseA ).toHaveProperty( `serverId` );
			expect( subscribeResponseA ).toHaveProperty( `timestamp` );
			expect( subscribeResponseA ).toHaveProperty( `version` );
			expect( _.isObject( subscribeResponseA.data ) ).toBeTruthy();
			await TestUtil.sleep( 100 );

			await TestUtil.sleep( 2000 );

			//	...
			//console.log( `receivedChannelAEvents :`, receivedChannelAEvents );
			expect( receivedChannelAEvents ).toBeDefined();
			expect( Array.isArray( receivedChannelAEvents ) ).toBeTruthy();
			expect( receivedChannelAEvents.length ).toBe( 0 );

			pushClient.close();
			await TestUtil.sleep( 3000 );

		}, 25000 );
	} );
} );
