import _ from "lodash";


export class VaTimestamp
{
	static validateTimestampStrictly( timestamp : any ) : string | null
	{
		if ( ! _.isNumber( timestamp ) )
		{
			return `invalid timestamp`;
		}
		if ( timestamp <= 0 )
		{
			return `invalid timestamp, too young`;
		}
		if ( timestamp > ( new Date().getTime() + 60 * 60 * 1000 ) )
		{
			//	already 1 hour later than the current time
			return `invalid .timestamp, much later than the current time`;
		}

		const timeDifference = Math.abs(Date.now() - timestamp );
		if ( timeDifference > 10 * 60 * 1000 )
		{
			//	The time difference is more than 10 minutes from the current time
			return `invalid .timestamp, more than 10 minutes gap from current time`;
		}

		return null;
	}
}
