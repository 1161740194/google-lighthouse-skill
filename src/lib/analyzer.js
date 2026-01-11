/**
 * Lighthouse Report Analyzer
 *
 * Parses and analyzes Lighthouse JSON reports.
 */

const fs = require('fs');

class LighthouseAnalyzer {
  constructor(reportPath, options = {}) {
    this.reportPath = reportPath;
    this.options = {
      category: options.category || null,
      minScore: options.minScore || 0.5,
      verbose: options.verbose || false
    };

    this.lhr = this.loadReport();
  }

  loadReport() {
    try {
      const content = fs.readFileSync(this.reportPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load report: ${error.message}`);
    }
  }

  getSummary() {
    return {
      url: this.lhr.requestedUrl,
      finalUrl: this.lhr.finalUrl,
      timestamp: this.lhr.fetchTime,
      version: this.lhr.lighthouseVersion,
      scores: this.getCategoryScores()
    };
  }

  getCategoryScores() {
    const scores = {};
    for (const [id, category] of Object.entries(this.lhr.categories)) {
      scores[id] = {
        title: category.title,
        score: category.score !== null ? Math.round(category.score * 100) : null
      };
    }
    return scores;
  }

  getFailedAudits(categoryId = null) {
    let auditRefs = [];

    if (categoryId) {
      const category = this.lhr.categories[categoryId];
      if (category) {
        auditRefs = category.auditRefs;
      }
    } else {
      for (const category of Object.values(this.lhr.categories)) {
        auditRefs.push(...category.auditRefs);
      }
    }

    // Deduplicate
    const seenIds = new Set();
    auditRefs = auditRefs.filter(ref => {
      if (seenIds.has(ref.id)) return false;
      seenIds.add(ref.id);
      return true;
    });

    return auditRefs
      .map(ref => this.lhr.audits[ref.id])
      .filter(audit =>
        audit.score !== null &&
        audit.score < this.options.minScore &&
        audit.scoreDisplayMode !== 'manual' &&
        audit.scoreDisplayMode !== 'notApplicable'
      );
  }

  getOpportunities() {
    const opportunities = [];

    for (const audit of Object.values(this.lhr.audits)) {
      if (audit.details && audit.details.type === 'opportunity' && audit.score < 1) {
        const wastedMs = audit.details.overallSavingsMs || 0;
        opportunities.push({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          wastedMs: wastedMs,
          wastedBytes: audit.details.overallSavingsBytes || 0,
          items: (audit.details.items || []).length
        });
      }
    }

    return opportunities.sort((a, b) => b.wastedMs - a.wastedMs);
  }

  getDiagnostics() {
    const diagnostics = [];

    const diagnosticIds = [
      'bootup-time',
      'mainthread-work-breakdown',
      'long-tasks',
      'dom-size',
      'network-requests',
      'total-byte-weight'
    ];

    for (const id of diagnosticIds) {
      const audit = this.lhr.audits[id];
      if (audit && audit.score < 1) {
        diagnostics.push({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue
        });
      }
    }

    return diagnostics;
  }

  getCoreWebVitals() {
    const vitals = {
      lcp: this.lhr.audits['largest-contentful-paint'],
      fid: this.lhr.audits['max-potential-fid'],
      cls: this.lhr.audits['cumulative-layout-shift'],
      fcp: this.lhr.audits['first-contentful-paint'],
      tbt: this.lhr.audits['total-blocking-time'],
      si: this.lhr.audits['speed-index']
    };

    const results = {};
    for (const [key, audit] of Object.entries(vitals)) {
      if (audit) {
        const value = audit.numericValue;
        const rating = audit.rating;

        results[key] = {
          name: audit.title,
          value: value,
          unit: audit.numericUnit,
          displayValue: audit.displayValue,
          rating: rating,
          passed: rating === 'pass'
        };
      }
    }

    return results;
  }

  formatMarkdown() {
    const summary = this.getSummary();
    const vitals = this.getCoreWebVitals();
    const opportunities = this.getOpportunities();

    let output = '# Lighthouse Report Analysis\n\n';

    output += '## Summary\n\n';
    output += `- **URL**: ${summary.url}\n`;
    output += `- **Timestamp**: ${new Date(summary.timestamp).toISOString()}\n`;
    output += `- **Lighthouse Version**: ${summary.version}\n\n`;

    output += '## Category Scores\n\n';
    for (const [id, score] of Object.entries(summary.scores)) {
      const displayScore = score.score !== null ? score.score : 'N/A';
      const emoji = this.getScoreEmoji(score.score);
      output += `- **${score.title}**: ${emoji} ${displayScore}/100\n`;
    }
    output += '\n';

    output += '## Core Web Vitals\n\n';
    output += '| Metric | Value | Rating |\n';
    output += '|--------|-------|--------|\n';
    for (const [key, vital] of Object.entries(vitals)) {
      const status = vital.passed ? '✅ Pass' : '❌ Fail';
      output += `| ${vital.name} | ${vital.displayValue} | ${status} |\n`;
    }
    output += '\n';

    if (opportunities.length > 0) {
      output += '## Opportunities (Sorted by Impact)\n\n';
      for (const opp of opportunities) {
        const timeStr = opp.wastedMs > 0 ? ` - **${Math.round(opp.wastedMs / 1000)}s saved**` : '';
        output += `### ${opp.title}${timeStr}\n`;
        output += `${opp.description}\n\n`;
      }
    }

    const failedAudits = this.getFailedAudits(this.options.category);
    if (failedAudits.length > 0) {
      output += '## Failed Audits\n\n';
      for (const audit of failedAudits) {
        output += `### ${audit.title}\n`;
        output += `- **Score**: ${Math.round(audit.score * 100)}\n`;
        output += `- ${audit.description}\n\n`;
      }
    }

    return output;
  }

  getScoreEmoji(score) {
    if (score === null) return '⚪';
    if (score >= 0.9) return '🟢';
    if (score >= 0.5) return '🟡';
    return '🔴';
  }
}

module.exports = LighthouseAnalyzer;
