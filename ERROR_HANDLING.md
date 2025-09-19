# Error Handling & Security Guide

This document outlines the error handling and security practices implemented in the Kiya Rose Portfolio to prevent information disclosure and XSS attacks.

## Error Sanitization

### Overview

All error messages are sanitized before being logged or displayed to prevent sensitive information exposure such as:

- API keys and tokens
- File system paths
- URLs with sensitive parameters
- Email addresses
- Stack traces with internal details
- System error codes

### Implementation

#### Core Utilities (`src/utils/errorSanitizer.ts`)

- `sanitizeErrorMessage(error)` - Main function for sanitizing any error object/string
- `safeConsoleWarn()` and `safeConsoleError()` - Replacements for console logging
- `GENERIC_ERROR_MESSAGES` - Pre-defined safe error messages

#### Error Boundary (`src/components/ErrorBoundary.tsx`)

- Catches React component errors
- Logs sanitized error information
- Displays user-friendly fallback UI
- Provides debug information in development mode only

### Usage Guidelines

#### ✅ Do - Use Safe Logging

```typescript
import { safeConsoleWarn, safeConsoleError } from "../utils/errorSanitizer";

try {
  // risky operation
} catch (error) {
  safeConsoleWarn("Operation failed", error);
}
```

#### ❌ Don't - Raw Error Logging

```typescript
// DON'T DO THIS - exposes sensitive data
console.error("API call failed:", error);
console.warn(`Failed to access ${apiKey}:`, error.message);
```

### Development vs Production

**Development Mode:**

- Less aggressive sanitization for debugging
- Error IDs and debug information visible
- Component stack traces available

**Production Mode:**

- Strict sanitization removes all sensitive patterns
- Generic user-friendly messages
- No internal debugging information exposed

### Security Features

1. **Pattern-based Sanitization**: Removes API keys, file paths, URLs, emails
2. **XSS Prevention**: Strips potentially dangerous HTML/script tags
3. **Length Limiting**: Truncates overly long error messages
4. **Context-aware Messages**: Provides helpful generic messages based on error type
5. **Environment-aware**: Different behavior in dev vs production

## React Error Boundary

The application is wrapped in an ErrorBoundary component that:

- Catches JavaScript errors anywhere in the component tree
- Logs sanitized error information
- Displays a user-friendly "Something went wrong" message
- Provides "Try again" and "Reload page" options
- Shows debug information only in development

## Contact Form Security

The contact form implements additional protections:

- API key exposure prevention (logs generic message instead of environment variable name)
- Clipboard operation error sanitization
- Form validation error sanitization

## Best Practices

1. **Always use `safeConsoleWarn`/`safeConsoleError`** instead of raw console methods
2. **Wrap components in ErrorBoundary** for graceful error handling
3. **Use generic error messages** for user-facing errors
4. **Test error scenarios** to ensure sanitization works correctly
5. **Review logs regularly** to ensure no sensitive data is being exposed

## Testing Error Scenarios

To test the error handling:

1. **Trigger Network Errors**: Disconnect internet and try form submission
2. **Cause React Errors**: Temporarily add `throw new Error()` in components
3. **Test Clipboard Failures**: Use browser that blocks clipboard access
4. **Check Console Output**: Verify only sanitized messages appear

## Compliance

This implementation helps meet security requirements for:

- Information disclosure prevention
- XSS attack mitigation
- User privacy protection
- Debugging information security
