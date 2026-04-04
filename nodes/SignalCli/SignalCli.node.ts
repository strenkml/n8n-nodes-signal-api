import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';

export class SignalCli implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Signal CLI',
		name: 'signalCli',
		icon: 'file:signal.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send and receive Signal messages via signal-cli-rest-api',
		defaults: {
			name: 'Signal CLI',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'signalCliApi',
				required: true,
			},
		],
		properties: [
			// ─── Resource ────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Attachment', value: 'attachment' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Group', value: 'group' },
					{ name: 'Message', value: 'message' },
				],
				default: 'message',
			},

			// ─── ACCOUNT operations ───────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all registered/linked accounts',
						action: 'List all accounts',
					},
				],
				default: 'list',
			},

			// ─── ATTACHMENT operations ────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['attachment'] } },
				options: [
					{
						name: 'Delete',
						value: 'delete',
						description: 'Remove an attachment from the filesystem',
						action: 'Delete an attachment',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all downloaded attachments',
						action: 'List all attachments',
					},
				],
				default: 'list',
			},

			// ─── CONTACT operations ───────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all contacts for an account',
						action: 'List contacts',
					},
					{
						name: 'Sync',
						value: 'sync',
						description: 'Send a contacts sync message to linked devices',
						action: 'Sync contacts',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update (or add) a contact entry',
						action: 'Update a contact',
					},
				],
				default: 'list',
			},

			// ─── GROUP operations ─────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['group'] } },
				options: [
					{
						name: 'Add Members',
						value: 'addMembers',
						description: 'Add one or more members to a group',
						action: 'Add members to a group',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new Signal group',
						action: 'Create a group',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a Signal group',
						action: 'Delete a group',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get details of a specific group',
						action: 'Get a group',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all Signal groups',
						action: 'List all groups',
					},
					{
						name: 'Remove Members',
						value: 'removeMembers',
						description: 'Remove one or more members from a group',
						action: 'Remove members from a group',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a Signal group name, description, or settings',
						action: 'Update a group',
					},
				],
				default: 'list',
			},

			// ─── MESSAGE operations ───────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Delete (Remote)',
						value: 'delete',
						description: 'Delete a sent message for all recipients',
						action: 'Delete a message remotely',
					},
					{
						name: 'React',
						value: 'react',
						description: 'Send a reaction emoji to a message',
						action: 'React to a message',
					},
					{
						name: 'Receive',
						value: 'receive',
						description: 'Receive pending Signal messages',
						action: 'Receive messages',
					},
					{
						name: 'Remove Reaction',
						value: 'removeReaction',
						description: 'Remove a reaction from a message',
						action: 'Remove a reaction',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send a Signal message',
						action: 'Send a message',
					},
					{
						name: 'Send and Wait for Response',
						value: 'sendAndWait',
						description: 'Send a message and wait for a reply from the recipient',
						action: 'Send a message and wait for a reply',
					},
					{
						name: 'Send Receipt',
						value: 'sendReceipt',
						description: 'Send a read or viewed receipt',
						action: 'Send a receipt',
					},
				],
				default: 'send',
			},

			// ═══════════════════════════════════════════════════════════════
			// MESSAGE – SEND
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Recipients',
				name: 'recipients',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Recipient' },
				default: [],
				description: 'Phone numbers or group IDs to send to (E.164 format or group ID starting with group.)',
				required: true,
				displayOptions: { show: { resource: ['message'], operation: ['send'] } },
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'The text body of the message',
				displayOptions: { show: { resource: ['message'], operation: ['send'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['message'], operation: ['send'] } },
				options: [
					{
						displayName: 'Base64 Attachments',
						name: 'base64_attachments',
						type: 'string',
						typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Attachment' },
						default: [],
						description: 'Base64-encoded attachments. Format: <BASE64> or data:<MIME>;base64,<BASE64> or data:<MIME>;filename=<NAME>;base64,<BASE64>',
					},
					{
						displayName: 'Text Mode',
						name: 'text_mode',
						type: 'options',
						options: [
							{ name: 'Normal', value: 'normal' },
							{ name: 'Styled (Markdown)', value: 'styled' },
						],
						default: 'normal',
						description: 'How to render message text formatting',
					},
					{
						displayName: 'Quote Author',
						name: 'quote_author',
						type: 'string',
						default: '',
						description: 'Phone number of the author being quoted',
					},
					{
						displayName: 'Quote Timestamp',
						name: 'quote_timestamp',
						type: 'number',
						default: 0,
						description: 'Timestamp of the message being quoted',
					},
					{
						displayName: 'Quote Message',
						name: 'quote_message',
						type: 'string',
						default: '',
						description: 'Text of the message being quoted',
					},
					{
						displayName: 'Notify Self',
						name: 'notify_self',
						type: 'boolean',
						default: false,
						description: 'Whether to send a copy to yourself (Note to Self)',
					},
					{
						displayName: 'View Once',
						name: 'view_once',
						type: 'boolean',
						default: false,
						description: 'Whether the message can only be viewed once',
					},
					{
						displayName: 'Edit Timestamp',
						name: 'edit_timestamp',
						type: 'number',
						default: 0,
						description: 'Timestamp of a previous message to edit (0 = new message)',
					},
				],
			},

			// ═══════════════════════════════════════════════════════════════
			// MESSAGE – SEND AND WAIT
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Recipient',
				name: 'sendWaitRecipient',
				type: 'string',
				default: '',
				placeholder: '+12025551234',
				required: true,
				description: 'Phone number to send the message to and wait for a reply from (E.164 format). Note: messages from other senders received during the wait period will be consumed from the queue.',
				displayOptions: { show: { resource: ['message'], operation: ['sendAndWait'] } },
			},
			{
				displayName: 'Message',
				name: 'sendWaitMessage',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'The text body of the message to send',
				displayOptions: { show: { resource: ['message'], operation: ['sendAndWait'] } },
			},
			{
				displayName: 'Max Wait Time (Seconds)',
				name: 'maxWaitTime',
				type: 'number',
				default: 60,
				description: 'Maximum total time to wait for a reply before timing out',
				displayOptions: { show: { resource: ['message'], operation: ['sendAndWait'] } },
			},
			{
				displayName: 'Poll Interval (Seconds)',
				name: 'pollTimeout',
				type: 'number',
				default: 5,
				description: 'How long each receive poll waits for messages before retrying',
				displayOptions: { show: { resource: ['message'], operation: ['sendAndWait'] } },
			},

			// ═══════════════════════════════════════════════════════════════
			// MESSAGE – RECEIVE
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Timeout (Seconds)',
				name: 'timeout',
				type: 'number',
				default: 1,
				description: 'How long to wait for messages (seconds)',
				displayOptions: { show: { resource: ['message'], operation: ['receive'] } },
			},

			// ═══════════════════════════════════════════════════════════════
			// MESSAGE – DELETE (REMOTE)
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Recipients',
				name: 'recipients',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Recipient' },
				default: [],
				required: true,
				description: 'Recipients the message was originally sent to',
				displayOptions: { show: { resource: ['message'], operation: ['delete'] } },
			},
			{
				displayName: 'Target Timestamp',
				name: 'timestamp',
				type: 'number',
				default: 0,
				required: true,
				description: 'Timestamp of the message to delete',
				displayOptions: { show: { resource: ['message'], operation: ['delete'] } },
			},

			// ═══════════════════════════════════════════════════════════════
			// MESSAGE – REACT / REMOVE REACTION
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Recipient',
				name: 'recipient',
				type: 'string',
				default: '',
				required: true,
				description: 'Phone number or group ID of the conversation',
				displayOptions: { show: { resource: ['message'], operation: ['react', 'removeReaction'] } },
			},
			{
				displayName: 'Target Author',
				name: 'target_author',
				type: 'string',
				default: '',
				required: true,
				description: 'Phone number of the author of the message being reacted to',
				displayOptions: { show: { resource: ['message'], operation: ['react', 'removeReaction'] } },
			},
			{
				displayName: 'Target Timestamp',
				name: 'timestamp',
				type: 'number',
				default: 0,
				required: true,
				description: 'Timestamp of the message being reacted to',
				displayOptions: { show: { resource: ['message'], operation: ['react', 'removeReaction'] } },
			},
			{
				displayName: 'Reaction Emoji',
				name: 'reaction',
				type: 'string',
				default: '👍',
				required: true,
				description: 'The emoji to react with',
				displayOptions: { show: { resource: ['message'], operation: ['react'] } },
			},

			// ═══════════════════════════════════════════════════════════════
			// MESSAGE – SEND RECEIPT
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Recipient',
				name: 'recipient',
				type: 'string',
				default: '',
				required: true,
				description: 'Phone number of the sender to send the receipt to',
				displayOptions: { show: { resource: ['message'], operation: ['sendReceipt'] } },
			},
			{
				displayName: 'Receipt Type',
				name: 'receipt_type',
				type: 'options',
				options: [
					{ name: 'Read', value: 'read' },
					{ name: 'Viewed', value: 'viewed' },
				],
				default: 'read',
				required: true,
				displayOptions: { show: { resource: ['message'], operation: ['sendReceipt'] } },
			},
			{
				displayName: 'Message Timestamp',
				name: 'timestamp',
				type: 'number',
				default: 0,
				required: true,
				description: 'Timestamp of the message being acknowledged',
				displayOptions: { show: { resource: ['message'], operation: ['sendReceipt'] } },
			},

			// ═══════════════════════════════════════════════════════════════
			// GROUP – LIST / GET
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				required: true,
				description: 'The group ID (base64-encoded)',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['get', 'delete', 'update', 'addMembers', 'removeMembers'],
					},
				},
			},
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'boolean',
				default: false,
				description: 'Whether to return detailed group information',
				displayOptions: { show: { resource: ['group'], operation: ['list', 'get'] } },
			},

			// ═══════════════════════════════════════════════════════════════
			// GROUP – CREATE
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Group Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['group'], operation: ['create'] } },
			},
			{
				displayName: 'Members',
				name: 'members',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Member' },
				default: [],
				description: 'Phone numbers to add to the group',
				displayOptions: { show: { resource: ['group'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['group'], operation: ['create'] } },
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Expiration Time (Seconds)',
						name: 'expiration_time',
						type: 'number',
						default: 0,
						description: 'Message expiration time in seconds (0 = disabled)',
					},
					{
						displayName: 'Group Link',
						name: 'group_link',
						type: 'options',
						options: [
							{ name: 'Disabled', value: 'disabled' },
							{ name: 'Enabled', value: 'enabled' },
							{ name: 'Enabled With Approval', value: 'enabled-with-approval' },
						],
						default: 'disabled',
					},
				],
			},

			// ═══════════════════════════════════════════════════════════════
			// GROUP – UPDATE
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['group'], operation: ['update'] } },
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Expiration Time (Seconds)',
						name: 'expiration_time',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Group Link',
						name: 'group_link',
						type: 'options',
						options: [
							{ name: 'Disabled', value: 'disabled' },
							{ name: 'Enabled', value: 'enabled' },
							{ name: 'Enabled With Approval', value: 'enabled-with-approval' },
						],
						default: 'disabled',
					},
					{
						displayName: 'Base64 Avatar',
						name: 'base64_avatar',
						type: 'string',
						default: '',
						description: 'Base64-encoded group avatar image',
					},
				],
			},

			// ═══════════════════════════════════════════════════════════════
			// GROUP – ADD / REMOVE MEMBERS
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Members',
				name: 'members',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Member' },
				default: [],
				required: true,
				description: 'Phone numbers to add or remove',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['addMembers', 'removeMembers'],
					},
				},
			},

			// ═══════════════════════════════════════════════════════════════
			// CONTACT – LIST
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Include All Recipients',
				name: 'all_recipients',
				type: 'boolean',
				default: false,
				description: 'Whether to include all known recipients, not only saved contacts',
				displayOptions: { show: { resource: ['contact'], operation: ['list'] } },
			},

			// ═══════════════════════════════════════════════════════════════
			// CONTACT – UPDATE
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Recipient Phone Number',
				name: 'recipient',
				type: 'string',
				default: '',
				required: true,
				description: 'Phone number of the contact to update (E.164 format)',
				displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Display name for the contact',
					},
					{
						displayName: 'Expiration Time (Seconds)',
						name: 'expiration_time',
						type: 'number',
						default: 0,
						description: 'Message expiration time for this contact (0 = disabled)',
					},
				],
			},

			// ═══════════════════════════════════════════════════════════════
			// ATTACHMENT – DELETE
			// ═══════════════════════════════════════════════════════════════
			{
				displayName: 'Attachment ID',
				name: 'attachmentId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['attachment'], operation: ['delete'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('signalCliApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		const number = credentials.number as string;

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			let responseData: IDataObject | IDataObject[];

			try {
				if (resource === 'account') {
					responseData = await handleAccount(this, baseUrl, operation, i);
				} else if (resource === 'attachment') {
					responseData = await handleAttachment(this, baseUrl, operation, i);
				} else if (resource === 'contact') {
					responseData = await handleContact(this, baseUrl, number, operation, i);
				} else if (resource === 'group') {
					responseData = await handleGroup(this, baseUrl, number, operation, i);
				} else if (resource === 'message') {
					responseData = await handleMessage(this, baseUrl, number, operation, i);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				throw error;
			}

			const resultArray = Array.isArray(responseData) ? responseData : [responseData];
			for (const item of resultArray) {
				returnData.push({ json: item, pairedItem: i });
			}
		}

		return [returnData];
	}
}

