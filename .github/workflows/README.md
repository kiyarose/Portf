# GitHub Actions Workflows

This directory contains automated workflows for the portfolio project. Workflows have been consolidated for better efficiency and ease of maintenance.

## Active Workflows (10)

### Core Automation
- **`automation-suite.yml`** - Comprehensive issue & PR automation
  - Adds new issues to project board with "Backlog" status
  - Updates issue status based on linked PR state (In Progress → In Review)
  - Syncs labels between linked issues and PRs
  - Syncs milestones between linked issues and PRs
  - Auto-labels ZAP security scan issues

### Quality & Testing
- **`pr-screenshot.yml`** - E2E Testing Suite
  - Generates screenshots (web & mobile, light & dark themes)
  - Runs accessibility tests using axe-core
  - Publishes results to GitHub Pages
  - Comments on PRs with visual results

- **`lhci.yml`** - Lighthouse CI & Comment Cleanup
  - Runs Lighthouse performance/accessibility audits
  - Creates review comments with audit results
  - Cleans up outdated SonarQube comments
  - Removes stale Lighthouse review comments

- **`lychee.yml`** - Link Checker
  - Validates all links in repository
  - Checks links in built site (dist/)

### Security
- **`codeql.yml`** - CodeQL Security Scanning
  - Scans JavaScript/TypeScript code
  - Scans Swift code (macOS dashboard)
  - Only runs when relevant files change

- **`zap.yml`** - ZAP Security Baseline Scan
  - Runs nightly at 06:00 UTC
  - Scans production site (https://kiya.cat)
  - Creates issues for security findings

- **`security-headers-parity.yml`** - Security Headers Verification
  - Verifies security headers are synchronized across:
    - `security-headers.config.ts`
    - `vite.config.ts`
    - `public/_headers`
    - `firebase.json`

### Build & Deployment
- **`swift-dashboard-build.yml`** - macOS Dashboard Build
  - Builds the Swift DashCam! companion app
  - Only runs when Swift files change

### Maintenance
- **`dependabot-automerge.yml`** - Dependabot Auto-merge
  - Automatically merges Dependabot PRs
  - Uses squash merge strategy

- **`restyled.yml`** - Code Style Reformatting
  - Manual trigger only (workflow_dispatch)
  - Applies consistent code formatting

## Consolidation Summary

**Original:** 23 workflows  
**Current:** 10 workflows  
**Reduction:** 57% fewer workflows

### Merged Workflows

The following workflows were consolidated into existing workflows:

| Removed Workflow | Merged Into | Reason |
|-----------------|-------------|--------|
| `sync-issue-labels.yml` | `automation-suite.yml` | Duplicate label syncing logic |
| `project-automation.yml` | `automation-suite.yml` | Duplicate project board logic |
| `github-projects-integration.yml` | `automation-suite.yml` | Incomplete implementation |
| `project-board-automation.yml` | `automation-suite.yml` | Contains actual GraphQL implementation |
| `label-zap-issues.yml` | `automation-suite.yml` | Issue automation fits suite pattern |
| `cleanup-sonar-comments.yml` | `lhci.yml` | Both clean up PR comments |
| `a11y-axe.yml` | `pr-screenshot.yml` | Both use Playwright, can run together |

### Removed Workflows

The following workflows were removed as they were disabled or incomplete:

- `firebase-hosting-merge.yml` - Disabled (Cloudflare Pages handles deploys)
- `firebase-hosting-pull-request.yml` - Disabled (Cloudflare Pages handles previews)
- `cloudflare-pages-preview.yml` - Disabled (temporarily paused)
- `cloudflare-pages-merge.yml` - Disabled (temporarily paused)
- `ImportEnvVar.yml` - Incomplete (no name or triggers)

## Benefits of Consolidation

1. **Reduced Runner Time**: Fewer workflow runs mean less compute time and faster CI/CD
2. **Better Context**: Related automation is grouped together
3. **Easier Maintenance**: Changes to related logic can be made in one place
4. **Improved Debugging**: Related actions are in the same workflow logs
5. **Simplified Permissions**: Consolidated permissions are easier to audit

## Workflow Triggers Summary

| Workflow | Trigger | Frequency |
|----------|---------|-----------|
| `automation-suite.yml` | Issues & PRs | On event |
| `pr-screenshot.yml` | PRs & main push | On event |
| `lhci.yml` | PRs | On event |
| `lychee.yml` | PRs | On event |
| `codeql.yml` | PRs & main push | On event (with path filters) |
| `zap.yml` | Schedule | Nightly at 06:00 UTC |
| `security-headers-parity.yml` | PRs & main push | On event (with path filters) |
| `swift-dashboard-build.yml` | PRs & main push | On event (with path filters) |
| `dependabot-automerge.yml` | Dependabot PRs | On event |
| `restyled.yml` | Manual | On demand |

## Project Board Automation Details

### Issue Linking Formats

The automation suite detects issue references in PR titles and bodies:

- Simple reference: `#123`
- Closing keywords: `fixes #123`, `closes #123`, `resolves #123`
- Full URLs: `https://github.com/owner/repo/issues/123`

### Status Flow

```
New Issue → Backlog
         ↓
    PR Opened → In Progress
         ↓
  PR Ready for Review → In Review
         ↓
    PR Merged → In Review (GitHub automation → Done)
```

## Notes

- All workflows use `actions/github-script@v7` for consistency
- Workflows use proper concurrency groups to prevent conflicts
- Most workflows cache dependencies (npm, Playwright browsers) for speed
- Path filters prevent unnecessary runs when unrelated files change
- No external services or secrets required beyond GITHUB_TOKEN

