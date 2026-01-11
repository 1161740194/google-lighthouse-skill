# Lighthouse CLI Reference

## Installation

```bash
npm install -g lighthouse
```

## Basic Usage

```bash
# Run audit
lighthouse https://example.com

# Output JSON
lighthouse https://example.com --output json --output-path report.json

# Multiple formats
lighthouse https://example.com --output html,json --output-path ./reports
```

## Category Selection

```bash
# Specific categories
lighthouse https://example.com --only-categories=performance,accessibility

# Available categories
# - performance
# - accessibility
# - best-practices
# - seo
# - pwa
```

## Options

```bash
# Headless mode
lighthouse https://example.com --chrome-flags="--headless"

# Mobile emulation
lighthouse https://example.com --form-factor=mobile

# Throttling
lighthouse https://example.com --throttling-method=devtools

# Custom viewport
lighthouse https://example.com --screenEmulation.mobile
```

## Authentication

```bash
# With headers
lighthouse https://example.com --extra-headers='{"Authorization": "Bearer token"}'

# With cookies
echo '{"url": "https://example.com", "name": "session", "value": "abc"}' > cookies.json
lighthouse https://example.com --cookies-path cookies.json
```

## Configuration File

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

## CI/CD

```bash
#!/bin/bash
lighthouse https://example.com --output json --output-path report.json

SCORE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('report.json')).categories.performance.score)")

if (( $(echo "$SCORE < 0.9" | bc -l) )); then
  echo "Performance score: $SCORE (below 0.9)"
  exit 1
fi
```
