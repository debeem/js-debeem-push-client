import { PushServerResponse } from "../models/PushServerResponse";
import { PublishRequest } from "../models/requests/PublishRequest";
import { SubscribeRequest } from "../models/requests/SubscribeRequest";
import { UnsubscribeRequest } from "../models/requests/UnsubscribeRequest";
import { PullRequest } from "../models/requests/PullRequest";
import { StatusRequest } from "../models/requests/StatusRequest";
import { WebsocketConnector } from "./impls/websocket/WebsocketConnector";
import { CountRequest } from "../models/requests/CountRequest";
import { CallbackNetworkStatusListener } from "../models/callbacks/NetworkStatusListener";


/**
 * 	connector types
 */
export interface ConnectorMap
{
	ws : WebsocketConnector;
}

/**
 * 	connector definition
 */
export interface IConnector
{
	/**
	 *	set up a callback function to listen for the network status changes
	 */
	setNetworkStatusListener( callback : CallbackNetworkStatusListener ) : void;

	/**
	 * 	wait until the client connected to server successfully
	 */
	waitUntilConnected( timeout : number ) : Promise<void>;

	/**
	 *	close the connection to server
	 */
	close() : void;

	/**
	 *	for publishers
	 *	@param publishRequest
	 */
	publish( publishRequest : PublishRequest ) : Promise< PushServerResponse >;


	/**
	 * 	for subscribers
	 *	@param subscribeRequest
	 *	@returns {Promise< PushServerResponse >}
	 */
	subscribe( subscribeRequest : SubscribeRequest ) : Promise< PushServerResponse >;
	unsubscribe( unsubscribeRequest : UnsubscribeRequest ) : Promise< PushServerResponse >;
	status( statusRequest : StatusRequest ) : Promise< PushServerResponse >;
	pull( pullRequest : PullRequest ) : Promise< PushServerResponse >;
	count( countRequest : CountRequest ) : Promise< PushServerResponse >;


	/**
	 * 	common function
	 *	@param eventName	{string}
	 *	@param arg		{any}
	 *	@param [retry]		{number}
	 *	@returns {Promise<any>}
	 */
	send( eventName : string, arg : any, retry ? : number ) : Promise<any>
}
