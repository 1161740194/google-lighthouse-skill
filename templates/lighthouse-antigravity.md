---
description: Google Lighthouse performance, accessibility, SEO, and best practices audits for web optimization. Analyze Lighthouse reports, understand performance metrics, Core Web Vitals, and implement optimization recommendations.
---

# Lighthouse Skill for Antigravity

Analyze Lighthouse reports and generate code optimizations directly in Antigravity IDE.

## When to Use

Use this skill when:
- Working with Lighthouse audit reports (JSON or HTML format)
- Analyzing performance, accessibility, SEO, or best practices issues
- Implementing Core Web Vitals optimizations
- Running Lighthouse from CLI
- Integrating Lighthouse into CI/CD pipelines

## How to Use

### Natural Language Commands

Just mention Lighthouse in your chat:
- "Analyze my Lighthouse report"
- "Check performance score"
- "Generate fix suggestions"
- "What are my Core Web Vitals?"
- "Fix accessibility issues"

### Report Location

Reports are stored in: `.lighthouse/reports/latest.json`

## Lighthouse CLI Commands

```bash
# Initialize skill in current project
gl init

# Analyze report
gl analyze

# Generate fix suggestions
gl fixes

# Run audit manually
lighthouse http://localhost:3000 --output json --output-path .lighthouse/reports/latest.json
```

## Core Web Vitals Targets

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| LCP (Largest Contentful Paint) | < 2.5s | 🟢 | 🟡 |
| FID (First Input Delay) | < 100ms | 🟢 | 🟡 |
| CLS (Cumulative Layout Shift) | < 0.1 | 🟢 | 🟡 |
| FCP (First Contentful Paint) | < 1.8s | 🟢 | 🟡 |
| TBT (Total Blocking Time) | < 200ms | 🟢 | 🟡 |

## Lighthouse Report Format (JSON Structure)

The Lighthouse Result (LHR) object contains:

```typescript
{
  requestedUrl: string;
  finalUrl: string;
  lighthouseVersion: string;
  fetchTime: string;
  categories: { [id: string]: Category };
  audits: { [id: string]: AuditResult };
  configSettings: ConfigSettings;
  timing: TimingInfo;
}
```

### Extract Category Scores

```javascript
// Get performance score (0-1)
const score = lhr.categories.performance.score;

// Convert to percentage
const percentage = Math.round(score * 100); // 0-100
```

### Core Web Vitals Audits

- `largest-contentful-paint` - LCP in ms
- `max-potential-fid` - FID in ms
- `cumulative-layout-shift` - CLS score
- `first-contentful-paint` - FCP in ms
- `total-blocking-time` - TBT in ms
- `speed-index` - SI in ms

### Extract Metrics

```javascript
function getMetrics(lhr) {
  return {
    lcp: lhr.audits['largest-contentful-paint'].numericValue,
    fid: lhr.audits['max-potential-fid'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue
  };
}
```

### Get Failed Audits

```javascript
function getFailedAudits(lhr, categoryId) {
  const category = lhr.categories[categoryId];
  return category.auditRefs
    .map(ref => lhr.audits[ref.id])
    .filter(audit => audit.score < 0.5);
}
```

### Get Opportunities

```javascript
function getOpportunities(lhr) {
  return Object.values(lhr.audits)
    .filter(audit =>
      audit.details?.type === 'opportunity' &&
      audit.score < 1
    )
    .map(audit => ({
      title: audit.title,
      wastedMs: audit.details.overallSavingsMs,
      description: audit.description
    }))
    .sort((a, b) => b.wastedMs - a.wastedMs);
}
```

## Performance Audits

### Scoring

Performance score (0-100) is weighted:

| Metric | Weight |
|--------|--------|
| FCP | 10% |
| Speed Index | 10% |
| LCP | 25% |
| TTI | 10% |
| TBT | 30% |
| CLS | 15% |

### Core Web Vitals Optimization

**LCP (Largest Contentful Paint)** - Target: < 2.5s
- Preload critical images
- Remove render-blocking resources
- Improve server response time
- Use CDN

**FID (First Input Delay)** - Target: < 100ms
- Break up long JavaScript tasks
- Reduce JavaScript execution time
- Use web workers

**CLS (Cumulative Layout Shift)** - Target: < 0.1
- Reserve space for images and ads
- Avoid inserting content above existing content
- Use transform animations

### Common Performance Fixes

#### Render-Blocking Resources

```html
<!-- Non-blocking CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- Deferred JS -->
<script src="script.js" defer></script>
```

#### Image Optimization

```html
<!-- Specify dimensions -->
<img src="image.jpg" width="800" height="600" alt="Description">

<!-- Lazy loading -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Modern formats -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

#### Unused CSS/JS

```javascript
// Dynamic imports
const module = await import('./module.js');

// Code splitting
import(/* webpackChunkName: "lodash" */ 'lodash').then(_ => {
  // Use lodash
});
```

## SEO Audits

### Document Title

```html
<title>Page Title - Site Name | Context</title>
```
- Keep under 60 characters
- Unique per page
- Include primary keyword

### Meta Description

```html
<meta name="description" content="Compelling description between 50-160 characters.">
```
- Between 50-160 characters
- Unique per page
- Accurately describes content

### Canonical Link

```html
<link rel="canonical" href="https://example.com/page">
```
- Prevents duplicate content
- Specifies preferred URL

### Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Title",
  "author": {"@type": "Person", "name": "Author"}
}
</script>
```
- Enables rich snippets
- Use appropriate schema.org type

