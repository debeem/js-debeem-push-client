/**
 * 	define type
 */
export type CallbackNetworkStatusListener = ( eventName : any, details : any ) => void;

/**
 * 	define interface
 */
export interface INetworkStatusListener
{
	networkStatusListener : CallbackNetworkStatusListener;
}
