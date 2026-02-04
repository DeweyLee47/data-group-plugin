#!/usr/bin/env node

/**
 * Static validation checks for data-group-plugin
 *
 * Validates:
 * - Marketplace manifest structure
 * - Per-protocol plugin.json files
 * - SKILL.md frontmatter and required sections
 * - Cross-references between files
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const CLAUDE_PLUGIN_DIR = path.join(ROOT_DIR, '.claude-plugin');

// ANSI colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function pass(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
  return true;
}

function fail(msg) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
  return false;
}

function warn(msg) {
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim());
      }
      // Parse booleans
      else if (value === 'true') value = true;
      else if (value === 'false') value = false;

      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

function validateMarketplace() {
  console.log(`\n${colors.bold}Marketplace Manifest${colors.reset}`);

  const manifestPath = path.join(CLAUDE_PLUGIN_DIR, 'marketplace.json');

  if (!fs.existsSync(manifestPath)) {
    return fail('marketplace.json not found');
  }

  const manifest = readJSON(manifestPath);
  if (!manifest) {
    return fail('marketplace.json is not valid JSON');
  }

  let valid = true;

  // Check required fields
  if (!manifest.name) {
    valid = fail('marketplace.json missing "name" field') && valid;
  } else {
    pass(`name: "${manifest.name}"`);
  }

  if (!manifest.owner || !manifest.owner.name) {
    valid = fail('marketplace.json missing "owner.name" field') && valid;
  } else {
    pass(`owner: "${manifest.owner.name}"`);
  }

  if (!Array.isArray(manifest.plugins)) {
    valid = fail('marketplace.json missing "plugins" array') && valid;
  } else {
    pass(`plugins: ${manifest.plugins.length} registered`);

    // Validate each plugin entry
    for (const plugin of manifest.plugins) {
      if (!plugin.name || !plugin.source || !plugin.description) {
        valid = fail(`plugin entry missing required fields: ${JSON.stringify(plugin)}`) && valid;
      } else {
        const sourcePath = path.join(ROOT_DIR, plugin.source);
        if (!fs.existsSync(sourcePath)) {
          valid = fail(`plugin "${plugin.name}" source not found: ${plugin.source}`) && valid;
        }
      }
    }
  }

  return valid;
}

function validateSkill(skillsDir, skillFolder) {
  const skillPath = path.join(skillsDir, skillFolder, 'SKILL.md');

  if (!fs.existsSync(skillPath)) {
    return fail(`skills/${skillFolder}/SKILL.md not found`);
  }

  const skillContent = fs.readFileSync(skillPath, 'utf8');
  const frontmatter = parseFrontmatter(skillContent);

  let valid = true;

  if (!frontmatter) {
    valid = fail(`skills/${skillFolder}/SKILL.md missing frontmatter (---...---)`) && valid;
  } else {
    // Validate frontmatter fields
    const requiredFrontmatter = ['name', 'description', 'user-invocable', 'allowed-tools'];
    for (const field of requiredFrontmatter) {
      if (frontmatter[field] === undefined) {
        valid = fail(`skills/${skillFolder}/SKILL.md frontmatter missing "${field}"`) && valid;
      }
    }

    // Validate skill name matches folder name (not protocol name)
    if (frontmatter.name !== skillFolder) {
      warn(`SKILL.md name "${frontmatter.name}" doesn't match folder "${skillFolder}"`);
    }
  }

  // Check required sections
  const requiredSections = ['Definition', 'Phase Transitions'];
  for (const section of requiredSections) {
    if (!skillContent.includes(`## ${section}`)) {
      valid = fail(`skills/${skillFolder}/SKILL.md missing "## ${section}" section`) && valid;
    }
  }

  if (valid) {
    pass(`skills/${skillFolder}/SKILL.md valid`);
  }

  return valid;
}

function validateProtocol(protocolDir) {
  const protocolName = path.basename(protocolDir);
  console.log(`\n${colors.bold}Protocol: ${protocolName}${colors.reset}`);

  let valid = true;

  // Check plugin.json
  const pluginJsonPath = path.join(protocolDir, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(pluginJsonPath)) {
    return fail('missing .claude-plugin/plugin.json');
  }

  const pluginJson = readJSON(pluginJsonPath);
  if (!pluginJson) {
    return fail('plugin.json is not valid JSON');
  }

  // Validate plugin.json fields
  const requiredPluginFields = ['name', 'description', 'version'];
  for (const field of requiredPluginFields) {
    if (!pluginJson[field]) {
      valid = fail(`plugin.json missing "${field}" field`) && valid;
    }
  }

  if (pluginJson.name !== protocolName) {
    warn(`plugin.json name "${pluginJson.name}" doesn't match directory "${protocolName}"`);
  }

  if (valid) {
    pass(`plugin.json valid (v${pluginJson.version})`);
  }

  // Check skills directory
  const skillsDir = path.join(protocolDir, 'skills');
  if (!fs.existsSync(skillsDir)) {
    return fail('missing skills/ directory');
  }

  // Discover skill folders
  const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  if (skillFolders.length === 0) {
    return fail('no skill folders found in skills/');
  }

  // Validate each discovered skill
  for (const skillFolder of skillFolders) {
    valid = validateSkill(skillsDir, skillFolder) && valid;
  }

  return valid;
}

function discoverProtocols() {
  const protocols = [];
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'shared' && entry.name !== 'node_modules') {
      const pluginJsonPath = path.join(ROOT_DIR, entry.name, '.claude-plugin', 'plugin.json');
      if (fs.existsSync(pluginJsonPath)) {
        protocols.push(path.join(ROOT_DIR, entry.name));
      }
    }
  }

  return protocols;
}

function main() {
  console.log(`${colors.bold}Data Group Plugin - Static Validation${colors.reset}`);
  console.log('='.repeat(40));

  let passed = 0;
  let failed = 0;

  // Validate marketplace
  if (validateMarketplace()) {
    passed++;
  } else {
    failed++;
  }

  // Discover and validate protocols
  const protocols = discoverProtocols();

  if (protocols.length === 0) {
    warn('No protocols found');
  }

  for (const protocol of protocols) {
    if (validateProtocol(protocol)) {
      passed++;
    } else {
      failed++;
    }
  }

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`${colors.bold}Summary${colors.reset}: ${colors.green}${passed} passed${colors.reset}, ${colors.red}${failed} failed${colors.reset}`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
