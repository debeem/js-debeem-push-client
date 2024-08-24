export const defaultVersionNumber: string = `1.0.0`;

export interface PushServerResponse
{
	/**
	 * 	now timestamp
	 */
	timestamp ?: number;

	/**
	 * 	server id
	 */
	serverId ?: string | null;

	/**
	 * 	service version
	 */
	version ?: string;

	/**
	 * 	use HTTP Status
	 */
	status ?: number;

	/**
	 * 	error description
	 */
	error ?: any;

	/**
	 * 	data
	 */
	data ?: any;
}