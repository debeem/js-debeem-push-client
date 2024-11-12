/**
 * 	define type
 */
export type CallbackServerEventReceiver = ( event : any, callback ?: ( ack : any ) => void ) => void;


/**
 * 	define interface
 */
export interface IServerEventReceiver
{
	serverEventReceiver: CallbackServerEventReceiver;
}
