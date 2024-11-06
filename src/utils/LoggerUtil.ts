import log, { Logger, LogLevelNames, LogLevelNumbers } from 'loglevel';
export { Logger };

/**
 * 	get original factory
 */
const originalFactory = log.methodFactory;



/**
 * 	@class
 */
export class LoggerUtil
{
	constructor()
	{
		log.setLevel( `debug` );


		log.methodFactory = function ( methodName : LogLevelNames, logLevel : LogLevelNumbers, loggerName )
		{
			let rawMethod = originalFactory( methodName, logLevel, loggerName );
			return function ( message )
			{
				const timestamp = new Date().toISOString();
				rawMethod( `[${ timestamp }] ${ methodName } : ${ message }` );
			};
		};

		//	Be sure to call the rebuild method in order to apply plugin.
		log.rebuild();
	}

	/**
	 *	@returns {Logger}
	 */
	public get logger() : Logger
	{
		return log;
	}
}