### Link Text

```html
<!-- Good -->
<a href="/about">About our company</a>

<!-- Bad -->
<a href="/about">Click here</a>
```

### Image Alt Text

```html
<!-- Informative -->
<img src="chart.jpg" alt="Sales increased 25%">

<!-- Decorative -->
<img src="divider.png" alt="">
```

### Mobile-Friendly

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Accessibility Audits (WCAG)

### Image Alt Text

```html
<!-- Good: Descriptive -->
<img src="chart.jpg" alt="Sales increased 25% from Q1 to Q4">

<!-- Good: Decorative -->
<img src="divider.png" alt="" role="presentation">

<!-- Bad: Missing alt -->
<img src="chart.jpg">
```

### Color Contrast

```css
/* Good: 4.5:1 or higher */
.text {
  color: #333;  /* contrast ratio 12.6:1 on white */
  background: #fff;
}
```

### Form Labels

```html
<!-- Explicit label -->
<label for="email">Email:</label>
<input type="email" id="email" name="email">

<!-- Aria label -->
<input type="search" aria-label="Search">
```

### Button Names

```html
<!-- Good: aria-label -->
<button aria-label="Close dialog">
  <span aria-hidden="true">&times;</span>
</button>
```

### Link Text

```html
<!-- Good: Descriptive -->
<a href="/about">About our company</a>

<!-- Bad: Generic -->
<a href="/about">Click here</a>
```

### Tap Targets

```css
/* Minimum 48x48px for touch */
.button {
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
}
```

## Lighthouse CLI Reference

### Installation

```bash
npm install -g lighthouse
```

### Basic Usage

```bash
# Run audit
lighthouse https://example.com

# Output JSON
lighthouse https://example.com --output json --output-path report.json

# Specific categories
lighthouse https://example.com --only-categories=performance,accessibility

# Mobile emulation
lighthouse https://example.com --form-factor=mobile

# Headless mode
lighthouse https://example.com --chrome-flags="--headless"
```

### Configuration File

```javascript
// lighthouse-config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
    formFactor: 'mobile'
  }
};
```

```bash
lighthouse https://example.com --config-path=lighthouse-config.js
```

### CI/CD Integration

```bash
#!/bin/bash
lighthouse https://example.com --output json --output-path report.json

SCORE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('report.json')).categories.performance.score)")

if (( $(echo "$SCORE < 0.9" | bc -l) )); then
  echo "Performance score: $SCORE (below 0.9)"
  exit 1
fi
```

## Analysis Flow

1. Read `.lighthouse/reports/latest.json`
2. Extract category scores and Core Web Vitals
3. Diagnose specific issues:
   - Check TTFB (Time to First Byte) - target < 600ms
   - Identify framework-specific issues (Next.js chunks, etc.)
   - Analyze Speed Index for perceived performance
   - Check for unused JavaScript with specific URLs
4. Generate targeted code suggestions
5. Prioritize by impact on Core Web Vitals

## Precise Issue Diagnostics

### Server Response Time (TTFB) Analysis

When TTFB is high (> 600ms), analyze these areas:

**1. Check Backend Performance**
```bash
# Test raw server response
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://your-site.com

# Test from different locations
# Use tools like: webpagetest.org, pingdom, GTmetrix
```

**2. Identify Framework-Specific Issues**
- **Next.js**: Check if using `getServerSideProps` for cacheable content
- **React**: Consider SSR vs SSG trade-offs
- **API Routes**: Add response caching headers

**3. CDN Configuration**
```javascript
// Next.js: Enable Image Optimization CDN
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    loader: 'cloudinary', // or 'akamai', 'imgix'
  }
};
```

### Next.js Bundle Optimization

Detect Next.js chunks in unused JavaScript:

```javascript
// Check report for: /_next/static/chunks/
// Look for high wasted percentages (>50%)

// Use dynamic imports for heavy components
import dynamic from 'next/dynamic');

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### Speed Index Optimization

Speed Index measures visual completeness. To improve:

**1. Inline Critical CSS**
```html
<head>
  <style>
    /* Critical above-the-fold styles */
    .hero { display: flex; min-height: 100vh; }
    .title { font-size: 2rem; font-weight: bold; }
  </style>
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
</head>
```

**2. Preload Critical Resources**
```html
<link rel="preload" href="/hero-image.webp" as="image">
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preconnect" href="https://api.example.com">
```

## Common Code Fix Patterns

### Minify CSS/JS

```bash
# Using cssnano
npm install --save-dev cssnano postcss

# postcss.config.js
module.exports = {
  plugins: [require('cssnano')]
};

# Using Terser for JS
npm install --save-dev terser
npx terser input.js -o output.min.js
```

### Remove Unused CSS

```bash
# Using PurgeCSS
npm install --save-dev @fullhuman/postcss-purgecss

module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html']
    })
  ]
};
```

### Lazy Loading

```html
<!-- Native lazy loading -->
<img src="image.jpg" loading="lazy" alt="Description">
<iframe src="video.html" loading="lazy"></iframe>
```

## Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [Web.dev Performance Guides](https://web.dev/fast/)
- [Core Web Vitals](https://web.dev/vitals/)
- [GitHub Repository](https://github.com/GoogleChrome/lighthouse)
