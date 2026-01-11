#!/usr/bin/env node

/**
 * Google Lighthouse CLI (gl)
 *
 * A CLI tool for initializing Lighthouse skill in your project.
 * Supports Cursor, Claude Code, and Antigravity IDEs.
 *
 * Usage:
 *   gl init              - Initialize Lighthouse skill in current project
 *   gl analyze <report>   - Analyze a Lighthouse report
 *   gl fixes <report>     - Generate fix suggestions
 *   gl --help            - Show help
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');

// Import commands
const init = require('../src/commands/init');
const analyze = require('../src/commands/analyze');
const fixes = require('../src/commands/fixes');

const packageJson = require('../package.json');

program
  .name('gl')
  .description(packageJson.description)
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Initialize Google Lighthouse skill in your project')
  .option('-y, --yes', 'Skip prompts with defaults')
  .option('--ide <type>', 'Specify IDE type (cursor, claude, antigravity, all)')
  .action(init);

// Analyze command
program
  .command('analyze [report]')
  .description('Analyze a Lighthouse JSON report')
  .option('-c, --category <name>', 'Filter by category (performance, accessibility, seo, best-practices)')
  .option('-s, --min-score <score>', 'Minimum score threshold (0-1)', '0.5')
  .option('-f, --format <format>', 'Output format (markdown, json)', 'markdown')
  .option('-v, --verbose', 'Show detailed information')
  .action(analyze);

// Fixes command
program
  .command('fixes [report]')
  .description('Generate fix suggestions from Lighthouse report')
  .option('-c, --category <name>', 'Filter by category')
  .option('-o, --output <path>', 'Write output to file')
  .action(fixes);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
