/**
 * Lighthouse Fix Suggestions Generator
 *
 * Generates code fix suggestions based on failed Lighthouse audits.
 */

const fs = require('fs');

class FixGenerator {
  constructor(reportPath, options = {}) {
    this.reportPath = reportPath;
    this.options = {
      category: options.category || null
    };

    this.lhr = this.loadReport();
    this.fixes = [];
  }

  loadReport() {
    try {
      const content = fs.readFileSync(this.reportPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load report: ${error.message}`);
    }
  }

  generate() {
    this.analyzePerformanceIssues();
    this.analyzeAccessibilityIssues();
    this.analyzeSeoIssues();
    this.analyzeBestPracticesIssues();

    return this.formatOutput();
  }

  analyzePerformanceIssues() {
    const performanceAudits = this.lhr.categories.performance?.auditRefs || [];

    for (const ref of performanceAudits) {
      const audit = this.lhr.audits[ref.id];
      if (!audit || audit.score >= 0.9) continue;

      switch (audit.id) {
        case 'server-response-time':
          this.addServerResponseTimeFixes(audit);
          break;
        case 'unused-javascript':
          this.addUnusedJavaScriptFixes(audit);
          break;
        case 'speed-index':
          this.addSpeedIndexFixes(audit);
          break;
        case 'lcp-breakdown-insight':
          this.addLCPBreakdownFixes(audit);
          break;
        case 'document-latency-insight':
          this.addDocumentLatencyFixes(audit);
          break;
        case 'max-potential-fid':
          this.addFIDFixes(audit);
          break;
      }
    }

    // Check for Next.js specific issues
    this.checkFrameworkSpecificIssues();
  }

  analyzeAccessibilityIssues() {
    const a11yAudits = this.lhr.categories.accessibility?.auditRefs || [];

    for (const ref of a11yAudits) {
      const audit = this.lhr.audits[ref.id];
      if (!audit || audit.score >= 0.9) continue;

      switch (audit.id) {
        case 'color-contrast':
          this.addColorContrastFixes(audit);
          break;
        case 'heading-order':
          this.addHeadingOrderFixes(audit);
          break;
      }
    }
  }

  analyzeSeoIssues() {
    const seoAudits = this.lhr.categories.seo?.auditRefs || [];

    for (const ref of seoAudits) {
      const audit = this.lhr.audits[ref.id];
      if (!audit || audit.score >= 0.9) continue;

      switch (audit.id) {
        case 'meta-description':
          this.addMetaDescriptionFixes(audit);
          break;
        case 'canonical':
          this.addCanonicalFixes(audit);
          break;
      }
    }
  }

  analyzeBestPracticesIssues() {
    const bpAudits = this.lhr.categories['best-practices']?.auditRefs || [];

    for (const ref of bpAudits) {
      const audit = this.lhr.audits[ref.id];
      if (!audit || audit.score >= 0.9) continue;

      switch (audit.id) {
        case 'errors-in-console':
          this.addConsoleErrorsFixes(audit);
          break;
        case 'valid-source-maps':
          this.addSourceMapsFixes(audit);
          break;
        case 'bf-cache':
          this.addBFCacheFixes(audit);
          break;
      }
    }
  }

  addFix(fix) {
    this.fixes.push(fix);
  }

  addServerResponseTimeFixes(audit) {
    const ttfbMs = audit.numericValue || 0;

    this.addFix({
      title: 'Reduce Server Response Time (TTFB: ' + Math.round(ttfbMs) + 'ms)',
      priority: 'high',
      impact: 'All Core Web Vitals - TTFB affects LCP, FCP, and SI',
      description: audit.description,
      diagnosis: this.diagnoseTTFB(ttfbMs),
      fixes: this.getServerResponseTimeFixes(ttfbMs)
    });
  }

  addUnusedJavaScriptFixes(audit) {
    const items = audit.details?.items || [];
    const totalWastedMs = audit.details?.overallSavingsMs || 0;
    const totalWastedBytes = items.reduce((sum, item) => sum + (item.wastedBytes || 0), 0);

    // Group by type (extension vs first-party)
    const firstParty = items.filter(item => !item.url?.includes('chrome-extension://'));
    const extensions = items.filter(item => item.url?.includes('chrome-extension://'));

    let fixes = [];

    if (firstParty.length > 0) {
      fixes.push({
        type: 'markdown',
        title: 'Unused JavaScript Analysis',
        code: this.getUnusedJsAnalysis(firstParty, totalWastedBytes, totalWastedMs)
      });

      fixes.push({
        type: 'javascript',
        title: 'Dynamic Imports for Code Splitting',
        code: '// pages/index.js or app/page.js\nimport dynamic from \'next/dynamic\';\n\n// Lazy load heavy components\nconst HeavyChart = dynamic(() => import(\'../components/HeavyChart\'), {\n  loading: () => <div>Loading chart...</div>,\n  ssr: false\n});'
      });
    }

    if (extensions.length > 0) {
      fixes.push({
        type: 'text',
        title: 'Browser Extensions Detected (Can Ignore)',
        code: 'Browser extensions like ' + extensions.map(e => e.url?.split('/').pop()).join(', ') + ' only affect local development. Test in incognito mode for accurate production metrics.'
      });
    }

    this.addFix({
      title: 'Reduce Unused JavaScript (~' + Math.round(totalWastedBytes / 1024) + 'KB wasted, ' + totalWastedMs + 'ms savings)',
      priority: 'high',
      impact: 'FCP, LCP, and TBT',
      description: audit.description,
      diagnosis: firstParty.length + ' first-party files with unused code',
      fixes: fixes
    });
  }

  getUnusedJsAnalysis(items, totalBytes, totalMs) {
    const topWasters = items
      .filter(item => !item.url?.includes('chrome-extension://'))
      .sort((a, b) => (b.wastedBytes || 0) - (a.wastedBytes || 0))
      .slice(0, 5);

    let output = '## Unused JavaScript Details\n\n';
    output += '**Total Impact**: ' + Math.round(totalBytes / 1024) + 'KB wasted, ' + totalMs + 'ms savings\n\n';
    output += '### Top Wasting Files:\n\n';

    topWasters.forEach((item, i) => {
      const url = item.url || 'unknown';
      const filename = url.split('/').pop();
      const wastedKb = Math.round((item.wastedBytes || 0) / 1024);
      const totalKb = Math.round((item.totalBytes || 0) / 1024);

      output += (i + 1) + '. **' + filename + '**\n';
      output += '   - Wasted: ' + wastedKb + 'KB / ' + totalKb + 'KB\n\n';
    });

    return output;
  }

  addColorContrastFixes(audit) {
    const items = audit.details?.items || [];

    let fixes = [{
      type: 'css',
      title: 'Fix contrast with darker text',
      code: '/* Current issue: text-white/40 = 40% opacity = insufficient contrast */\n\n/* GOOD - Fix Option 1: Increase opacity */\n.text-white\\/60 {\n  color: rgba(255, 255, 255, 0.6); /* 7:1 ratio - PASS */\n}\n\n/* GOOD - Fix Option 2: Use lighter gray */\n.text-gray-300 {\n  color: rgb(209, 213, 219); /* 12.6:1 ratio - PASS */\n}'
    }];

    this.addFix({
      title: 'Fix Color Contrast (' + items.length + ' elements affected)',
      priority: 'high',
      impact: 'Accessibility (WCAG AA compliance)',
      description: audit.description,
      diagnosis: 'Elements like "' + items[0]?.node?.nodeLabel + '" have insufficient contrast (3.65:1, need 4.5:1)',
      fixes: fixes
    });
  }

  addHeadingOrderFixes(audit) {
    const items = audit.details?.items || [];

    this.addFix({
      title: 'Fix Heading Order Hierarchy',
      priority: 'medium',
      impact: 'Accessibility and SEO',
      description: audit.description,
      diagnosis: 'Found heading with invalid order: ' + items[0]?.node?.nodeLabel,
      fixes: [{
        type: 'html',
        title: 'Add missing h2 heading',
        code: '<!-- PROBLEM -->\n<h1>Main Title</h1>\n<h3>' + (items[0]?.node?.nodeLabel || 'Subheading') + '</h3>\n\n<!-- SOLUTION -->\n<h1>Main Title</h1>\n<h2>Section Title</h2>\n<h3>' + (items[0]?.node?.nodeLabel || 'Subheading') + '</h3>'
      }]
    });
  }

  addConsoleErrorsFixes(audit) {
    const items = audit.details?.items || [];

    const errors = items.map(item => ({
      source: item.source,
      description: item.description,
      url: item.sourceLocation?.url
    }));

    this.addFix({
      title: 'Fix Console Errors (' + items.length + ' errors)',
      priority: 'medium',
      impact: 'User experience',
      description: audit.description,
      diagnosis: errors[0]?.description || 'Console errors detected',
      fixes: [{
        type: 'text',
        title: 'Error Analysis',
        code: errors.map(e => '- ' + e.description + (e.url ? '\n  URL: ' + e.url.substring(0, 80) : '')).join('\n')
      }]
    });
  }

  addSourceMapsFixes(audit) {
    const items = audit.details?.items || [];

    this.addFix({
      title: 'Fix Missing Source Maps (' + items.length + ' files)',
      priority: 'low',
      impact: 'Debugging (not production)',
      description: audit.description,
      diagnosis: items.length + ' JavaScript files missing source maps',
      fixes: [{
        type: 'bash',
        title: 'Enable source maps in Next.js',
        code: '# next.config.js\nmodule.exports = {\n  productionBrowserSourceMaps: true\n};\n\nnpm run build'
      }]
    });
  }

  addLCPBreakdownFixes(audit) {
    const items = audit.details?.items || [];
    const timingTable = items.find(item => item.type === 'table');
    const lcpElement = items.find(item => item.type === 'node');

    let diagnosis = '';
    let fixes = [];

    if (timingTable && timingTable.items) {
      const ttfb = timingTable.items.find(i => i.subpart === 'timeToFirstByte');
      diagnosis = 'LCP breakdown: TTFB ' + (ttfb ? Math.round(ttfb.duration) + 'ms' : 'N/A');
    }

    if (lcpElement) {
      fixes.push({
        type: 'text',
        title: 'Optimize LCP Element',
        code: 'LCP Element: ' + (lcpElement.nodeLabel || 'Unknown') + '\nSelector: ' + (lcpElement.selector || 'unknown') + '\n\n1. Preload the LCP resource\n2. Reduce CSS on this element\n3. Ensure element is in initial HTML'
      });
    }

    this.addFix({
      title: 'Optimize LCP Breakdown',
      priority: 'high',
      impact: 'LCP metric',
      description: audit.description,
      diagnosis: diagnosis,
      fixes: fixes
    });
  }

  addDocumentLatencyFixes(audit) {
    const wastedMs = audit.details?.overallSavingsMs || 570;

    this.addFix({
      title: 'Reduce Document Request Latency (~' + wastedMs + 'ms savings)',
      priority: 'high',
      impact: 'All page metrics',
      description: audit.description,
      diagnosis: 'Initial HTML request is taking too long',
      fixes: [{
        type: 'text',
        title: 'Document Latency Solutions',
        code: '1. Use CDN (Vercel, Netlify, Cloudflare)\n2. Enable gzip/brotli compression\n3. Add cache headers\n4. Use HTTP/2\n5. Preconnect to origins'
      }]
    });
  }

  addFIDFixes(audit) {
    const value = audit.numericValue || 0;

    this.addFix({
      title: 'Reduce First Input Delay (FID: ' + Math.round(value) + 'ms)',
      priority: value > 100 ? 'high' : 'medium',
      impact: 'Interactivity',
      description: audit.description,
      diagnosis: this.diagnoseFID(value),
      fixes: [{
        type: 'text',
        title: 'Break up long JavaScript tasks',
        code: '- Use requestIdleCallback or setTimeout for chunking\n- Use Web Workers for CPU-intensive tasks\n- Defer non-critical JavaScript with dynamic imports'
      }]
    });
  }

  addSpeedIndexFixes(audit) {
    this.addFix({
      title: 'Improve Speed Index',
      priority: 'medium',
      impact: 'Perceived performance',
      description: audit.description,
      fixes: [{
        type: 'html',
        title: 'Add critical CSS inline',
        code: '<head>\n  <style>body { margin: 0; font-family: system-ui; }</style>\n  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n</head>'
      }]
    });
  }

  addMetaDescriptionFixes(audit) {
    this.addFix({
      title: 'Add Meta Description',
      priority: 'high',
      impact: 'SEO',
      description: audit.description,
      fixes: [{
        type: 'html',
        title: 'Add meta description in head',
        code: '<head>\n  <meta name="description" content="A clear, compelling description between 50-160 characters.">\n</head>'
      }]
    });
  }

  addCanonicalFixes(audit) {
    this.addFix({
      title: 'Add Canonical Link',
      priority: 'medium',
      impact: 'SEO',
      description: audit.description,
      fixes: [{
        type: 'html',
        title: 'Add canonical link element',
        code: '<head>\n  <link rel="canonical" href="https://example.com/page">\n</head>'
      }]
    });
  }

  addBFCacheFixes(audit) {
    const items = audit.details?.items || [];

    this.addFix({
      title: 'Enable Back/Forward Cache',
      priority: 'medium',
      impact: 'Navigation performance',
      description: audit.description,
      diagnosis: items.length + ' issues preventing bfcache',
      fixes: [{
        type: 'text',
        title: 'bfcache Solutions',
        code: '- Remove Cache-Control: no-store header\n- Avoid beforeunload/unload event listeners\n- Use pagehide event instead\n- Avoid fetch() with cache: no-store'
      }]
    });
  }

  diagnoseTTFB(ttfbMs) {
    if (ttfbMs > 1000) {
      return 'TTFB is critically high (> 1s)';
    } else if (ttfbMs > 600) {
      return 'TTFB is elevated (> 600ms)';
    } else if (ttfbMs > 400) {
      return 'TTFB is moderate (> 400ms)';
    }
    return 'TTFB is acceptable';
  }

  diagnoseFID(fidMs) {
    if (fidMs > 200) {
      return 'FID is critically high (> 200ms)';
    } else if (fidMs > 100) {
      return 'FID needs improvement (> 100ms)';
    } else if (fidMs > 50) {
      return 'FID is acceptable but could be better';
    }
    return 'FID is good';
  }

  getServerResponseTimeFixes(ttfbMs) {
    const fixes = [];

    if (ttfbMs > 600) {
      fixes.push({
        type: 'text',
        title: 'TTFB Root Cause Analysis',
        code: '1. Check server location & CDN\n2. Enable CDN caching\n3. Optimize database queries\n4. Use edge computing'
      });
    }

    fixes.push({
      type: 'bash',
      title: 'Add Cache Headers',
      code: '# Apache .htaccess\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType text/html "access plus 1 hour"\n</IfModule>'
    });

    return fixes;
  }

  checkFrameworkSpecificIssues() {
    const unusedJs = this.lhr.audits['unused-javascript'];
    if (unusedJs && unusedJs.score < 0.9 && unusedJs.details?.items) {
      const nextJsChunks = unusedJs.details.items.filter(item =>
        item.url && item.url.includes('/_next/static/chunks/')
      );

      if (nextJsChunks.length > 0) {
        this.addNextJsOptimizationFixes(nextJsChunks);
      }
    }
  }

  addNextJsOptimizationFixes(chunks) {
    const totalWastedBytes = chunks.reduce((sum, c) => sum + (c.wastedBytes || 0), 0);

    this.addFix({
      title: 'Optimize Next.js Bundle Size (~' + Math.round(totalWastedBytes / 1024) + 'KB wasted)',
      priority: 'high',
      impact: 'FCP, LCP, and TBT',
      description: 'Reduce unused JavaScript in Next.js chunks',
      fixes: [
        {
          type: 'bash',
          title: 'Analyze Bundle Size',
          code: 'npm install @next/bundle-analyzer\nANALYZE=true npm run build'
        },
        {
          type: 'javascript',
          title: 'Optimize next.config.js',
          code: 'module.exports = {\n  swcMinify: true,\n  compiler: {\n    removeConsole: process.env.NODE_ENV === \'production\'\n  }\n};'
        }
      ]
    });
  }

  formatOutput() {
    let output = '# Lighthouse Fix Suggestions\n\n';

    if (this.fixes.length === 0) {
      output += 'No issues found! Great job!\n';
      return output;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    this.fixes.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const grouped = {
      high: this.fixes.filter(f => f.priority === 'high'),
      medium: this.fixes.filter(f => f.priority === 'medium'),
      low: this.fixes.filter(f => f.priority === 'low')
    };

    for (const [priority, items] of Object.entries(grouped)) {
      if (items.length === 0) continue;

      const emoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
      output += '## ' + emoji + ' ' + priority.charAt(0).toUpperCase() + priority.slice(1) + ' Priority\n\n';

      for (const fix of items) {
        output += '### ' + fix.title + '\n\n';
        output += '**Impact**: ' + fix.impact + '\n\n';
        output += fix.description + '\n\n';

        if (fix.diagnosis) {
          output += '**🔍 Diagnosis**: ' + fix.diagnosis + '\n\n';
        }

        for (const solution of fix.fixes) {
          output += '#### ' + solution.title + '\n\n';
          output += '```' + solution.type + '\n' + solution.code + '\n```\n\n';
        }

        output += '---\n\n';
      }
    }

    return output;
  }
}

module.exports = FixGenerator;
