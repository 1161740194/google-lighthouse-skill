# Performance Audits Reference

## Scoring

Performance score (0-100) is weighted:

| Metric | Weight |
|--------|--------|
| FCP | 10% |
| Speed Index | 10% |
| LCP | 25% |
| TTI | 10% |
| TBT | 30% |
| CLS | 15% |

## Core Web Vitals

### LCP (Largest Contentful Paint)
- Target: < 2.5s
- Measures: Largest content element render time

**Optimization:**
- Preload critical images
- Remove render-blocking resources
- Improve server response time
- Use CDN

### FID (First Input Delay)
- Target: < 100ms
- Measures: Input responsiveness

**Optimization:**
- Break up long JavaScript tasks
- Reduce JavaScript execution time
- Use web workers

### CLS (Cumulative Layout Shift)
- Target: < 0.1
- Measures: Layout stability

**Optimization:**
- Reserve space for images and ads
- Avoid inserting content above existing content
- Use transform animations

## Common Opportunities

### Render-Blocking Resources
```html
<!-- Non-blocking CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- Deferred JS -->
<script src="script.js" defer></script>
```

### Image Optimization
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

### Unused CSS/JS
```javascript
// Dynamic imports
const module = await import('./module.js');

// Code splitting
import(/* webpackChunkName: "lodash" */ 'lodash').then(_ => {
  // Use lodash
});
```
