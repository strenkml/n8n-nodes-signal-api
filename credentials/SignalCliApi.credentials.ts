import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SignalCliApi implements ICredentialType {
	name = 'signalCliApi';
	displayName = 'Signal CLI REST API';
	documentationUrl = 'https://github.com/bbernhard/signal-cli-rest-api';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8080',
			placeholder: 'http://localhost:8080',
			description: 'Base URL of your signal-cli-rest-api instance',
			required: true,
		},
		{
			displayName: 'Phone Number',
			name: 'number',
			type: 'string',
			default: '',
			placeholder: '+12025551234',
			description: 'The registered Signal phone number for this account (E.164 format)',
			required: true,
		},
	];
}
