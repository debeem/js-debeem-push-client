import { describe, expect } from '@jest/globals';
import { PushClientStorageService } from "../../../src/storages/PushClientStorageService";
import { PushClientItem } from "../../../src/entities/PushClientEntity";

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
			const pushClientStorageService = new PushClientStorageService();
			const key = `last`;
			const preValue = { minOffset : 0, maxOffset : Date.now() };
			await pushClientStorageService.put( key, preValue );

			const value : PushClientItem | null = await pushClientStorageService.get( key );
			//console.log( `value :`, value );
			//	value : { lastOffset: 1724593251733 }
			expect( value ).not.toBeNull();
			expect( value && value.maxOffset === preValue.maxOffset ).toBeTruthy();
		});
	} );
} );
