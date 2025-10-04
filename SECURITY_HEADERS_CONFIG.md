# Security Headers Master Configuration

This document explains the centralized security headers configuration system implemented to ensure consistency across all deployment environments.

## Problem

Previously, security headers were duplicated across three files:

1. `public/_headers` - for Cloudflare Pages
2. `firebase.json` - for Firebase Hosting
3. `vite.config.ts` - for local preview server

This duplication made it difficult to keep headers synchronized and increased the risk of configuration drift.

## Solution

A master configuration file (`security-headers.config.ts`) that serves as the single source of truth for all security headers.

### File Structure

```
security-headers.config.ts  ← Master configuration
├── Used by vite.config.ts (import)
├── Reference for public/_headers (manual sync required)
└── Reference for firebase.json (manual sync required)
```

## Master Configuration File

**File:** `security-headers.config.ts`

Contains:

- `SECURITY_HEADERS` - Object with all security headers
- `CACHE_HEADERS` - Cache control headers for different resource types
- Helper functions for converting to different formats

## Usage

### Vite Preview Server (Automated)

`vite.config.ts` automatically imports and uses the master configuration:

```typescript
import { SECURITY_HEADERS } from "./security-headers.config";

function serveSecurityHeaders(): Plugin {
  return {
    name: "serve-security-headers",
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
        // Apply security headers from master config
        for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
          res.setHeader(key, value);
        }
        next();
      });
    },
  };
}
```

### Cloudflare Pages & Firebase Hosting (Manual Sync)

For `public/_headers` and `firebase.json`, headers must be manually synchronized with the master configuration. Use the verification script to check parity.

## Verification

### Manual Verification

Run the verification script to check that all files are synchronized:

```bash
npm run verify:security-headers
```

**Note**: The script now throws errors instead of using `process.exit()` (following Node.js best practices). When the script exits with a non-zero code, it indicates validation failed.

### Automated CI Check

A GitHub Actions workflow (`security-headers-parity.yml`) automatically runs on:

- Pull requests that modify security-related files
- Pushes to main that modify security-related files

The workflow will fail if:

- `vite.config.ts` doesn't import from the master config
- Required headers are missing from `public/_headers`
- Required headers are missing from `firebase.json`

## Updating Security Headers

### Step 1: Update Master Config

Edit `security-headers.config.ts` to add, remove, or modify headers.

### Step 2: Update Dependent Files

Manually update:

- `public/_headers` - Update header values to match master config
- `firebase.json` - Update header values in the `headers` array

### Step 3: Verify

```bash
npm run verify:security-headers
```

### Step 4: Test Locally

```bash
npm run build
npm run preview
# Test in browser or with curl
curl -I http://localhost:4173/
```

## Files Modified

### Created

- `security-headers.config.ts` - Master configuration file
- `scripts/verify-security-headers.mjs` - Verification script
- `.github/workflows/security-headers-parity.yml` - CI verification workflow

### Modified

- `vite.config.ts` - Now imports from master config
- `package.json` - Added `verify:security-headers` script
- `eslint.config.js` - Added scripts folder to Node.js config

## Benefits

1. **Single Source of Truth**: All headers defined in one place
2. **Automated Verification**: CI checks ensure parity
3. **Easy Updates**: Update master config, then sync dependent files
4. **Type Safety**: TypeScript provides autocomplete and type checking
5. **Documentation**: Centralized location for security policy documentation

## Future Improvements

Consider automating the synchronization of `public/_headers` and `firebase.json` using a build script that generates these files from the master configuration.

## References

- [Master Config](../security-headers.config.ts)
- [Verification Script](../scripts/verify-security-headers.mjs)
- [CI Workflow](../.github/workflows/security-headers-parity.yml)
- [Vite Configuration](../vite.config.ts)
