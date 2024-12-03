import { describe, expect } from '@jest/globals';
import { PushClient, VaPushServerResponse } from "../../../src";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";
import _ from "lodash";
import { CallbackNetworkStatusListener } from "../../../src/models/callbacks/NetworkStatusListener";


/**
 *	unit test
 */
describe( "NetworkStatus", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "NetworkStatus", () =>
	{
		it( "should receive event continuously", async () =>
		{
			const deviceId = `device-${ testWalletObjList.bob.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
				//serverUrl : `http://localhost:6501`
			};
			const pushClient = new PushClient( pushClientOptions );
			await pushClient.waitUntilConnected( 3000 );

			let networkStatusChanges = [];
			const callbackNetworkStatusListener : CallbackNetworkStatusListener = ( eventName : any, details : any ) =>
			{
				console.log( `💎 callbackNetworkStatusListener : `, { eventName, details : details } );
				networkStatusChanges.push( {
					eventName : eventName,
					details : details,
				} );
			};
			pushClient.setNetworkStatusListener( callbackNetworkStatusListener );

			//	...
			await TestUtil.sleep( 30 * 1000 );
			pushClient.close();

			console.log( `networkStatusChanges :`, networkStatusChanges );
			//    networkStatusChanges : [
			//       {
			//         eventName: 'disconnect',
			//         details: {
			//           socket: [Socket],
			//           active: false,
			//           reason: 'io client disconnect',
			//           details: undefined
			//         }
			//       }
			//     ]
			expect( networkStatusChanges.length > 0 ).toBeTruthy();
			expect( networkStatusChanges[ 0 ].eventName ).toBe( `disconnect` );
			expect( _.isObject( networkStatusChanges[ 0 ].details ) ).toBeDefined();
			expect( networkStatusChanges[ 0 ].details.active ).toBeFalsy();
			expect( networkStatusChanges[ 0 ].details.reason ).toBe( `io client disconnect` );

		}, 120 * 10e3 );
	} );

} );
