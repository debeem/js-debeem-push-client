import { describe, expect } from '@jest/globals';
import {
	PaginationOrder,
	PublishRequest,
	PullRequest,
	PushClient,
	PushServerResponse,
	SubscribeRequest, VaChannel,
	VaPushServerResponse
} from "../../../src";
import { Web3Digester, Web3Signer } from "debeem-id";
import { TestUtil } from "debeem-utils";
import { testWalletObjList } from "../../../src/configs/TestConfig";


/**
 *	unit test
 */
describe( "Pull", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "Pull", () =>
	{
		it( "should subscribe to a channel and pull message with custom sorting of ASC/DESC", async () =>
		{
			const deviceId : string = `device-${ testWalletObjList.bob.address }`;
			const channel : string = `pch-bobo-${ testWalletObjList.bob.address }`;

			const pushClientOptions = {
				deviceId : deviceId,
				serverUrl : `http://dev-node0${ Math.random() < 0.5 ? 1 : 2 }-jpe.metabeem.com:6501`
			};
			const pushClient = new PushClient( pushClientOptions );

			let receivedEvents: any[] = [];

			/**
			 *	@param channel		{string}
			 *	@param event		{any}
			 *	@param callback		{( ack : any ) => void}
			 */
			const callbackEventReceiver = ( channel : string, event: any, callback: any ) =>
			{
				const errorChannel : string | null = VaChannel.validateChannel( channel );
				if ( null !== errorChannel )
				{
					console.warn( `callbackEventReceiver :: errorChannel :`, errorChannel );
					return;
				}

				const errorEvent = VaPushServerResponse.validatePushServerResponse( event );
				if ( null !== errorEvent )
				{
					console.warn( `callbackEventReceiver :: errorEvent :`, errorEvent );
					return;
				}

				//console.log( `)) 🔔 Client : received event from server: `, event );
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

			//
			//	Alice publish some events to the channel
			//
			for ( let i = 0; i < 20; i++ )
			{
				let publishRequest : PublishRequest = {
					timestamp : new Date().getTime(),
					wallet : testWalletObjList.alice.address,
					deviceId : ``,
					channel : channel,
					hash : ``,
					sig : ``,
					body : {
						index : i,
						time : new Date().toLocaleString()
					}
				};
				publishRequest.sig = await Web3Signer.signObject( testWalletObjList.alice.privateKey, publishRequest );
				publishRequest.hash = await Web3Digester.hashObject( publishRequest );
				const publishResponse : PushServerResponse = await pushClient.publish( publishRequest );
				//console.log( `Client : server response of the publish request: `, publishResponse );
				await TestUtil.sleep( 10 );
			}

			//
			//	Bob subscribes to the channel
			//
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
			const subscribeResponse = await pushClient.subscribe( subscribeRequest, callbackEventReceiver );
			//console.log( `Client : 🐹 server response of the subscription request: `, subscribeResponse );
			expect( subscribeResponse && 200 === subscribeResponse.status ).toBeTruthy();
			//	wait 1 second
			await TestUtil.sleep( 1000 );

			//
			//	Bob pull the messages
			//
			let lastDeviceOffset = 0;
			const pullRequest : PullRequest = {
				timestamp : new Date().getTime(),
				wallet : testWalletObjList.bob.address,
				deviceId : deviceId,
				channel : channel,
				offset : lastDeviceOffset,
				options : {
					pageNo : 1,
					pageSize : 100,
					order : PaginationOrder.ASC
				}
			};
			const pullResponse : PushServerResponse = await pushClient.pull( pullRequest );
			//console.log( `pullResponse :`, pullResponse );
			//console.log( `pullResponse.data.result.list :`, pullResponse?.data?.result?.list );

			//	...
			expect( pullResponse ).not.toBeNull();
			expect( pullResponse.data ).not.toBeNull();
			expect( pullResponse.data.result ).not.toBeNull();
			expect( pullResponse.data.result.totalMembers ).toBeGreaterThanOrEqual( 0 );
			expect( pullResponse.data.result.total ).toBeGreaterThanOrEqual( 0 );
			expect( pullResponse.data.result.pageKey ).toBeGreaterThanOrEqual( 0 );
			expect( Array.isArray( pullResponse.data.result.list ) ).toBeTruthy();
			expect( pullResponse.data.result.list.length ).toBeGreaterThanOrEqual( 0 );
			const timestampListAsc = pullResponse.data.result.list.map( ( item : any ) => item.data.timestamp );
			//console.log( `timestampListAsc :`, timestampListAsc );
			//    timestampListAsc : [
			//       1730650392665, 1730650396716, 1730650396748, 1730650396774, 1730650396798,
			//       1730650396820, 1730650396841, 1730650396861, 1730650396880, 1730650396899,
			//       1730650396917, 1730650400961, 1730650400992, 1730650401016, 1730650401037,
			//       1730650401057, 1730650401077, 1730650401096, 1730650401116, 1730650401135,
			//       1730650401153, 1730650406856, 1730650406877, 1730650406913, 1730650406969,
			//       1730650407001, 1730650407026, 1730650407046, 1730650407066, 1730650407083,
			//       1730650407109, 1730650409501, 1730650409526, 1730650409548, 1730653871741,
			//       1730653875789, 1730653875823, 1730653875846, 1730653875867, 1730653875889,
			//       1730653875908, 1730653875925, 1730653875945, 1730653875963, 1730653875982,
			//       1730653880016, 1730653880052, 1730653880078, 1730653880100, 1730653880121,
			//       1730653880140, 1730653880158, 1730653880177, 1730653880195, 1730653880213,
			//       1730653885818, 1730653885847, 1730653885869, 1730653885891, 1730653885910,
			//       1730653885929, 1730653885946, 1730653885964, 1730653885983, 1730653886001,
			//       1730653888240, 1730653888258, 1730653888276, 1730694538398, 1730694607288,
			//       1730694639473, 1730695803431, 1730696134551, 1730700567961, 1730700971208,
			//       1730701163686, 1730701221260, 1730701306142, 1730701316961, 1730701341711,
			//       1730701395408, 1730701451809, 1730701490178, 1730701532719, 1730701936296,
			//       1730702057748, 1730702104645, 1730702190461, 1730702258907, 1730706325276,
			//       1730706491873, 1730706560658, 1730706958914, 1730709659084, 1730709687312,
			//       1730711896284, 1730712028513, 1730727350626, 1730727363766, 1730727433414
			//     ]
			for ( let i = 0; i < timestampListAsc.length - 1; i++ )
			{
				expect( timestampListAsc[ i ] ).toBeLessThan( timestampListAsc[ i + 1 ] );
			}

			//	wait 1 second
			await TestUtil.sleep( 1000 );

			let descLastDeviceOffset = timestampListAsc[ timestampListAsc.length - 1 ];
			for ( let i = 0; i < 3; i ++ )
			{
				const pullRequest : PullRequest = {
					timestamp : new Date().getTime(),
					wallet : testWalletObjList.bob.address,
					deviceId : deviceId,
					channel : channel,
					offset : descLastDeviceOffset,
					options : {
						pageNo : 1,
						pageSize : 10,
						order : PaginationOrder.DESC,
						excludeStartMember : false,
					},
				};
				const pullResponse : PushServerResponse = await pushClient.pull( pullRequest );

				expect( pullResponse ).not.toBeNull();
				expect( pullResponse.data ).not.toBeNull();
				expect( pullResponse.data.result ).not.toBeNull();
				expect( pullResponse.data.result.totalMembers ).toBeGreaterThanOrEqual( 0 );
				expect( pullResponse.data.result.total ).toBeGreaterThanOrEqual( 0 );
				expect( pullResponse.data.result.pageKey ).toBeGreaterThanOrEqual( 0 );
				expect( Array.isArray( pullResponse.data.result.list ) ).toBeTruthy();
				expect( pullResponse.data.result.list.length ).toBeGreaterThanOrEqual( 0 );
				const timestampListDesc = pullResponse.data.result.list.map( ( item : any ) => item.data.timestamp );
				//console.log( `timestampListDesc :`, timestampListDesc );
				//    timestampListDesc : [
				//       1730701451809,
				//       1730701395408,
				//       1730701341711,
				//       1730701316961,
				//       1730701306142,
				//       1730701221260,
				//       1730701163686,
				//       1730700971208,
				//       1730700567961,
				//       1730696134551
				//     ]

				if ( 0 === i )
				{
					//
					//	cause:
					//	pullRequest.options.excludeStartMember = false
					//
					expect( timestampListAsc[ timestampListAsc.length - 1 ] ).toBe( timestampListDesc[ 0 ] );
				}

				//
				//	cause:
				//	pullRequest.options.excludeStartMember = false
				//
				expect( descLastDeviceOffset ).toBe( timestampListDesc[ 0 ] );

				//	...
				descLastDeviceOffset = timestampListDesc[ timestampListDesc.length - 1 ];
				for ( let n = 0; n < timestampListDesc.length - 1; n++ )
				{
					expect( timestampListDesc[ n ] ).toBeGreaterThan( timestampListDesc[ n + 1 ] );
				}
			}

			await TestUtil.sleep( 1000 );
			expect( Array.isArray( receivedEvents ) ).toBeTruthy();
			expect( receivedEvents.length ).toBeGreaterThan( 0 );

			pushClient.close();
			await TestUtil.sleep( 3000 );

		}, 60 * 10e3 );
	} );
} );
