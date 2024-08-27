import { describe, expect } from '@jest/globals';
import { ServerIdUtil, ServerUrlUtil } from "../../../src";
import _ from "lodash";

/**
 *	unit test
 */
describe( "ServerUrlUtil", () =>
{
	beforeAll( async () =>
	{
	});
	afterAll( async () =>
	{
	});

	describe( "ServerId", () =>
	{
		it( "should determine if it is a websocket protocol by url", async () =>
		{
			expect( ServerUrlUtil.isWebsocket( `http://www.abc.com/` ) ).toBeTruthy();
			expect( ServerUrlUtil.isWebsocket( `https://www.abc.com/` ) ).toBeTruthy();
			expect( ServerUrlUtil.isWebsocket( `ws://www.abc.com/` ) ).toBeTruthy();
			expect( ServerUrlUtil.isWebsocket( `wss://www.abc.com/` ) ).toBeTruthy();
			expect( ServerUrlUtil.isWebsocket( `http://` ) ).toBeFalsy();
			expect( ServerUrlUtil.isWebsocket( `https://` ) ).toBeFalsy();
			expect( ServerUrlUtil.isWebsocket( `wss://` ) ).toBeFalsy();
			expect( ServerUrlUtil.isWebsocket( `ws://` ) ).toBeFalsy();
			expect( ServerUrlUtil.isWebsocket( `wss` ) ).toBeFalsy();
		});
	} );
} );