// ─── Helper: make authenticated requests ─────────────────────────────────────

async function apiRequest(
	context: IExecuteFunctions,
	method: IHttpRequestMethods,
	url: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	// Strip undefined/null/empty qs values
	const cleanQs: IDataObject = {};
	if (qs) {
		for (const [key, val] of Object.entries(qs)) {
			if (val !== undefined && val !== null && val !== '') {
				cleanQs[key] = val;
			}
		}
	}

	const options: IHttpRequestOptions = {
		method,
		url,
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: body as unknown as JsonObject,
		qs: Object.keys(cleanQs).length ? cleanQs : undefined,
	};

	return context.helpers.httpRequest(options) as Promise<IDataObject | IDataObject[]>;
}

// ─── Resource handlers ────────────────────────────────────────────────────────

async function handleAccount(
	context: IExecuteFunctions,
	baseUrl: string,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'list') {
		const result = await apiRequest(context, 'GET', `${baseUrl}/v1/accounts`);
		// Returns string array — wrap each in an object
		if (Array.isArray(result)) {
			return (result as unknown as string[]).map((n) => ({ number: n }));
		}
		return result as IDataObject;
	}
	throw new NodeOperationError(context.getNode(), `Unknown account operation: ${operation}`);
}

async function handleAttachment(
	context: IExecuteFunctions,
	baseUrl: string,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'list') {
		const result = await apiRequest(context, 'GET', `${baseUrl}/v1/attachments`);
		if (Array.isArray(result)) {
			return (result as unknown as string[]).map((id) => ({ id }));
		}
		return result as IDataObject;
	}

	if (operation === 'delete') {
		const attachmentId = context.getNodeParameter('attachmentId', i) as string;
		await apiRequest(context, 'DELETE', `${baseUrl}/v1/attachments/${encodeURIComponent(attachmentId)}`);
		return { success: true, id: attachmentId };
	}

	throw new NodeOperationError(context.getNode(), `Unknown attachment operation: ${operation}`);
}

