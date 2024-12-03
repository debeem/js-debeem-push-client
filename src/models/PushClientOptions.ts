import { CallbackServerEventReceiver } from "./callbacks/ServerEventReceiver";


/**
 * 	default timeout value of sending request, in milliseconds
 */
export const defaultSendingTimeout : number = 2000;

/**
 * 	default retry times of sending request
 */
export const defaultSendingRetry : number = 3;



export interface PushClientOptions
{
	/**
	 * 	the globally unique id of the current device.
	 * 	one account may have multiple devices.
	 */
	deviceId : string;

	/**
	 * 	the url string of the push server
	 *
	 * 	[protocol]:[host]:[port]
	 * 	for example:
	 * 	http://localhost:6501, ws://host:6501, wss://host:6501
	 */
	serverUrl : string;

	/**
	 * 	timeout value of sending request, in milliseconds
	 * 	default to 2000, defaultSendingTimeout
	 */
	sendingTimeout ?: number;

	/**
	 * 	retry times of sending request
	 * 	default to 3, defaultSendingRetry
	 */
	sendingRetry ?: number;
}


export interface ConnectorOptions extends PushClientOptions
{
	/**
	 * 	callback function for receiving event from server
	 */
	serverEventReceiver : CallbackServerEventReceiver;
}

