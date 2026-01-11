---
name: lighthouse
description: Google Lighthouse performance, accessibility, SEO, and best practices audits for web optimization. Analyze Lighthouse reports (JSON/HTML), understand performance metrics, Core Web Vitals, and implement optimization recommendations.
---

# Lighthouse Skill

Comprehensive assistance with Google Lighthouse web performance auditing, analysis, and optimization.

## When to Use This Skill

This skill should be triggered when:
- Working with Lighthouse audit reports (JSON or HTML format)
- Analyzing performance, accessibility, SEO, or best practices issues
- Implementing Core Web Vitals optimizations
- Running Lighthouse from CLI or programmatically

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

## Reference Files

This skill includes comprehensive documentation in `references/`:

- **report-format.md** - Lighthouse Result (LHR) JSON structure
- **performance.md** - Performance audits and metrics
- **seo.md** - SEO audits and best practices
- **cli.md** - Command-line usage reference
- **accessibility.md** - WCAG compliance audits

## Working with This Skill

### For Reports

Analyze a Lighthouse JSON report by providing the file path or using the `.lighthouse/reports/latest.json` convention.

### For Performance Optimization

1. Focus on Core Web Vitals thresholds first
2. Address high-impact opportunities (with wasted ms)
3. Implement diagnostics to understand root causes
4. Re-run audits to verify improvements

## Resources

- [Lighthouse Overview](https://developer.chrome.com/docs/lighthouse)
- [Web.dev Performance Guides](https://web.dev/fast/)
- [Core Web Vitals](https://web.dev/vitals/)
