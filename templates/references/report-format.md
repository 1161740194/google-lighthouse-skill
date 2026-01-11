# Lighthouse Report Format

## JSON Structure

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

## Category Scores

```javascript
// Get performance score
const score = lhr.categories.performance.score; // 0-1

// Convert to percentage
const percentage = Math.round(score * 100); // 0-100
```

## Core Web Vitals Audits

- `largest-contentful-paint` - LCP in ms
- `max-potential-fid` - FID in ms
- `cumulative-layout-shift` - CLS score
- `first-contentful-paint` - FCP in ms
- `total-blocking-time` - TBT in ms
- `speed-index` - SI in ms

## Extracting Metrics

```javascript
function getMetrics(lhr) {
  return {
    lcp: lhr.audits['largest-contentful-paint'].numericValue,
    fid: lhr.audits['max-potential-fid'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue
  };
}
```

## Failed Audits

```javascript
function getFailedAudits(lhr, categoryId) {
  const category = lhr.categories[categoryId];
  return category.auditRefs
    .map(ref => lhr.audits[ref.id])
    .filter(audit => audit.score < 0.5);
}
```

## Opportunities

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
