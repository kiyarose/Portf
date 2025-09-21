# PostCSS CLI Integration

## What was added

The `postcss-cli` package has been added to provide command-line PostCSS functionality for enhanced Tailwind CSS workflow capabilities.

**Note**: The originally requested `@tailwind/postcss` package does not exist in the npm registry. This was interpreted as a request for PostCSS CLI functionality, which provides the most likely intended benefit.

## Dependencies Added

- `postcss-cli@^11.0.1` in devDependencies

## New Scripts Available

Two new npm scripts have been added to package.json:

- `npm run css:build` - Builds CSS using PostCSS CLI with the current configuration
- `npm run css:watch` - Watches for changes and rebuilds CSS using PostCSS CLI

## Benefits

The PostCSS CLI integration provides:

- Command-line access to PostCSS processing
- Ability to process CSS files independently of Vite
- Additional flexibility for advanced Tailwind CSS workflows
- Compatibility with existing PostCSS configuration

## Usage Examples

```bash
# Build CSS using the project's PostCSS config
npm run css:build

# Watch for changes and rebuild CSS
npm run css:watch

# Manual PostCSS processing
npx postcss src/index.css --config . --output dist/style.css

# Process CSS with specific plugins
npx postcss src/index.css --use tailwindcss --use autoprefixer --output dist/style.css
```

## Compatibility

This addition is fully compatible with the existing setup:
- ✅ Existing build process works unchanged
- ✅ Vite integration works unchanged  
- ✅ All linting passes
- ✅ All Tailwind CSS features work as expected
- ✅ Custom Tailwind configuration is respected