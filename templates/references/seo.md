# SEO Audits Reference

## Key Audits

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
