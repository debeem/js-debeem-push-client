export class ServerUrlUtil
{
	static isWebsocket( serverUrl : string ) : boolean
	{
		//const wsRegex : RegExp = /^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/)/i;
		const wsRegex : RegExp = /^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/)[^\s\/?#]+/i;
		return wsRegex.test( serverUrl );
	}
}