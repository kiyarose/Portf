# ZAP Ignore File Format and Configuration

## Overview

The `.zap-ignore` file is used by OWASP ZAP to suppress known/expected alerts during security scans. This document explains the format and current configuration.

## File Format

The `.zap-ignore` file must use **TAB-separated** values with the following format:

```
<alert_id>	<action>	(<description>)
```

Where:
- `<alert_id>`: The numeric ZAP plugin ID (e.g., 10055, 10109)
- `<action>`: Must be `IGNORE` (uppercase)
- `(<description>)`: Optional description in parentheses explaining why the alert is ignored

**Important**: Fields MUST be separated by TAB characters, not spaces!

## Current Ignored Alerts

### Required for Functionality

**10055 - CSP: style-src unsafe-inline**
- **Reason**: Required for Framer Motion animations which dynamically generate inline styles
- **Status**: Cannot be removed without breaking animations
- **Risk**: Low - no user-generated content, controlled inline styles only

**90003 - Sub Resource Integrity Missing (Google Fonts)**
- **Reason**: Google Fonts serves dynamic CSS based on user-agent/browser capabilities
- **Status**: Cannot use SRI with dynamic content
- **Risk**: Low - Google Fonts is a trusted CDN

### Informational (No Action Needed)

**10027 - Information Disclosure - Suspicious Comments**
- **Reason**: False positives from minified JavaScript build artifacts
- **Status**: No actual sensitive comments in code
- **Risk**: None - informational only

**10109 - Modern Web Application**
- **Reason**: Detection of modern web technologies (React, etc.)
- **Status**: Informational detection, not a vulnerability
- **Risk**: None - informational only

**40035 - Hidden File Finder**
- **Reason**: ZAP checks for common hidden files (.git, .env, etc.)
- **Status**: These files don't exist in our deployed build
- **Risk**: None - informational scan only

**10094 - Base64 Disclosure**
- **Reason**: Build artifacts contain base64-encoded resources (images, fonts)
- **Status**: Expected behavior for optimized web apps
- **Risk**: None - standard practice

**10049/10015/10050 - Cache-related findings**
- **Reason**: Cache headers are properly configured
- **Status**: Informational scan results
- **Risk**: None - caching is optimized

**90005 - Sec-Fetch-* Headers Missing**
- **Reason**: These are request headers set by the browser, not response headers we control
- **Status**: Not applicable to our application
- **Risk**: None - browser-controlled

### Previously Fixed Issues (Documented for History)

**10098 - Cross-Domain Misconfiguration**
- **Status**: Fixed by removing wildcard CORS headers
- **Location**: `public/_headers` and `firebase.json`

**90004 - Insufficient Site Isolation Against Spectre**
- **Status**: Fixed with `Cross-Origin-Embedder-Policy: credentialless`
- **Location**: `public/_headers` and `firebase.json`

**10035 - Strict-Transport-Security Not Set**
- **Status**: Fixed for all resources including robots.txt and sitemap.xml
- **Location**: `public/_headers` and `firebase.json`

**10021 - X-Content-Type-Options Missing**
- **Status**: Fixed with `X-Content-Type-Options: nosniff`
- **Location**: `public/_headers` and `firebase.json`

## Verification

### Local Testing

To verify the .zap-ignore file is working correctly:

```bash
# Build and start preview server
npm run build
npm run preview

# Run ZAP scan with ignore rules
docker run --rm --network=host \
  -v "$(pwd):/zap/wrk/:ro" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://localhost:4173 -c .zap-ignore
```

Expected output:
- `WARN-NEW: 0` (all warnings properly ignored)
- `IGNORE: X` (number of ignored alerts)
- `PASS: 55+` (all security checks passing)

### Expected Scan Results

With the current configuration:
- **FAIL-NEW: 0** - No critical security issues
- **WARN-NEW: 0** - All expected warnings are ignored
- **IGNORE: 3-5** - Known informational alerts (CSP unsafe-inline, Modern Web App, etc.)
- **PASS: 55+** - All other security checks pass

## Updating the Ignore List

When adding new entries to `.zap-ignore`:

1. **Find the Alert ID**: Run a ZAP scan without the ignore file to see the alert ID
2. **Determine if it should be ignored**: Evaluate if the alert is:
   - Required for functionality (like CSP unsafe-inline for animations)
   - Informational only (like Modern Web Application detection)
   - A false positive (like suspicious comments in minified code)
3. **Add to the file**: Use TAB-separated format:
   ```
   <id>	IGNORE	(<clear explanation of why it's ignored>)
   ```
4. **Test**: Run a scan to verify the alert is properly ignored
5. **Document**: Update this README with the reasoning

## Common Mistakes

❌ **Using spaces instead of tabs**
```
10055    IGNORE    (Description)  # WRONG - spaces
```

✅ **Using tabs**
```
10055	IGNORE	(Description)  # CORRECT - tabs
```

❌ **Missing IGNORE keyword**
```
10055	(Description)  # WRONG
```

✅ **Including IGNORE keyword**
```
10055	IGNORE	(Description)  # CORRECT
```

## References

- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [ZAP Baseline Scan](https://www.zaproxy.org/docs/docker/baseline-scan/)
- [Security Headers Documentation](./SECURITY_HEADERS_CONFIG.md)
- [ZAP Local Testing Results](./ZAP_LOCAL_BUILD_TESTING.md)
