/**
 * gl analyze command
 *
 * Analyzes a Lighthouse JSON report and displays insights.
 */

const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');

const LighthouseAnalyzer = require('../lib/analyzer');

/**
 * Main analyze function
 */
async function analyze(report, options) {
  // Determine report path
  let reportPath;

  if (!report) {
    // Try to find latest report in .lighthouse/reports
    const defaultPath = path.join(process.cwd(), '.lighthouse', 'reports', 'latest.json');
    if (fs.existsSync(defaultPath)) {
      reportPath = defaultPath;
    } else {
      // Find most recent JSON file
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
          console.log(chalk.yellow(`Using latest report: ${files[0].name}\n`));
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

  const spinner = ora('Analyzing Lighthouse report...').start();

  try {
    const analyzer = new LighthouseAnalyzer(reportPath, {
      category: options.category,
      minScore: parseFloat(options.minScore),
      verbose: options.verbose
    });

    const summary = analyzer.getSummary();
    const vitals = analyzer.getCoreWebVitals();
    const opportunities = analyzer.getOpportunities();
    const failedAudits = analyzer.getFailedAudits(options.category);

    spinner.stop();

    // Display results
    console.log('\n' + chalk.cyan.bold('📊 Lighthouse Analysis\n'));

    // Summary
    console.log(chalk.bold('Summary'));
    console.log(chalk.dim('─'.repeat(40)));
    console.log(`  URL:         ${chalk.dim(summary.url)}`);
    console.log(`  Version:     ${chalk.dim(summary.version)}`);
    console.log(`  Timestamp:   ${chalk.dim(new Date(summary.timestamp).toLocaleString())}`);

    // Category scores
    console.log('\n' + chalk.bold('Category Scores'));
    console.log(chalk.dim('─'.repeat(40)));

    for (const [id, score] of Object.entries(summary.scores)) {
      const displayScore = score.score !== null ? score.score : 'N/A';
      let emoji, color;

      if (score.score === null) {
        emoji = '⚪';
        color = 'gray';
      } else if (score.score >= 90) {
        emoji = '🟢';
        color = 'green';
      } else if (score.score >= 50) {
        emoji = '🟡';
        color = 'yellow';
      } else {
        emoji = '🔴';
        color = 'red';
      }

      const paddedId = id.padEnd(15);
      const paddedScore = String(displayScore).padStart(3);
      console.log(`  ${emoji} ${chalk.bold(paddedId)}: ${chalk[color](paddedScore)}/100`);
    }

    // Core Web Vitals
    console.log('\n' + chalk.bold('Core Web Vitals'));
    console.log(chalk.dim('─'.repeat(40)));
    console.log(chalk.dim('  Metric              Value        Rating'));
    console.log(chalk.dim('  ' + '─'.repeat(42)));

    for (const [key, vital] of Object.entries(vitals)) {
      const name = vital.name.replace(/(\w+ \w+).*/, '$1').padEnd(20);
      const value = (vital.displayValue || `${Math.round(vital.value)}${vital.unit}`).padStart(12);
      const status = vital.passed ? chalk.green('✅ Pass') : chalk.red('❌ Fail');
      console.log(`  ${name}${value}  ${status}`);
    }

    // Opportunities
    if (opportunities.length > 0) {
      console.log('\n' + chalk.bold('Opportunities (Sorted by Impact)'));
      console.log(chalk.dim('─'.repeat(40)));

      opportunities.slice(0, 5).forEach((opp, i) => {
        const timeStr = opp.wastedMs > 0
          ? chalk.yellow(`~${Math.round(opp.wastedMs / 1000)}s saved`)
          : '';
        console.log(`  ${chalk.cyan((i + 1) + '.')}${chalk.bold(opp.title)} ${timeStr}`);
        if (options.verbose) {
          console.log(chalk.dim(`      ${opp.description.substring(0, 100)}...`));
        }
      });

      if (opportunities.length > 5) {
        console.log(chalk.dim(`  ... and ${opportunities.length - 5} more opportunities`));
      }
    }

    // Failed audits
    if (failedAudits.length > 0) {
      console.log('\n' + chalk.bold('Failed Audits'));
      console.log(chalk.dim('─'.repeat(40)));

      failedAudits.slice(0, 5).forEach((audit, i) => {
        const score = chalk.red(`Score: ${Math.round(audit.score * 100)}`);
        console.log(`  ${chalk.cyan((i + 1) + '.')}${chalk.bold(audit.title)} ${score}`);
        if (options.verbose) {
          console.log(chalk.dim(`      ${audit.description.substring(0, 100)}...`));
        }
      });

      if (failedAudits.length > 5) {
        console.log(chalk.dim(`  ... and ${failedAudits.length - 5} more failed audits`));
      }
    }

    // Recommendations
    console.log('\n' + chalk.bold('Quick Actions'));
    console.log(chalk.dim('─'.repeat(40)));

    if (opportunities.length > 0) {
      console.log(chalk.cyan('  • Run: ') + 'gl fixes .lighthouse/reports/latest.json');
      console.log(chalk.dim('      to generate code fix suggestions'));
    }

    if (summary.scores.performance?.score < 90) {
      console.log(chalk.cyan('  • Focus on: ') + 'Core Web Vitals (LCP, FID, CLS)');
    }

    if (summary.scores.accessibility?.score < 90) {
      console.log(chalk.cyan('  • Fix: ') + 'Alt text, color contrast, form labels');
    }

    if (summary.scores.seo?.score < 90) {
      console.log(chalk.cyan('  • Add: ') + 'Meta descriptions, structured data, canonical URLs');
    }

    console.log();

    // Output to file if requested
    if (options.format === 'json' || options.format === 'markdown') {
      const outputDir = path.join(process.cwd(), '.lighthouse', 'analysis');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const ext = options.format === 'json' ? 'json' : 'md';
      const outputPath = path.join(outputDir, `analysis-${timestamp}.${ext}`);

      let content;
      if (options.format === 'json') {
        content = JSON.stringify({
          summary,
          coreWebVitals: vitals,
          opportunities,
          failedAudits
        }, null, 2);
      } else {
        content = analyzer.formatMarkdown();
      }

      fs.writeFileSync(outputPath, content);
      console.log(chalk.dim(`\nAnalysis saved to: ${outputPath}\n`));
    }

  } catch (error) {
    spinner.fail(chalk.red('Failed to analyze report'));
    console.error(chalk.red(error.message));
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

module.exports = analyze;
