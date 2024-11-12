/**
 * 	define type
 */
export type CallbackClientEventReceiver = ( channel : string, event : any, callback ?: ( ack : any ) => void ) => void;

/**
 * 	define interface
 */
export interface IClientEventReceiver
{
	clientEventReceiver: CallbackClientEventReceiver;
}
