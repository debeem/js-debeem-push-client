import { PushClient, VaPushServerResponse } from "debeem-push-client";
import { testWalletObjList } from "../../../../src/configs/TestConfig";
import { CallbackNetworkStatusListener } from "../../../../src/models/callbacks/NetworkStatusListener";
import { TestUtil } from "debeem-utils";



async function createPushClient( pinCode : string = `` ) : Promise<any>
{
	return new Promise( async ( resolve, reject ) =>
	{
		try
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

			let networkStatusChanges : any[] = [];
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

			resolve( null );
		}
		catch ( err )
		{
			reject( err );
		}
	});
}

createPushClient().then( res =>
{
	console.log( `asynchronously res :`, res );
})
.catch( err => {

	console.error( `err :`, err );
} );
