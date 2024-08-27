import { describe, expect } from '@jest/globals';
import { ServerIdUtil } from "../../../src";
import _ from "lodash";

/**
 *	unit test
 */
describe( "ServerIdUtil", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "ServerId", () =>
	{
		it( "should generate a device id", async () =>
		{
			const serverId : string = ServerIdUtil.generateServerId()
			//console.log( `serverId :`, serverId );
			//	console.log
			//     deviceId : d637d368-6fb7-4365-bc0f-4b3cf4b74a45
			expect( serverId ).not.toBeNull();
			expect( _.isString( serverId ) && ! _.isEmpty( serverId ) ).toBeTruthy();
			expect( ServerIdUtil.isValidServerId( serverId ) ).toBeTruthy();
		});

		it( "should check server id", async () =>
		{
			expect( ServerIdUtil.isValidServerId( `d637d368-6fb7-4365-bc0f-4b3cf4b74a45` ) ).toBeTruthy();
			expect( ServerIdUtil.isValidServerId( `d637d368` ) ).toBeTruthy();
			expect( ServerIdUtil.isValidServerId( `` ) ).toBeFalsy();
			expect( ServerIdUtil.isValidServerId( undefined ) ).toBeFalsy();
		});
	} );
} );