async function handleContact(
	context: IExecuteFunctions,
	baseUrl: string,
	number: string,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {

	if (operation === 'list') {
		const allRecipients = context.getNodeParameter('all_recipients', i) as boolean;
		return apiRequest(
			context,
			'GET',
			`${baseUrl}/v1/contacts/${encodeURIComponent(number)}`,
			undefined,
			{ all_recipients: allRecipients || undefined },
		);
	}

	if (operation === 'sync') {
		await apiRequest(context, 'POST', `${baseUrl}/v1/contacts/${encodeURIComponent(number)}/sync`);
		return { success: true };
	}

	if (operation === 'update') {
		const recipient = context.getNodeParameter('recipient', i) as string;
		const updateFields = context.getNodeParameter('updateFields', i) as IDataObject;
		const body: IDataObject = { recipient };
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.expiration_time) body.expiration_time = updateFields.expiration_time;
		await apiRequest(context, 'PUT', `${baseUrl}/v1/contacts/${encodeURIComponent(number)}`, body);
		return { success: true };
	}

	throw new NodeOperationError(context.getNode(), `Unknown contact operation: ${operation}`);
}

async function handleGroup(
	context: IExecuteFunctions,
	baseUrl: string,
	number: string,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const encodedNumber = encodeURIComponent(number);

	if (operation === 'list') {
		const expand = context.getNodeParameter('expand', i) as boolean;
		return apiRequest(context, 'GET', `${baseUrl}/v1/groups/${encodedNumber}`, undefined, {
			expand: expand || undefined,
		});
	}

	if (operation === 'get') {
		const groupId = context.getNodeParameter('groupId', i) as string;
		const expand = context.getNodeParameter('expand', i) as boolean;
		return apiRequest(
			context,
			'GET',
			`${baseUrl}/v1/groups/${encodedNumber}/${encodeURIComponent(groupId)}`,
			undefined,
			{ expand: expand || undefined },
		);
	}

	if (operation === 'create') {
		const name = context.getNodeParameter('name', i) as string;
		const members = context.getNodeParameter('members', i) as string[];
		const additional = context.getNodeParameter('additionalFields', i) as IDataObject;
		const body: IDataObject = { name, members };
		if (additional.description) body.description = additional.description;
		if (additional.expiration_time) body.expiration_time = additional.expiration_time;
		if (additional.group_link) body.group_link = additional.group_link;
		return apiRequest(context, 'POST', `${baseUrl}/v1/groups/${encodedNumber}`, body) as Promise<IDataObject>;
	}

	if (operation === 'update') {
		const groupId = context.getNodeParameter('groupId', i) as string;
		const updateFields = context.getNodeParameter('updateFields', i) as IDataObject;
		const body: IDataObject = {};
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.description) body.description = updateFields.description;
		if (updateFields.expiration_time) body.expiration_time = updateFields.expiration_time;
		if (updateFields.group_link) body.group_link = updateFields.group_link;
		if (updateFields.base64_avatar) body.base64_avatar = updateFields.base64_avatar;
		await apiRequest(
			context,
			'PUT',
			`${baseUrl}/v1/groups/${encodedNumber}/${encodeURIComponent(groupId)}`,
			body,
		);
		return { success: true };
	}

	if (operation === 'delete') {
		const groupId = context.getNodeParameter('groupId', i) as string;
		await apiRequest(
			context,
			'DELETE',
			`${baseUrl}/v1/groups/${encodedNumber}/${encodeURIComponent(groupId)}`,
		);
		return { success: true };
	}

	if (operation === 'addMembers') {
		const groupId = context.getNodeParameter('groupId', i) as string;
		const members = context.getNodeParameter('members', i) as string[];
		await apiRequest(
			context,
			'POST',
			`${baseUrl}/v1/groups/${encodedNumber}/${encodeURIComponent(groupId)}/members`,
			{ members },
		);
		return { success: true };
	}

	if (operation === 'removeMembers') {
		const groupId = context.getNodeParameter('groupId', i) as string;
		const members = context.getNodeParameter('members', i) as string[];
		await apiRequest(
			context,
			'DELETE',
			`${baseUrl}/v1/groups/${encodedNumber}/${encodeURIComponent(groupId)}/members`,
			{ members },
		);
		return { success: true };
	}

	throw new NodeOperationError(context.getNode(), `Unknown group operation: ${operation}`);
}

