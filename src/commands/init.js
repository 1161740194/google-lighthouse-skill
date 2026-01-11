/**
 * gl init command
 *
 * Initializes Google Lighthouse skill in the current project.
 * Prompts user to select IDE and creates appropriate skill files.
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');

const IDE_TEMPLATES = {
  claude: {
    name: 'Claude Code',
    description: 'Official Claude Code CLI and IDE',
    files: ['.claude/skills/lighthouse/SKILL.md', '.claude/skills/lighthouse/references'],
    skillPath: '.claude/skills/lighthouse',
    instructions: `The skill will be automatically loaded by Claude Code.
You can invoke it with:
- "Analyze the Lighthouse report"
- "Generate performance optimizations"
- "Check accessibility issues"
`
  },
  antigravity: {
    name: 'Antigravity',
    description: 'AI-powered development environment',
    files: ['.agent/workflows/google-lighthouse.md'],
    skillPath: '.agent/workflows',
    instructions: `The skill is automatically loaded from .agent/workflows/
You can invoke it by mentioning Lighthouse in your chat.
`
  }
};

/**
 * Get template content for a specific file
 */
function getTemplateContent(ide, templateFile) {
  const templates = {
    '.claude/skills/lighthouse/SKILL.md': getClaudeSkillTemplate(),
    '.agent/workflows/google-lighthouse.md': getAntigravitySkillTemplate()
  };

  return templates[templateFile] || '';
}

function getClaudeSkillTemplate() {
  return fs.readFileSync(path.join(__dirname, '../../templates/SKILL.md'), 'utf8');
}

function getAntigravitySkillTemplate() {
  return fs.readFileSync(path.join(__dirname, '../../templates/lighthouse-antigravity.md'), 'utf8');
}

/**
 * Create directory recursively
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Write file with content
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Copy template files to project
 */
function copyTemplates(ide, projectRoot) {
  const config = IDE_TEMPLATES[ide];
  const spinner = ora(`Copying ${config.name} templates...`).start();

  try {
    // Create skill directory structure
    const skillBasePath = path.join(projectRoot, config.skillPath);

    // Create main directories
    ensureDir(skillBasePath);
    ensureDir(path.join(projectRoot, '.lighthouse', 'reports'));

    // Write IDE-specific files
    if (ide === 'claude') {
      writeFile(path.join(skillBasePath, 'SKILL.md'), getClaudeSkillTemplate());
      // Claude Code uses separate references directory
      ensureDir(path.join(skillBasePath, 'references'));
      const refFiles = ['report-format.md', 'performance.md', 'seo.md', 'cli.md', 'accessibility.md'];
      const refsDir = path.join(__dirname, '../../templates/references');
      if (fs.existsSync(refsDir)) {
        refFiles.forEach(file => {
          const src = path.join(refsDir, file);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(skillBasePath, 'references', file));
          }
        });
      }
    } else if (ide === 'antigravity') {
      // Antigravity uses single file with all content
      writeFile(path.join(skillBasePath, 'google-lighthouse.md'), getAntigravitySkillTemplate());
    }

    // Create package.json script for running Lighthouse
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.scripts = pkg.scripts || {};
      pkg.scripts['lighthouse'] = 'gl analyze .lighthouse/reports/latest.json';
      pkg.scripts['lighthouse:audit'] = 'lighthouse http://localhost:3000 --output json --output-path .lighthouse/reports/$(date +%Y%m%d-%H%M%S).json';
      pkg.scripts['lighthouse:fixes'] = 'gl fixes .lighthouse/reports/latest.json';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }

    spinner.succeed(chalk.green(`${config.name} templates created`));
    return true;
  } catch (error) {
    spinner.fail(chalk.red('Failed to copy templates'));
    console.error(error);
    return false;
  }
}

/**
 * Create .lighthouse directory structure
 */
function createLighthouseDir(projectRoot) {
  const spinner = ora('Creating .lighthouse directory...').start();

  const lhDir = path.join(projectRoot, '.lighthouse');
  ensureDir(path.join(lhDir, 'reports'));
  ensureDir(path.join(lhDir, 'scripts'));

  // Create config file
  const config = {
    version: '1.0.0',
    created: new Date().toISOString(),
    ide: null
  };
  writeFile(path.join(lhDir, 'config.json'), JSON.stringify(config, null, 2));

  spinner.succeed(chalk.green('.lighthouse directory created'));
}

/**
 * Display success message and next steps
 */
