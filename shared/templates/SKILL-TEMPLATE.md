---
name: protocol-name
description: Brief description of what this protocol does
user-invocable: true
allowed-tools: [Read, Grep, Glob, AskUserQuestion, Task]
---

# Protocol Name

One-line summary of the protocol's purpose.

## Definition

```
PROTOCOL protocol-name
  PHASES: [Phase1, Phase2, Phase3]

  Phase1 → Phase2
    TRIGGER: Description of what triggers this transition
    ACTIONS: What happens in this phase

  Phase2 → Phase3
    TRIGGER: Description of trigger
    ACTIONS: What happens

  Phase3 → END
    TRIGGER: Completion condition
    ACTIONS: Final actions
```

## Mode Activation

This protocol activates when:
- User invokes `/protocol-name`
- [Add other activation conditions]

## Phase Transitions

### Phase 1: [Name]
**Purpose**: What this phase accomplishes.

**Actions**:
1. First action
2. Second action

**Outputs**: What this phase produces

### Phase 2: [Name]
**Purpose**: What this phase accomplishes.

**Actions**:
1. First action
2. Second action

**Outputs**: What this phase produces

### Phase 3: [Name]
**Purpose**: What this phase accomplishes.

**Actions**:
1. First action
2. Second action

**Outputs**: What this phase produces

## Tool Grounding

| Phase | Primary Tools | Purpose |
|-------|--------------|---------|
| Phase1 | Tool1, Tool2 | Why these tools |
| Phase2 | Tool3 | Why this tool |
| Phase3 | Tool4 | Why this tool |

## Rules

1. **Rule Name**: Description of the rule
2. **Rule Name**: Description of the rule

## Usage

```bash
/protocol-name [options]
```

### Options
- `--option1`: Description
- `--option2`: Description

## Examples

### Basic Usage
```
User: /protocol-name
Assistant: [Expected behavior]
```

### With Options
```
User: /protocol-name --option1
Assistant: [Expected behavior]
```
