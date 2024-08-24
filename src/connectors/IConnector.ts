import { PushServerResponse } from "../models/PushServerResponse";
import { PublishRequest } from "../models/requests/PublishRequest";
import { SubscribeRequest } from "../models/requests/SubscribeRequest";
import { UnsubscribeRequest } from "../models/requests/UnsubscribeRequest";
import { PullRequest } from "../models/requests/PullRequest";
import { StatusRequest } from "../models/requests/StatusRequest";


export interface IConnector
{
	publish( publishRequest : PublishRequest ) : Promise< PushServerResponse >;
	subscribe( subscribeRequest : SubscribeRequest ) : Promise< PushServerResponse >;
	unsubscribe( unsubscribeRequest : UnsubscribeRequest ) : Promise< PushServerResponse >;
	status( statusRequest : StatusRequest ) : Promise< PushServerResponse >;
	pull( pullRequest : PullRequest ) : Promise< PushServerResponse >;

	send( eventName : string, arg : any, retry ? : number ) : Promise<any>
}