/**
 * gl fixes command
 *
 * Generates fix suggestions from a Lighthouse report.
 */

const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');

const FixGenerator = require('../lib/fix-generator');

/**
 * Main fixes function
 */
async function fixes(report, options) {
  let reportPath;

  if (!report) {
    const defaultPath = path.join(process.cwd(), '.lighthouse', 'reports', 'latest.json');
    if (fs.existsSync(defaultPath)) {
      reportPath = defaultPath;
    } else {
      const reportsDir = path.join(process.cwd(), '.lighthouse', 'reports');
      if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir)
          .filter(f => f.endsWith('.json'))
          .map(f => ({
            name: f,
            path: path.join(reportsDir, f),
            time: fs.statSync(path.join(reportsDir, f)).mtime.getTime()
          }))
          .sort((a, b) => b.time - a.time);

        if (files.length > 0) {
          reportPath = files[0].path;
        }
      }
    }
  } else {
    reportPath = report;
  }

  if (!reportPath || !fs.existsSync(reportPath)) {
    console.error(chalk.red('Error: Lighthouse report not found'));
    console.error(chalk.dim('\nRun: lighthouse <url> --output json --output-path .lighthouse/reports/latest.json'));
    process.exit(1);
  }

  const spinner = ora('Generating fix suggestions...').start();

  try {
    const generator = new FixGenerator(reportPath, {
      category: options.category
    });

    const content = generator.generate();

    spinner.stop();

    console.log('\n' + chalk.cyan.bold('🔧 Fix Suggestions\n'));
    console.log(content);

    // Save to file if output specified or default
    const outputPath = options.output || path.join(
      process.cwd(),
      '.lighthouse',
      'fixes',
      `fixes-${new Date().toISOString().split('T')[0]}.md`
    );

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, content);
    console.log(chalk.dim(`\nFixes saved to: ${outputPath}\n`));

  } catch (error) {
    spinner.fail(chalk.red('Failed to generate fixes'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

module.exports = fixes;
