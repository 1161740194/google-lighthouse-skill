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
        case 'render-blocking-resources':
          this.addRenderBlockingFixes(audit);
          break;
        case 'unminified-css':
          this.addMinifyCssFixes(audit);
          break;
        case 'unminified-javascript':
          this.addMinifyJsFixes(audit);
          break;
        case 'unused-css-rules':
          this.addUnusedCssFixes(audit);
          break;
        case 'unused-javascript':
          this.addUnusedJsFixes(audit);
          break;
        case 'modern-image-formats':
          this.addImageFormatFixes(audit);
          break;
        case 'offscreen-images':
          this.addLazyLoadFixes(audit);
          break;
        case 'uses-optimized-images':
          this.addImageOptimizationFixes(audit);
          break;
        case 'document-title':
          this.addDocumentTitleFixes(audit);
          break;
      }
    }
  }

  analyzeAccessibilityIssues() {
    const a11yAudits = this.lhr.categories.accessibility?.auditRefs || [];

    for (const ref of a11yAudits) {
      const audit = this.lhr.audits[ref.id];
      if (!audit || audit.score >= 0.9) continue;

      switch (audit.id) {
        case 'image-alt':
          this.addImageAltFixes(audit);
          break;
        case 'color-contrast':
          this.addColorContrastFixes(audit);
          break;
        case 'label':
          this.addFormLabelFixes(audit);
          break;
        case 'button-name':
          this.addButtonNameFixes(audit);
          break;
        case 'link-name':
          this.addLinkNameFixes(audit);
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
        case 'structured-data':
          this.addStructuredDataFixes(audit);
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
        case 'viewport':
          this.addViewportFixes(audit);
          break;
        case 'http-status-code':
          this.addHttpStatusCodeFixes(audit);
          break;
        case 'no-vulnerable-libraries':
          this.addVulnerableLibrariesFixes(audit);
          break;
      }
    }
  }

  addFix(fix) {
    this.fixes.push(fix);
  }

  addRenderBlockingFixes(audit) {
    this.addFix({
      title: 'Eliminate Render-Blocking Resources',
      priority: 'high',
      impact: 'First Contentful Paint',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Make CSS non-blocking',
          code: `<!-- Add media attribute or load asynchronously -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>`
        },
        {
          type: 'html',
          title: 'Defer JavaScript',
          code: `<!-- Add defer or async attribute -->
<script src="script.js" defer></script>
<script src="analytics.js" async></script>`
        }
      ]
    });
  }

  addMinifyCssFixes(audit) {
    this.addFix({
      title: 'Minify CSS',
      priority: 'medium',
      impact: 'Page size and parse time',
      description: audit.description,
      fixes: [
        {
          type: 'bash',
          title: 'Using cssnano',
          code: `npm install --save-dev cssnano postcss

# postcss.config.js
module.exports = {
  plugins: [require('cssnano')]
};`
        }
      ]
    });
  }

  addMinifyJsFixes(audit) {
    this.addFix({
      title: 'Minify JavaScript',
      priority: 'medium',
      impact: 'Page size and parse time',
      description: audit.description,
      fixes: [
        {
          type: 'bash',
          title: 'Using Terser',
          code: `npm install --save-dev terser
npx terser input.js -o output.min.js`
        }
      ]
    });
  }

  addUnusedCssFixes(audit) {
    this.addFix({
      title: 'Remove Unused CSS',
      priority: 'medium',
      impact: 'Page size',
      description: audit.description,
      fixes: [
        {
          type: 'bash',
          title: 'Using PurgeCSS',
          code: `npm install --save-dev @fullhuman/postcss-purgecss

# postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html']
    })
  ]
};`
        }
      ]
    });
  }

  addUnusedJsFixes(audit) {
    this.addFix({
      title: 'Remove Unused JavaScript',
      priority: 'medium',
      impact: 'Page size and parse time',
      description: audit.description,
      fixes: [
        {
          type: 'javascript',
          title: 'Use dynamic imports',
          code: `// Dynamic import for code splitting
const button = document.getElementById('showChart');
button.addEventListener('click', async () => {
  const { Chart } = await import('chart.js');
  new Chart(ctx, config);
});`
        }
      ]
    });
  }

  addImageFormatFixes(audit) {
    this.addFix({
      title: 'Serve Images in Modern Formats',
      priority: 'medium',
      impact: 'Page size',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Use picture element with WebP/AVIF',
          code: `<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>`
        }
      ]
    });
  }

  addLazyLoadFixes(audit) {
    this.addFix({
      title: 'Defer Offscreen Images',
      priority: 'low',
      impact: 'Initial page load',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add loading="lazy" attribute',
          code: `<img src="image.jpg" loading="lazy" alt="Description">
<iframe src="video.html" loading="lazy"></iframe>`
        }
      ]
    });
  }

  addImageOptimizationFixes(audit) {
    this.addFix({
      title: 'Optimize Images',
      priority: 'high',
      impact: 'Page size and LCP',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Always specify width and height',
          code: `<img src="image.jpg" width="800" height="600" alt="Description">

<!-- For responsive images -->
<img src="image.jpg"
     srcset="image-320.jpg 320w, image-640.jpg 640w"
     sizes="(max-width: 640px) 100vw"
     width="800" height="600"
     alt="Description">`
        }
      ]
    });
  }

  addDocumentTitleFixes(audit) {
    this.addFix({
      title: 'Add Document Title',
      priority: 'high',
      impact: 'SEO and accessibility',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add descriptive title element',
          code: `<head>
  <title>Page Title - Site Name | Context</title>
</head>`
        }
      ]
    });
  }

  addImageAltFixes(audit) {
    this.addFix({
      title: 'Add Alt Text to Images',
      priority: 'high',
      impact: 'Accessibility',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add descriptive alt text',
          code: `<!-- Informative images -->
<img src="chart.jpg" alt="Sales increased 25% from Q1 to Q4">

<!-- Decorative images -->
<img src="divider.png" alt="" role="presentation">`
        }
      ]
    });
  }

  addColorContrastFixes(audit) {
    this.addFix({
      title: 'Improve Color Contrast',
      priority: 'medium',
      impact: 'Accessibility (WCAG AA)',
      description: audit.description,
      fixes: [
        {
          type: 'css',
          title: 'Increase contrast to at least 4.5:1',
          code: `.text {
  color: #333;  /* Good contrast */
  background: #fff;
}`
        }
      ]
    });
  }

  addFormLabelFixes(audit) {
    this.addFix({
      title: 'Add Labels to Form Inputs',
      priority: 'high',
      impact: 'Accessibility',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Use label elements with for attribute',
          code: `<label for="email">Email address:</label>
<input type="email" id="email" name="email">`
        }
      ]
    });
  }

  addButtonNameFixes(audit) {
    this.addFix({
      title: 'Add Accessible Names to Buttons',
      priority: 'high',
      impact: 'Accessibility',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add text content or aria-label',
          code: `<button aria-label="Close dialog">
  <span aria-hidden="true">&times;</span>
</button>`
        }
      ]
    });
  }

  addLinkNameFixes(audit) {
    this.addFix({
      title: 'Add Descriptive Link Text',
      priority: 'medium',
      impact: 'Accessibility and SEO',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Use descriptive link text',
          code: `<a href="/about">About our company</a>
<a href="https://example.com/article">Read the full article</a>`
        }
      ]
    });
  }

  addMetaDescriptionFixes(audit) {
    this.addFix({
      title: 'Add Meta Description',
      priority: 'high',
      impact: 'SEO',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add meta description in head',
          code: `<head>
  <meta name="description" content="A clear, compelling description between 50-160 characters.">
</head>`
        }
      ]
    });
  }

  addCanonicalFixes(audit) {
    this.addFix({
      title: 'Add Canonical Link',
      priority: 'medium',
      impact: 'SEO (duplicate content)',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add canonical link element',
          code: `<head>
  <link rel="canonical" href="https://example.com/page">
</head>`
        }
      ]
    });
  }

  addStructuredDataFixes(audit) {
    this.addFix({
      title: 'Add Structured Data',
      priority: 'medium',
      impact: 'SEO (rich snippets)',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add JSON-LD structured data',
          code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {"@type": "Person", "name": "Author Name"}
}
</script>`
        }
      ]
    });
  }

  addViewportFixes(audit) {
    this.addFix({
      title: 'Add Viewport Meta Tag',
      priority: 'high',
      impact: 'Mobile rendering',
      description: audit.description,
      fixes: [
        {
          type: 'html',
          title: 'Add viewport meta tag',
          code: `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>`
        }
      ]
    });
  }

  addHttpStatusCodeFixes(audit) {
    this.addFix({
      title: 'Fix HTTP Status Codes',
      priority: 'high',
      impact: 'SEO and user experience',
      description: audit.description,
      fixes: [
        {
          type: 'javascript',
          title: 'Node.js/Express example',
          code: `// Return correct status codes
app.get('/old-page', (req, res) => {
  res.redirect(301, '/new-page');
});`
        }
      ]
    });
  }

  addVulnerableLibrariesFixes(audit) {
    this.addFix({
      title: 'Update Vulnerable Libraries',
      priority: 'high',
      impact: 'Security',
      description: audit.description,
      fixes: [
        {
          type: 'bash',
          title: 'Update dependencies',
          code: `npm audit
npm audit fix`
        }
      ]
    });
  }

  formatOutput() {
    let output = '# Lighthouse Fix Suggestions\n\n';

    if (this.fixes.length === 0) {
      output += 'No issues found that need fixing! Great job!\n';
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
      output += `## ${emoji} ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority\n\n`;

      for (const fix of items) {
        output += `### ${fix.title}\n\n`;
        output += `**Impact**: ${fix.impact}\n\n`;
        output += `${fix.description}\n\n`;

        for (const solution of fix.fixes) {
          output += `#### ${solution.title}\n\n`;
          output += `\`\`\`${solution.type}\n${solution.code}\n\`\`\`\n\n`;
        }

        output += '---\n\n';
      }
    }

    return output;
  }
}

module.exports = FixGenerator;
