import { describe, expect } from '@jest/globals';
import { VaChannel, VaCountRequest } from "../../../src";
import { testWalletObjList } from "../../../src/configs/TestConfig";

/**
 *	unit test
 */
describe( "VaChannel", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "VaChannel", () =>
	{
		it( "#validateChannel", async () =>
		{
			expect( VaChannel.validateChannel( undefined ) ).toBe( `invalid .channel` );
			expect( VaChannel.validateChannel( 111 ) ).toBe( `invalid .channel` );
			expect( VaChannel.validateChannel( null ) ).toBe( `invalid .channel` );
			expect( VaChannel.validateChannel( {} ) ).toBe( `invalid .channel` );

			//	#1
			expect( VaChannel.validateChannel( `0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357` ) ).toBe( `length of .channel exceeds limit to 45-64` );

			//	#2
			expect( VaChannel.validateChannel( `abc-0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357` ) ).toBe( `invalid .channel, invalid format(must start with [pch] or [bch])` );

			//	#3
			expect( VaChannel.validateChannel( `pch-0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357` ) ).toBe( null );

			//	#4
			expect( VaChannel.validateChannel( `bch-0xc8f60eaf5988ac37a2963ac5fabe97f709d6b357` ) ).toBe( null );
		});
	} );
} );
