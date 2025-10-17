# Project Board Automation Workflow

This workflow automates issue and pull request management in the "Portfolio Devmt" GitHub project.

## Quick Reference

### Triggers

| Event | Action | Result |
|-------|--------|--------|
| New Issue Created | `issues: opened` | ✅ Added to "Backlog" |
| PR Opened (links issue) | `pull_request: opened` | ✅ Linked issues → "In Progress" |
| PR Converted to Draft | `pull_request: converted_to_draft` | ✅ Linked issues → "In Progress" |
| PR Ready for Review | `pull_request: ready_for_review` | ✅ Linked issues → "In Review" |
| PR Merged | `pull_request: closed` (merged=true) | ✅ Linked issues → "In Review" |
| PR Closed (not merged) | `pull_request: closed` (merged=false) | ⏭️ No status change |

### Issue Linking Formats

The workflow detects issue references in PR titles and bodies:

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

### Implementation Details

**Technology**: GitHub Actions + GraphQL API (Projects V2)

**Key Features**:
- ✅ Handles multiple PRs linked to a single issue
- ✅ Extracts issue numbers using regex pattern matching
- ✅ Uses GitHub Projects V2 GraphQL API
- ✅ Comprehensive error handling and logging
- ✅ No external dependencies or PAT required

**Permissions Required**:
- `issues: write`
- `pull-requests: write`
- `contents: read`

### Testing

To test the workflow:

1. Create a test issue (should appear in Backlog)
2. Create a PR with "Fixes #[issue-number]" in description
3. Check issue moved to "In Progress"
4. Mark PR as ready for review
5. Check issue moved to "In Review"

### Related Files

- **Workflow**: `.github/workflows/automation/project-board-automation.yml`
- **Documentation**: `AUTOMATION.md`
- **Project**: Create at `https://github.com/[username]?tab=projects`

## Architecture

### Job 1: `add-issue-to-backlog`

1. Triggers on `issues: opened`
2. Queries user projects to find "Portfolio Devmt"
3. Adds issue using `addProjectV2ItemById` mutation
4. Sets status to "Backlog" using `updateProjectV2ItemFieldValue`

### Job 2: `manage-pr-status`

1. Triggers on PR events (opened, closed, ready_for_review, converted_to_draft)
2. Extracts linked issue numbers from PR text
3. Determines target status based on PR state
4. Queries project to find issue items
5. Updates status for each linked issue

## Customization

To modify the workflow for your needs:

1. **Change project name**: Update `PROJECT_NAME` environment variable
2. **Change status names**: Update the status name strings in the workflow
3. **Add organization support**: Replace `user(login: $owner)` with `organization(login: $owner)` in GraphQL queries
4. **Modify status transitions**: Edit the logic in the `manage-pr-status` job

## Maintenance

The workflow is self-contained and requires minimal maintenance:

- ✅ No external services or APIs
- ✅ No secrets or PAT required (uses GITHUB_TOKEN)
- ✅ Comprehensive logging for debugging
- ✅ Graceful error handling

---

For detailed setup instructions, see [AUTOMATION.md](../../AUTOMATION.md)