async function handleMessage(
	context: IExecuteFunctions,
	baseUrl: string,
	number: string,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const encodedNumber = encodeURIComponent(number);

	if (operation === 'send') {
		const recipients = context.getNodeParameter('recipients', i) as string[];
		const message = context.getNodeParameter('message', i) as string;
		const additional = context.getNodeParameter('additionalFields', i) as IDataObject;

		const body: IDataObject = { number, recipients, message };
		if (additional.base64_attachments && (additional.base64_attachments as string[]).length > 0) {
			body.base64_attachments = additional.base64_attachments;
		}
		if (additional.text_mode && additional.text_mode !== 'normal') {
			body.text_mode = additional.text_mode;
		}
		if (additional.quote_author) body.quote_author = additional.quote_author;
		if (additional.quote_timestamp) body.quote_timestamp = additional.quote_timestamp;
		if (additional.quote_message) body.quote_message = additional.quote_message;
		if (additional.notify_self) body.notify_self = additional.notify_self;
		if (additional.view_once) body.view_once = additional.view_once;
		if (additional.edit_timestamp) body.edit_timestamp = additional.edit_timestamp;

		return apiRequest(context, 'POST', `${baseUrl}/v2/send`, body) as Promise<IDataObject>;
	}

	if (operation === 'receive') {
		const timeout = context.getNodeParameter('timeout', i) as number;
		const result = await apiRequest(
			context,
			'GET',
			`${baseUrl}/v1/receive/${encodedNumber}`,
			undefined,
			{ timeout },
		);
		if (Array.isArray(result)) return result as IDataObject[];
		return result as IDataObject;
	}

	if (operation === 'delete') {
		const recipients = context.getNodeParameter('recipients', i) as string[];
		const timestamp = context.getNodeParameter('timestamp', i) as number;
		await apiRequest(context, 'DELETE', `${baseUrl}/v1/remote-delete/${encodedNumber}`, {
			recipients,
			timestamp,
		});
		return { success: true };
	}

	if (operation === 'react') {
		const recipient = context.getNodeParameter('recipient', i) as string;
		const targetAuthor = context.getNodeParameter('target_author', i) as string;
		const timestamp = context.getNodeParameter('timestamp', i) as number;
		const reaction = context.getNodeParameter('reaction', i) as string;
		return apiRequest(context, 'POST', `${baseUrl}/v1/reactions/${encodedNumber}`, {
			recipient,
			target_author: targetAuthor,
			timestamp,
			reaction,
		}) as Promise<IDataObject>;
	}

	if (operation === 'removeReaction') {
		const recipient = context.getNodeParameter('recipient', i) as string;
		const targetAuthor = context.getNodeParameter('target_author', i) as string;
		const timestamp = context.getNodeParameter('timestamp', i) as number;
		await apiRequest(context, 'DELETE', `${baseUrl}/v1/reactions/${encodedNumber}`, {
			recipient,
			target_author: targetAuthor,
			timestamp,
		});
		return { success: true };
	}

	if (operation === 'sendAndWait') {
		const recipient = context.getNodeParameter('sendWaitRecipient', i) as string;
		const message = context.getNodeParameter('sendWaitMessage', i) as string;
		const maxWaitTime = context.getNodeParameter('maxWaitTime', i) as number;
		const pollTimeout = context.getNodeParameter('pollTimeout', i) as number;

		// Send the message
		await apiRequest(context, 'POST', `${baseUrl}/v2/send`, {
			number,
			recipients: [recipient],
			message,
		});

		const startTime = Date.now();
		const maxWaitMs = maxWaitTime * 1000;

		// Poll for a reply from the recipient
		while (Date.now() - startTime < maxWaitMs) {
			const remaining = Math.ceil((maxWaitMs - (Date.now() - startTime)) / 1000);
			const currentPollTimeout = Math.min(pollTimeout, remaining);

			const result = await apiRequest(
				context,
				'GET',
				`${baseUrl}/v1/receive/${encodedNumber}`,
				undefined,
				{ timeout: currentPollTimeout },
			);

			const msgs = Array.isArray(result) ? result : [result];
			for (const msg of msgs) {
				const envelope = (msg as IDataObject).envelope as IDataObject;
				if (envelope && envelope.source === recipient && envelope.dataMessage) {
					return msg as IDataObject;
				}
			}
		}

		throw new NodeOperationError(
			context.getNode(),
			`Timed out waiting for a response from ${recipient} after ${maxWaitTime} seconds`,
		);
	}

	if (operation === 'sendReceipt') {
		const recipient = context.getNodeParameter('recipient', i) as string;
		const receiptType = context.getNodeParameter('receipt_type', i) as string;
		const timestamp = context.getNodeParameter('timestamp', i) as number;
		await apiRequest(context, 'POST', `${baseUrl}/v1/receipts/${encodedNumber}`, {
			recipient,
			receipt_type: receiptType,
			timestamp,
		});
		return { success: true };
	}

	throw new NodeOperationError(context.getNode(), `Unknown message operation: ${operation}`);
}
