import { describe, expect } from '@jest/globals';
import { PushClientStorageService } from "../../../src/storages/PushClientStorageService";
import { PushClientOffsetItem } from "../../../src/entities/PushClientEntity";
import { testWalletObjList } from "../../../src/configs/TestConfig";

/**
 *	unit test
 */
describe( "PushClientStorageService", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "Get/Put", () =>
	{
		it( "should get the value just put", async () =>
		{
			const channel : string = `pch-bobo-${ testWalletObjList.bob.address }`;
			const pushClientStorageService = new PushClientStorageService();
			const key = channel;
			const preValue = { minOffset : 0, maxOffset : Date.now() };
			await pushClientStorageService.put( key, preValue );

			const value : PushClientOffsetItem | null = await pushClientStorageService.get( key );
			//console.log( `value :`, value );
			//	value : { lastOffset: 1724593251733 }
			expect( value ).not.toBeNull();
			expect( value && value.maxOffset === preValue.maxOffset ).toBeTruthy();
		});
	} );
} );