function showSuccess(selectedIDEs, projectRoot) {
  console.log('\n' + chalk.green.bold('✓ Google Lighthouse skill initialized!\n'));

  console.log(chalk.bold('Selected IDEs:'));
  selectedIDEs.forEach(ide => {
    const config = IDE_TEMPLATES[ide];
    console.log(`  ${chalk.cyan('•')} ${config.name} - ${config.description}`);
  });

  console.log('\n' + chalk.bold('Created files:'));
  console.log(`  ${chalk.dim('.lighthouse/')}`);
  console.log(`  ${chalk.dim('.lighthouse/config.json')}`);
  console.log(`  ${chalk.dim('.lighthouse/reports/')}`);

  selectedIDEs.forEach(ide => {
    const config = IDE_TEMPLATES[ide];
    console.log(`  ${chalk.dim(config.skillPath + '/')}`);
  });

  console.log('\n' + chalk.bold('Next steps:\n'));

  console.log(chalk.cyan('1. Run a Lighthouse audit:'));
  console.log(chalk.dim('   npm run lighthouse:audit'));
  console.log(chalk.dim('   # Or manually:'));
  console.log(chalk.dim('   lighthouse http://localhost:3000 --output json --output-path .lighthouse/reports/latest.json\n'));

  console.log(chalk.cyan('2. Analyze the report:'));
  console.log(chalk.dim('   gl analyze .lighthouse/reports/latest.json\n'));

  console.log(chalk.cyan('3. Generate fix suggestions:'));
  console.log(chalk.dim('   gl fixes .lighthouse/reports/latest.json\n'));

  if (selectedIDEs.includes('claude')) {
    console.log(chalk.cyan('4. For Claude Code:'));
    console.log(chalk.dim('   - The skill is in .claude/skills/lighthouse/'));
    console.log(chalk.dim('   - Use: "Analyze my Lighthouse report and suggest improvements"\n'));
  }

  if (selectedIDEs.includes('antigravity')) {
    console.log(chalk.cyan('4. For Antigravity:'));
    console.log(chalk.dim('   - The skill is in .agent/workflows/google-lighthouse.md'));
    console.log(chalk.dim('   - Just mention "Lighthouse" in your chat\n'));
  }

  console.log(chalk.bold('Learn more:'));
  console.log(chalk.dim('   https://github.com/yourusername/google-lighthouse-skill\n'));
}

/**
 * Main init function
 */
async function init(options) {
  console.log('\n' + chalk.cyan.bold('🔍 Google Lighthouse Skill Initialization\n'));

  const projectRoot = process.cwd();

  // Check if already initialized
  const configPath = path.join(projectRoot, '.lighthouse', 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!options.yes) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Lighthouse skill already initialized. Overwrite?',
          default: false
        }
      ]);
      if (!overwrite) {
        console.log(chalk.yellow('\nInitialization cancelled.\n'));
        return;
      }
    }
  }

  let selectedIDEs = [];

  if (options.ide) {
    if (options.ide === 'all') {
      selectedIDEs = ['claude', 'antigravity'];
    } else {
      selectedIDEs = options.ide.split(',').map(i => i.trim().toLowerCase());
    }
  } else if (!options.yes) {
    // Interactive mode
    const { ide } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'ide',
        message: 'Select your IDE(s):',
        choices: [
          { name: 'Claude Code - Official Claude Code', value: 'claude', checked: true },
          { name: 'Antigravity - AI development environment', value: 'antigravity' }
        ],
        validate: function(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one IDE.';
          }
          return true;
        }
      }
    ]);
    selectedIDEs = ide;
  } else {
    // Default to all in yes mode
    selectedIDEs = ['claude', 'antigravity'];
  }

  // Validate IDE selections
  const validIDEs = Object.keys(IDE_TEMPLATES);
  selectedIDEs = selectedIDEs.filter(ide => validIDEs.includes(ide));

  if (selectedIDEs.length === 0) {
    console.error(chalk.red('\nError: No valid IDEs selected\n'));
    process.exit(1);
  }

  // Create base directory structure
  createLighthouseDir(projectRoot);

  // Copy templates for each selected IDE
  for (const ide of selectedIDEs) {
    const success = copyTemplates(ide, projectRoot);
    if (!success) {
      console.error(chalk.red(`\nFailed to initialize ${ide}\n`));
      process.exit(1);
    }
  }

  // Update config with selected IDEs
  const config = {
    version: '1.0.0',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    ides: selectedIDEs
  };
  writeFile(configPath, JSON.stringify(config, null, 2));

  // Show success message
  showSuccess(selectedIDEs, projectRoot);
}

module.exports = init;
