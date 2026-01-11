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
- Improve server response time (TTFB)
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

## TTFB (Time to First Byte) Diagnosis

TTFB is the foundation for all performance metrics. Target: < 600ms

### Diagnosis by Value

| TTFB | Diagnosis | Action |
|------|-----------|--------|
| > 1000ms | Critical | Server-side bottleneck, urgent backend optimization |
| 600-1000ms | Elevated | CDN + caching needed, check database queries |
| 400-600ms | Moderate | Consider edge computing, enable compression |
| < 400ms | Good | Acceptable, focus on other metrics |

### Root Cause Analysis

**1. Test Backend Performance**
```bash
# Measure TTFB directly
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://your-site.com

# Check DNS resolution time
curl -o /dev/null -s -w "DNS: %{time_namelookup}s\n" https://your-site.com

# Check SSL/TLS handshake
curl -o /dev/null -s -w "SSL: %{time_appconnect}s\n" https://your-site.com
```

**2. Framework-Specific Optimizations**

**Next.js with ISR (Incremental Static Regeneration):**
```javascript
// pages/index.js
export const revalidate = 60; // Regenerate every 60 seconds

export async function getStaticProps() {
  const data = await fetch('https://api.example.com/data');
  return {
    props: { data },
    revalidate: 60
  };
}
```

**Next.js with Edge Runtime:**
```javascript
// app/api/route.js
export const runtime = 'edge';

export async function GET() {
  return Response.json({ data: 'hello from edge' });
}
```

**3. Database Query Optimization**
```javascript
// Bad: N+1 query problem
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findAll({ where: { userId: user.id } });
}

// Good: Eager loading with JOIN
const users = await User.findAll({
  include: [{ model: Post, as: 'posts' }]
});

// Good: Use connection pooling
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000 });
```

**4. Enable Compression**
```nginx
# Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_types text/plain text/css application/json application/javascript text/xml;

# Brotli (better compression)
brotli on;
brotli_types text/plain text/css application/json application/javascript;
brotli_comp_level 6;
```

**5. CDN Configuration**
```javascript
// Next.js Image Optimization with CDN
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
    formats: ['image/avif', 'image/webp'],
  }
};
```

## Next.js Bundle Optimization

### Detect Issues

Look for these patterns in your Lighthouse report:
- Unused JavaScript URLs containing `/_next/static/chunks/`
- Wasted bytes > 100KB per chunk
- Wasted percentage > 50%

### Solutions

**1. Dynamic Imports for Code Splitting**
```javascript
import dynamic from 'next/dynamic');

// Heavy chart library
const Chart = dynamic(() => import('chart.js'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Skip SSR for client-only libraries
});

// Modal components
const Modal = dynamic(() => import('./Modal'), {
  loading: () => null
});

export default function Dashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <Chart />
      <Modal />
    </>
  );
}
```

**2. Route-based Splitting**
```javascript
// Instead of importing all routes
import Dashboard from './dashboard';
import Settings from './settings';
import Profile from './profile';

// Use dynamic imports
const Dashboard = dynamic(() => import('./dashboard'));
const Settings = dynamic(() => import('./settings'));
const Profile = dynamic(() => import('./profile'));
```

**3. Third-party Library Optimization**
```javascript
// Bad: Import entire library
import _ from 'lodash';

// Good: Import specific functions
import debounce from 'lodash/debounce';

// Better: Use modularizeImports in next.config.js
module.exports = {
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    'lodash-es': {
      transform: 'lodash-es/{{member}}',
    },
  },
};
```

**4. Analyze Bundle Size**
```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
});
```

```bash
ANALYZE=true npm run build
```

## Speed Index Optimization

Speed Index measures how quickly content is visually complete. Target: < 3.4s

### Diagnosis

| Speed Index | Diagnosis | Action |
|-------------|-----------|--------|
| > 5s | Poor | Above-the-fold content not rendering quickly |
| 3.4-5s | Needs Improvement | Defer non-critical resources |
| < 3.4s | Good | Visual performance is acceptable |

### Solutions

**1. Inline Critical CSS**
```html
<head>
  <style>
    /* Extract critical CSS for above-the-fold content */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .hero { min-height: 100vh; display: flex; align-items: center; }
    .title { font-size: clamp(2rem, 5vw, 4rem); font-weight: 700; }
  </style>
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
```

**2. Preload Critical Resources**
```html
<!-- Preconnect to external origins -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- Preload critical assets -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/hero.webp" as="image">

<!-- Preconnect for third-party scripts -->
<link rel="preconnect" href="https://www.google-analytics.com">
```

**3. Resource Hints Priority**
```html
<!-- High priority: preload (blocking if critical) -->
<link rel="preload" href="critical.js" as="script">

<!-- Medium priority: preconnect (warm up connection) -->
<link rel="preconnect" href="https://api.example.com">

<!-- Low priority: prefetch (fetch for next navigation) -->
<link rel="prefetch" href="/next-page.js" as="script">
```

## Common Opportunities

### Render-Blocking Resources
```html
<!-- Non-blocking CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- Deferred JS -->
<script src="script.js" defer></script>

<!-- Async for non-critical JS -->
<script src="analytics.js" async></script>
```

### Image Optimization
```html
<!-- Specify dimensions (prevents layout shift) -->
<img src="image.jpg" width="800" height="600" alt="Description">

<!-- Lazy loading (defers offscreen images) -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Modern formats (smaller file size) -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>

<!-- Responsive images -->
<img src="image-800.jpg"
     srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
     width="800" height="600"
     alt="Description">
```

### Unused CSS/JS
```javascript
// Dynamic imports
const module = await import('./module.js');

// Load on interaction
button.addEventListener('click', async () => {
  const { Chart } = await import('chart.js');
  new Chart(ctx, config);
});

// Code splitting with React.lazy
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```
