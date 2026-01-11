# Accessibility Audits Reference

## Common Issues

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

/* Poor: Below 4.5:1 */
.text {
  color: #999;  /* contrast ratio 2.8:1 on white */
  background: #fff;
}
```

### Form Labels
```html
<!-- Explicit label -->
<label for="email">Email:</label>
<input type="email" id="email" name="email">

<!-- Implicit label -->
<label>
  Email:
  <input type="email" name="email">
</label>

<!-- Aria label (for icons) -->
<input type="search" aria-label="Search">
```

### Button Names
```html
<!-- Good: Visible text -->
<button>Submit form</button>

<!-- Good: aria-label -->
<button aria-label="Close dialog">
  <span aria-hidden="true">&times;</span>
</button>

<!-- Bad: No accessible name -->
<button><span class="icon-x"></span></button>
```

### Link Text
```html
<!-- Good: Descriptive -->
<a href="/about">About our company</a>

<!-- Bad: Generic -->
<a href="/about">Click here</a>
<a href="/page">Read more</a>
```

### Heading Hierarchy
```html
<!-- Good: Proper hierarchy -->
<h1>Main title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>

<!-- Bad: Skipped levels -->
<h1>Main title</h1>
  <h4>Section</h4>
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

## WCAG Levels

- **A**: Minimum compliance
- **AA**: Standard compliance (recommended)
- **AAA**: Highest compliance

## Quick Checklist

- [ ] All images have alt text
- [ ] Color contrast ≥ 4.5:1
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Links describe destination
- [ ] Headings follow hierarchy
- [ ] Tap targets ≥ 48x48px
- [ ] Page language specified
