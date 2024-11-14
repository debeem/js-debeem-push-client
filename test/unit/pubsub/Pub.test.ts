import { describe, expect } from '@jest/globals';
import { PublishRequest, PushClient } from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";


/**
 *	unit test
 */
describe( "Pub", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "Pub", () =>
	{
		it( "should publish a event to the channel", async () =>
		{
			//const channel = `pch-bobo-${ testWalletObjList.bob.address }`;
			const channel = `pch-mb-follower-0x8e3b27841cacdc3a68724bbc38b9390eb3f8c47c`;
			const deviceId = `device-${ testWalletObjList.alice.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );

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
			expect( response.status ).toBe( 200 );
			await TestUtil.sleep( 10 );

			//	...
			pushClient.close();
			await TestUtil.sleep( 1000 );

		}, 25000 );
	} );
} );
