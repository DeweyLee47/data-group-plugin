---
name: verify
description: Validate plugin structure and run static checks on all protocols
user-invocable: true
allowed-tools: [Read, Grep, Glob, Bash, Task]
---

# Verify Plugin Structure

Validates the data-group-plugin repository structure and ensures all protocols conform to required standards.

## Definition

```
PROTOCOL verify
  PHASES: [Scan, Validate, Report]

  Scan → Validate
    TRIGGER: User invokes /verify
    ACTIONS: Discover all protocols in repository

  Validate → Report
    TRIGGER: Protocol list compiled
    ACTIONS: Run validation checks on each protocol

  Report → END
    TRIGGER: All validations complete
    ACTIONS: Present results with pass/fail status
```

## Mode Activation

This protocol activates when:
- User invokes `/verify`
- User asks to validate plugin structure
- Before publishing to marketplace

## Validation Checks

### 1. Marketplace Manifest
- [ ] `.claude-plugin/marketplace.json` exists
- [ ] Contains required fields: `name`, `owner`, `plugins`
- [ ] Each plugin entry has `name`, `source`, `description`
- [ ] All referenced sources exist as directories

### 2. Per-Protocol Structure
For each protocol directory:
- [ ] `.claude-plugin/plugin.json` exists with valid JSON
- [ ] Contains required fields: `name`, `description`, `version`
- [ ] `skills/<protocol-name>/SKILL.md` exists
- [ ] SKILL.md has valid frontmatter with required fields

### 3. SKILL.md Validation
- [ ] Has `name` in frontmatter
- [ ] Has `description` in frontmatter
- [ ] Has `user-invocable` boolean
- [ ] Has `allowed-tools` array
- [ ] Contains Definition section
- [ ] Contains Phase Transitions section

### 4. Cross-Reference Validation
- [ ] Protocol name in `plugin.json` matches directory name
- [ ] Protocol name in SKILL.md matches `plugin.json`
- [ ] Marketplace entry matches protocol directory

## Usage

```bash
/verify              # Run all checks
/verify --fix        # Attempt to fix common issues
/verify <protocol>   # Verify specific protocol only
```

## Output Format

```
Verification Results
====================

✓ Marketplace manifest valid
✓ example-protocol: structure valid
✓ example-protocol: SKILL.md valid
✗ new-protocol: missing plugin.json

Summary: 3 passed, 1 failed
```

## Automated Checks

This skill uses `scripts/static-checks.js` for programmatic validation.

Run manually:
```bash
node .claude/skills/verify/scripts/static-checks.js
```
