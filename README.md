# Data Group Plugin

A Claude Code plugin collection for the data group team. This repository contains protocols that can be installed individually or as a complete collection from the Claude Code marketplace.

## Installation

### From Marketplace

Add the plugin repository to Claude Code:

```bash
/plugin marketplace add https://github.com/DeweyLee47/data-group-plugin
```

Install a specific protocol:

```bash
/plugin install event-taxonomy
```

### Available Protocols

| Protocol | Description |
|----------|-------------|
| `event-taxonomy` | Event taxonomy management and synchronization tools |

## Prerequisites

### sync-taxonomy-events

Requires the following MCP servers to be configured:

- **Notion MCP** - For reading Event Change History and writing to Aqueduct Taxonomy
- **Figma MCP** - For fetching design links

## Usage

Once installed, invoke protocols using the slash command:

```bash
/sync-taxonomy-events [notion-url]
```

## For Contributors

See [CLAUDE.md](./CLAUDE.md) for architecture details and contribution guidelines.

### Creating a New Protocol

1. Copy `example-protocol/` directory
2. Rename to your protocol name
3. Update `plugin.json` and `SKILL.md`
4. Add entry to `.claude-plugin/marketplace.json`
5. Run `/verify` to validate

### Project Structure

```
data-group-plugin/
├── .claude-plugin/marketplace.json   # Marketplace manifest
├── .claude/skills/verify/            # Verification skill
├── event-taxonomy/                   # Event taxonomy protocol
│   ├── .claude-plugin/plugin.json
│   └── skills/sync-taxonomy-events/
│       └── SKILL.md
└── shared/templates/                 # Blank templates
```

## Verification

Validate plugin structure before publishing:

```bash
/verify
```

Or run directly:

```bash
node .claude/skills/verify/scripts/static-checks.js
```

## License

MIT
