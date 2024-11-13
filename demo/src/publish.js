import { Web3Digester, Web3Signer } from "debeem-id";
import { testWalletObjList } from "./configs/TestConfig.js";
import { TestUtil } from "debeem-utils";
import { PushClient } from "debeem-push-client";


async function publish()
{
	const deviceId = `device-${ testWalletObjList.bob.address }`;
	const channel = `pch-bobo-${ testWalletObjList.bob.address }`;

	const pushClientOptions = {
		deviceId : deviceId,
		serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
	};
	const pushClient = new PushClient( pushClientOptions );


	//
	//	Alice publish some events to the channel
	//
	let publishRequest = {
		timestamp : new Date().getTime(),
		wallet : testWalletObjList.alice.address,
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
}


publish().then();
