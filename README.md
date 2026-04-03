# n8n-nodes-signal-api

An [n8n](https://n8n.io) community node for interacting with [signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api) — a REST API wrapper around [signal-cli](https://github.com/AsamK/signal-cli).

## Prerequisites

A running instance of [signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api) with at least one registered or linked Signal account.

## Installation

In your n8n instance, go to **Settings → Community Nodes** and install:

```
n8n-nodes-signal-api
```

## Credentials

Add a **Signal CLI REST API** credential with the base URL of your signal-cli-rest-api instance (e.g. `http://localhost:8080`).

## Supported Resources & Operations

### Message
| Operation | Description |
|---|---|
| Send | Send a message to one or more recipients or groups (v2 API) |
| Receive | Poll for pending incoming messages |
| Delete (Remote) | Delete a sent message for all recipients |
| React | Send a reaction emoji to a message |
| Remove Reaction | Remove a previously sent reaction |
| Send Receipt | Send a read or viewed receipt |

### Group
| Operation | Description |
|---|---|
| List | List all Signal groups for an account |
| Get | Get details of a specific group |
| Create | Create a new Signal group |
| Update | Update a group's name, description, avatar, or settings |
| Delete | Delete a Signal group |
| Add Members | Add one or more members to a group |
| Remove Members | Remove one or more members from a group |

### Contact
| Operation | Description |
|---|---|
| List | List all contacts for an account |
| Update | Update (or add) a contact entry |
| Sync | Send a contacts sync message to all linked devices |

### Account
| Operation | Description |
|---|---|
| List | List all registered and linked accounts |

### Attachment
| Operation | Description |
|---|---|
| List | List all downloaded attachments |
| Delete | Remove an attachment from the filesystem |

## Usage Notes

- Phone numbers must be in **E.164 format** (e.g. `+12025551234`)
- To send to a group, pass the group ID (base64-encoded) as the recipient — it will start with `group.`
- Attachments can be sent as base64-encoded strings in the formats:
  - `<BASE64>`
  - `data:<MIME-TYPE>;base64,<BASE64>`
  - `data:<MIME-TYPE>;filename=<FILENAME>;base64,<BASE64>`

## License

MIT
