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
// Get performance score (0-1)
const score = lhr.categories.performance.score;

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

## Audit Result Structure

Every audit in `lhr.audits` follows this structure:

```typescript
{
  id: string;              // Unique identifier
  title: string;           // Display name
  description: string;     // What this audit checks
  score: number | null;    // 0-1, null = N/A
  scoreDisplayMode: 'binary' | 'numeric' | 'informative' | 'notApplicable';
  numericValue?: number;   // Metric value in numericUnit
  numericUnit?: string;    // 'millisecond', 'byte', etc.
  displayValue?: string;   // Human-readable value
  details?: DetailsObject; // Detailed findings
  guidanceLevel?: number;  // 0-3, higher = more critical
}
```

## Details Types

### `table` - Common for most audits
```javascript
{
  type: 'table',
  headings: [{ key: 'url', label: 'URL' }],
  items: [
    { url: 'https://example.com/script.js', wastedBytes: 12345 }
  ]
}
```

### `opportunity` - Wasted time metrics
```javascript
{
  type: 'opportunity',
  headings: [{ key: 'url', label: 'URL' }, { key: 'wastedMs', label: 'Wasted Ms' }],
  items: [...],
  overallSavingsMs: 1200  // Total potential savings
}
```

### `list` - Used by insight audits (LCP breakdown, document latency)
```javascript
{
  type: 'list',
  items: [
    { type: 'table', ... },     // Timing breakdown
    { type: 'node', ... }       // DOM element reference
  ]
}
```

### `node` - DOM element reference
```javascript
{
  type: 'node',
  selector: 'div.relative > div.w-full > h1',
  nodeLabel: 'Page Title',
  path: '1,HTML,1,BODY,2,DIV,1,DIV',
  lhId: 'page-0-H1',
  boundingRect: { top: 100, left: 50, width: 800, height: 100 },
  snippet: '<h1 class="title">Page Title</h1>'
}
```

### `filmstrip` - Screenshots timeline
```javascript
{
  type: 'filmstrip',
  scale: 1000,
  items: [
    { timing: 0, data: 'data:image/jpeg;base64,...' },
    { timing: 500, data: 'data:image/jpeg;base64,...' }
  ]
}
```

## Insight Audits Special Structure

Lighthouse v13+ includes "insight" audits that provide deep performance analysis:

### `lcp-breakdown-insight`
```javascript
{
  id: 'lcp-breakdown-insight',
  score: 0,                      // 0 = needs improvement
  scoreDisplayMode: 'numeric',
  guidanceLevel: 3,              // Higher = more critical
  metricSavings: { 'LCP': 0 },   // 0 = informational only
  details: {
    type: 'list',
    items: [
      {
        type: 'table',
        items: [
          { subpart: 'timeToFirstByte', duration: 1418 },
          { subpart: 'resourceLoadDelay', duration: 0 },
          { subpart: 'resourceLoadDuration', duration: 0 },
          { subpart: 'elementRenderDelay', duration: 2646 }
        ]
      },
      {
        type: 'node',
        selector: 'div.relative > div.w-full > h1',
        nodeLabel: '探索 AI 的 无限可能'
      }
    ]
  }
}
```

### `document-latency-insight`
```javascript
{
  id: 'document-latency-insight',
  score: 0,
  details: {
    type: 'list',
    items: [
      {
        type: 'table',
        items: [
          { subpart: 'dnsResolution', duration: 50 },
          { subpart: 'connection', duration: 100 },
          { subpart: 'tlsNegotiation', duration: 80 },
          { subpart: 'requestSent', duration: 200 },
          { subpart: 'waitingForFirstByte', duration: 600 }
        ]
      }
    ],
    overallSavingsMs: 570  // Potential improvement
  }
}
```

## Score Display Modes

| Mode | Values | Meaning |
|------|--------|---------|
| `binary` | 0 or 1 | Pass/fail audit |
| `numeric` | 0-1 | Continuous score |
| `informative` | - | Information only |
| `notApplicable` | null | Audit doesn't apply |

## Guidance Levels

| Level | Meaning | Example |
|-------|---------|---------|
| 0 | Informational | Uses HTTPS |
| 1 | Minor issue | Missing meta description |
| 2 | Moderate issue | Color contrast failures |
| 3 | Critical issue | High TTFB, unused JS > 500KB |
