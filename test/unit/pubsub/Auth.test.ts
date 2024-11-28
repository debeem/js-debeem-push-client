import { describe, expect } from '@jest/globals';
import {
	PublishRequest,
	PushClient,
	PushServerResponse
} from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";


/**
 *	unit test
 */
describe( "Auth", () =>
{
	beforeAll( async () =>
	{
	} );
	afterAll( async () =>
	{
	} );

	describe( "Auth", () =>
	{
		const deviceId : string = `device-${ testWalletObjList.bob.address }`;
		const channel : string = `pch-bobo-${ testWalletObjList.bob.address }`;

		it( "should publish an event", async () =>
		{
			const pushClientOptions = {
				deviceId : deviceId,
				//serverUrl : `http://localhost:6501`
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

			//	...
			let publishRequest : PublishRequest = {
				timestamp : Date.now(),
				wallet : testWalletObjList.alice.address,
				deviceId : deviceId,
				channel : channel,
				hash : ``,
				sig : ``,
				body : {
					time : new Date().toLocaleString()
				}
			};
			publishRequest.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequest );
			publishRequest.hash = await Web3Digester.hashObject( publishRequest );
			const response : PushServerResponse = await pushClient.publish( publishRequest );
			console.log( `Client : server response of the publish request: `, response );
			expect( response ).not.toBe( null );
			expect( _.isObject( response ) ).toBeTruthy();
			expect( response ).toHaveProperty( `timestamp` );
			expect( response ).toHaveProperty( `serverId` );
			expect( response ).toHaveProperty( `version` );
			expect( response ).toHaveProperty( `status` );
			expect( response ).toHaveProperty( `data` );
			expect( response.status ).toBe( 200 );
			await TestUtil.sleep( 10 );

			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 60 * 10e3 );

		it( "should return `access denied`", async () =>
		{
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `pch-bobo-${ testWalletObjList.bob.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				//serverUrl : `http://localhost:6501`
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

			//	...
			let publishRequest : PublishRequest = {
				timestamp : Date.now(),
				wallet : testWalletObjList.bob.address,
				deviceId : deviceId,
				channel : channel,
				hash : ``,
				sig : ``,
				body : {
					time : new Date().toLocaleString()
				}
			};
			publishRequest.sig = await Web3Signer.signObject( testWalletObjList.bob.privateKey, publishRequest );
			publishRequest.hash = await Web3Digester.hashObject( publishRequest );
			const response : PushServerResponse = await pushClient.publish( publishRequest );
			console.log( `Client : server response of the publish request: `, response );
			expect( response ).not.toBe( null );
			expect( _.isObject( response ) ).toBeTruthy();
			expect( response ).toHaveProperty( `timestamp` );
			expect( response ).toHaveProperty( `serverId` );
			expect( response ).toHaveProperty( `version` );
			expect( response ).toHaveProperty( `status` );
			expect( response ).toHaveProperty( `error` );
			expect( response.status ).toBe( 400 );
			expect( response.error ).toBe( `PublishAuth.auth :: access denied` );
			await TestUtil.sleep( 10 );

			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 60 * 10e3 );

		it( "should throw `invalid publishRequest.sig`", async () =>
		{
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `pch-bobo-${ testWalletObjList.bob.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				//serverUrl : `http://localhost:6501`
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

			//	...
			let publishRequest : PublishRequest = {
				timestamp : Date.now(),
				wallet : testWalletObjList.alice.address,
				deviceId : deviceId,
				channel : channel,
				hash : ``,
				sig : ``,
				body : {
					time : new Date().toLocaleString()
				}
			};
			publishRequest.sig = `invalid sig`;
			publishRequest.hash = await Web3Digester.hashObject( publishRequest );

			try
			{
				const response : PushServerResponse = await pushClient.publish( publishRequest );
			}
			catch ( err )
			{
				//console.error( err );
				//  console.error
				//     invalid publishRequest.sig
				expect( err ).toBe( `invalid publishRequest.sig` );
			}

			await TestUtil.sleep( 10 );

			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 60 * 10e3 );

	} );
} );
