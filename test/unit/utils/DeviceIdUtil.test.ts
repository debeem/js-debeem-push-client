import { describe, expect } from '@jest/globals';
import { DeviceIdUtil } from "../../../src";
import _ from "lodash";

/**
 *	unit test
 */
describe( "DeviceIdUtil", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "DeviceId", () =>
	{
		it( "should generate a device id", async () =>
		{
			const deviceId : string = DeviceIdUtil.generateDeviceId();
			//console.log( `deviceId :`, deviceId );
			//	console.log
			//     deviceId : d637d368-6fb7-4365-bc0f-4b3cf4b74a45
			expect( deviceId ).not.toBeNull();
			expect( _.isString( deviceId ) && ! _.isEmpty( deviceId ) ).toBeTruthy();
			expect( DeviceIdUtil.isValidDeviceId( deviceId ) ).toBeTruthy();
		});

		it( "should check device id", async () =>
		{
			expect( DeviceIdUtil.isValidDeviceId( `d637d368-6fb7-4365-bc0f-4b3cf4b74a45` ) ).toBeTruthy();
			expect( DeviceIdUtil.isValidDeviceId( `d637d368` ) ).toBeTruthy();
			expect( DeviceIdUtil.isValidDeviceId( `` ) ).toBeFalsy();
			expect( DeviceIdUtil.isValidDeviceId( undefined ) ).toBeFalsy();
		});
	} );
} );
