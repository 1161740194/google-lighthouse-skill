# Google Lighthouse CLI (`gl`)

A powerful CLI tool for analyzing Google Lighthouse reports and generating code optimization suggestions. Works with **Claude Code** and **Antigravity** IDEs.

## Features

- 🔧 **Initialize Lighthouse skill** in any project with `gl init`
- 📊 **Analyze reports** with detailed insights and metrics
- 💡 **Generate fix suggestions** with ready-to-use code snippets
- 🎯 **Core Web Vitals tracking** (LCP, FID, CLS, etc.)
- 🔍 **Performance, a11y, SEO analysis**
- 🛠️ **IDE integration** for Claude Code and Antigravity

## Installation

### Global Installation

```bash
npm install -g @google-lighthouse-skill/cli
```

Or install from source:

```bash
git clone https://github.com/yourusername/google-lighthouse-skill.git
cd google-lighthouse-skill
npm install -g .
```

### Verify Installation

```bash
gl --version
gl --help
```

## Usage

### 1. Initialize in Your Project

```bash
# Navigate to your project
cd my-project

# Initialize Lighthouse skill
gl init
```

The `gl init` command will:

1. **Ask which IDE(s)** you use (Claude Code, Antigravity, or both)
2. **Create `.lighthouse/`** directory structure
3. **Add skill files** to your IDE's configuration
4. **Update `package.json`** with helpful scripts

#### Interactive IDE Selection

```
? Select your IDE(s):
❯ ◉ Claude Code - Official Claude Code
  ○ Antigravity - AI development environment
```

#### Quick Init (Skip Prompts)

```bash
# Use all defaults
gl init --yes

# Specify IDE directly
gl init --ide claude
gl init --ide antigravity
gl init --ide all
```

### 2. Run Lighthouse Audit

```bash
# From your project (after gl init)
npm run lighthouse:audit

# Or manually
lighthouse http://localhost:3000 --output json --output-path .lighthouse/reports/latest.json
```

### 3. Analyze Report

```bash
# Analyze latest report
gl analyze

# Analyze specific report
gl analyze .lighthouse/reports/report.json

# Filter by category
gl analyze --category performance

# Show verbose output
gl analyze --verbose

# Output as JSON
gl analyze --format json

# Set minimum score threshold
gl analyze --min-score 0.8
```

### 4. Generate Fix Suggestions

```bash
# Generate fixes from latest report
gl fixes

# Generate from specific report
gl fixes .lighthouse/reports/report.json

# Save to specific file
gl fixes --output ./fixes.md

# Filter by category
gl fixes --category performance
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `gl init` | Initialize Lighthouse skill in current project |
| `gl analyze [report]` | Analyze a Lighthouse JSON report |
| `gl fixes [report]` | Generate fix suggestions from report |
| `gl --help` | Show help message |
| `gl --version` | Show version number |

## Project Structure

After running `gl init`, your project will have:

```
my-project/
├── .lighthouse/
│   ├── config.json          # Lighthouse skill configuration
│   ├── reports/             # Lighthouse JSON reports go here
│   ├── analysis/            # Analysis outputs
│   └── fixes/               # Generated fix suggestions
├── .claude/
│   └── skills/
│       └── lighthouse/      # Claude Code skill files
└── .agent/
    └── workflows/
        └── google-lighthouse.md  # Antigravity skill file
```

## IDE Integration

### Claude Code

The skill is in `.claude/skills/lighthouse/`. Use natural language:

```
Analyze the Lighthouse report and suggest improvements
What are my Core Web Vitals scores?
Generate code fixes for failed audits
```

### Antigravity

The skill is in `.agent/workflows/google-lighthouse.md`. Just mention "Lighthouse" in your chat:

```
Analyze my Lighthouse report
Check performance issues
Generate optimizations
```

## Core Web Vitals

The tool tracks these key metrics:

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| LCP | < 2.5s | 🟢 | 🟡 |
| FID | < 100ms | 🟢 | 🟡 |
| CLS | < 0.1 | 🟢 | 🟡 |
| FCP | < 1.8s | 🟢 | 🟡 |
| TBT | < 200ms | 🟢 | 🟡 |

## Examples

### Example 1: Quick Performance Check

```bash
# Initialize
gl init --ide claude --yes

# Run audit (make sure your dev server is running)
npm run lighthouse:audit

# Analyze results
gl analyze

# Get fixes
gl fixes
```

### Example 2: CI/CD Integration

```bash
# In your CI pipeline
lighthouse https://example.com --output json --output-path .lighthouse/reports/ci.json

# Check performance score
gl analyze .lighthouse/reports/ci.json --format json --min-score 0.9

# Exit with error if score is low
if [ $? -ne 0 ]; then
  echo "Performance score below threshold!"
  exit 1
fi
```

## Output Formats

### Console Output

```
📊 Lighthouse Analysis

Summary
────────────────────────────────────────
  URL:         https://example.com
  Version:     11.5.0
  Timestamp:   2025-01-11 14:30:22

Category Scores
────────────────────────────────────────
  🟢 performance:     92/100
  🟡 accessibility:  78/100
  🟢 seo:            95/100

Core Web Vitals
────────────────────────────────────────
  Metric              Value        Rating
  ──────────────────────────────────────────
  Largest Contentful Paint    1.2 s  ✅ Pass
  First Input Delay          85 ms  ✅ Pass
  Cumulative Layout Shift   0.05    ✅ Pass
```

## Troubleshooting

### Command not found

```bash
# Make sure npm global bin is in your PATH
export PATH="$PATH:$(npm config get prefix)/bin"

# Or use npx
npx @google-lighthouse-skill/cli init
```

### Lighthouse not found

```bash
# Install Lighthouse CLI
npm install -g lighthouse
```

## Development

```bash
# Clone repository
git clone https://github.com/yourusername/google-lighthouse-skill.git
cd google-lighthouse-skill

# Install dependencies
npm install

# Run in development mode
node bin/gl.js init
```

## License

MIT License - see LICENSE file for details.

## Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [Web.dev Performance Guides](https://web.dev/fast/)
- [Core Web Vitals](https://web.dev/vitals/)
- [GitHub Repository](https://github.com/GoogleChrome/lighthouse)
