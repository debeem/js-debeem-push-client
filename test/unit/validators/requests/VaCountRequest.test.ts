import { describe, expect } from '@jest/globals';
import { ServerIdUtil, ServerUrlUtil, VaCountRequest } from "../../../../src";
import _ from "lodash";
import { testWalletObjList } from "../../../../src/configs/TestConfig";

/**
 *	unit test
 */
describe( "VaCountRequest", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "VaCountRequest", () =>
	{
		it( "#validateCountRequest", async () =>
		{
			expect( VaCountRequest.validateCountRequest( null ) ).toBe( `invalid countRequest` );
			expect( VaCountRequest.validateCountRequest( {} ) ).toBe( `invalid countRequest.options` );

			//	#1
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].timestamp, invalid timestamp` );

			//	#2
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : 1
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].timestamp, invalid .timestamp, more than 10 minutes gap from current time` );

			//	#3
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].wallet` );

			//	#4
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : `1111111`,
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].wallet` );

			//	#5
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].deviceId` );

			//	#6
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
						deviceId : ``,
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].channel :: invalid .channel` );

			//	#7
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
						deviceId : ``,
						channel : ``,
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].channel :: length of .channel exceeds limit to 32-256` );

			//	#8
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
						deviceId : ``,
						channel : `pch-${ testWalletObjList.alice.address }`,
					}
				]
			} ) ).toBe( null );

			//	#9
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
						deviceId : ``,
						channel : `pch-${ testWalletObjList.alice.address }`,
						startTimestamp : null,
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].startTimestamp` );

			//	#10
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
						deviceId : ``,
						channel : `pch-${ testWalletObjList.alice.address }`,
						startTimestamp : 1,
						endTimestamp : null,
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].endTimestamp` );

			//	#11
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
						deviceId : ``,
						channel : `pch-${ testWalletObjList.alice.address }`,
						startTimestamp : 1,
						endTimestamp : -1,
						lastElement : null,
					}
				]
			} ) ).toBe( `invalid countRequest.options[ 0 ].lastElement` );

			//	#12
			expect( VaCountRequest.validateCountRequest( {
				options : [
					{
						timestamp : Date.now(),
						wallet : testWalletObjList.alice.address,
						deviceId : ``,
						channel : `pch-${ testWalletObjList.alice.address }`,
						startTimestamp : 1,
						endTimestamp : -1,
						lastElement : 10,
					}
				]
			} ) ).toBe( null );

			//	#13
			expect( VaCountRequest.validateCountRequest( {
				options : [
				]
			} ) ).toBe( `invalid countRequest.options :: empty list` );
		});
	} );
} );
