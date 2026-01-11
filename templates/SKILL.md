---
name: lighthouse
description: Google Lighthouse performance, accessibility, SEO, and best practices audits for web optimization. Analyze Lighthouse reports (JSON/HTML), understand performance metrics, Core Web Vitals, and implement optimization recommendations with precise diagnostics.
---

# Lighthouse Skill

Comprehensive assistance with Google Lighthouse web performance auditing, analysis, and optimization.

## When to Use This Skill

This skill should be triggered when:
- Working with Lighthouse audit reports (JSON or HTML format)
- Analyzing performance, accessibility, SEO, or best practices issues
- Implementing Core Web Vitals optimizations
- Running Lighthouse from CLI or programmatically
- Diagnosing TTFB, bundle size, or Speed Index issues

## Quick Reference

### Lighthouse CLI Commands

```bash
# Run a basic audit
lighthouse https://example.com

# Output JSON
lighthouse https://example.com --output json --output-path .lighthouse/reports/latest.json

# Run specific categories
lighthouse https://example.com --only-categories=performance,accessibility
```

### Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TBT** (Total Blocking Time): < 200ms
- **TTFB** (Time to First Byte): < 600ms
- **Speed Index**: < 3.4s

### Key Diagnostic Thresholds

| Metric | Critical | Elevated | Moderate | Good |
|--------|----------|----------|----------|------|
| TTFB | > 1000ms | 600-1000ms | 400-600ms | < 400ms |
| Speed Index | > 5s | 3.4-5s | - | < 3.4s |
| Unused JS | > 50% waste | 30-50% waste | - | < 30% waste |

## Reference Files

This skill includes comprehensive documentation in `references/`:

- **report-format.md** - Lighthouse Result (LHR) JSON structure
- **performance.md** - Performance audits, TTFB diagnosis, Next.js optimization, Speed Index
- **seo.md** - SEO audits and best practices
- **cli.md** - Command-line usage reference
- **accessibility.md** - WCAG compliance audits

## Working with This Skill

### Analyzing Reports

When analyzing a Lighthouse report, this skill will:

1. **Extract category scores** - Performance, Accessibility, SEO, Best Practices
2. **Check Core Web Vitals** - LCP, FID, CLS, FCP, TBT against thresholds
3. **Diagnose specific issues**:
   - TTFB root cause analysis (server location, CDN, database, compression)
   - Framework detection (Next.js chunks, React bundles)
   - Speed Index analysis (critical CSS, resource prioritization)
4. **Generate targeted fixes** - Prioritized by impact on Core Web Vitals

### For Performance Optimization

1. Focus on Core Web Vitals thresholds first
2. Address TTFB if > 600ms (affects LCP, FCP, SI)
3. Identify framework-specific issues (Next.js, React, etc.)
4. Address high-impact opportunities (with wasted ms)
5. Implement diagnostics to understand root causes
6. Re-run audits to verify improvements

### Precise Diagnostics

This skill provides framework-specific optimizations:
- **Next.js**: ISR, Edge Runtime, dynamic imports, bundle analyzer
- **React**: Code splitting, lazy loading, React.memo
- **General**: CDN, caching, compression, image optimization

## Resources

- [Lighthouse Overview](https://developer.chrome.com/docs/lighthouse)
- [Web.dev Performance Guides](https://web.dev/fast/)
- [Core Web Vitals](https://web.dev/vitals/)
