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
			const deviceId = `device-${ testWalletObjList.bob.address }`;
			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
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
			await TestUtil.sleep( 60 * 1000 );
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
