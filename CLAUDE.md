# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Description

Data Group Plugin is a Claude Code plugin collection for the data group team. It follows the epistemic-protocols architecture pattern and is designed to be published to the Claude Code marketplace for team-wide usage.

## Architecture Overview

```
data-group-plugin/
├── .claude-plugin/
│   └── marketplace.json        # Marketplace manifest (lists all protocols)
├── .claude/skills/
│   └── verify/                 # Project-level verification skill
├── example-protocol/           # Template protocol (copy for new protocols)
│   ├── .claude-plugin/
│   │   └── plugin.json        # Protocol metadata
│   └── skills/
│       └── example-protocol/
│           ├── SKILL.md       # Main skill definition
│           └── references/    # Additional documentation
└── shared/templates/          # Blank templates for new protocols
```

### Key Components

1. **Marketplace Manifest** (`.claude-plugin/marketplace.json`): Top-level registry listing all protocols available in this repository.

2. **Protocol Plugin** (`<protocol>/.claude-plugin/plugin.json`): Per-protocol metadata for individual installation.

3. **Skill Definition** (`<protocol>/skills/<protocol>/SKILL.md`): The core skill file that defines protocol behavior, phases, and tool usage.

## Protocol Structure Requirements

Every protocol must have:

- `.claude-plugin/plugin.json` with `name`, `description`, `version`
- `skills/<protocol-name>/SKILL.md` with valid frontmatter
- Entry in root `.claude-plugin/marketplace.json`

### SKILL.md Frontmatter

```yaml
---
name: protocol-name
description: Brief description
user-invocable: true
allowed-tools: [Read, Grep, Glob, AskUserQuestion, Task]
---
```

### Required SKILL.md Sections

- `## Definition` - Formal flow notation
- `## Mode Activation` - When protocol activates
- `## Phase Transitions` - Step-by-step phase breakdown
- `## Tool Grounding` - Maps phases to Claude Code tools
- `## Rules` - Constraints and criteria

## Creating a New Protocol

1. Copy `example-protocol/` to `<new-protocol-name>/`
2. Rename `skills/example-protocol/` to `skills/<new-protocol-name>/`
3. Update `.claude-plugin/plugin.json` with new name/description
4. Edit `skills/<new-protocol-name>/SKILL.md` with protocol logic
5. Add entry to `.claude-plugin/marketplace.json`
6. Run `/verify` to validate structure

## Verification

Run `/verify` to validate the entire plugin structure:

```bash
/verify              # Run all checks
/verify <protocol>   # Verify specific protocol only
```

Or run the static checks directly:

```bash
node .claude/skills/verify/scripts/static-checks.js
```

## Build Commands

No build step required. This is a pure Claude Code plugin repository.

## Contribution Guidelines

1. Follow the existing protocol structure exactly
2. Always run `/verify` before committing
3. Use descriptive English names (e.g., `data-analyzer`, `report-builder`)
4. Include comprehensive SKILL.md documentation
5. Add reference documents in `references/` for complex protocols
