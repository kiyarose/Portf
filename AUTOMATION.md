# GitHub Automation Features

This repository now includes automated workflows to streamline issue and pull request management.

## Features

### 1. Label Synchronization

- **Issue to PR**: When a pull request references an issue (using `#105`, `fixes #105`, or GitHub issue URLs), all labels from the linked issues are automatically copied to the PR.
- **PR to Issue**: When labels are added or removed from an issue, those changes are automatically synced to any open PRs that reference that issue.

### 2. Project Board Management

- **Auto-assignment**: New issues are automatically added to the "Portfolio Devmt" project and placed in the "Backlog" status.
- **Status updates**: Issue statuses are automatically updated based on their relationship with pull requests:
  - Issues move to "In Progress" when a linked PR is opened (including draft PRs)
  - Issues move to "In Review" when the PR is ready for review (not draft) or when the PR is merged
  - GitHub's built-in automation handles moving issues to "Done" when linked PRs are closed/merged
  - The workflow handles multiple PRs linked to a single issue by updating status for each transition

### 3. Milestone Synchronization

- Milestones are automatically synced between linked issues and pull requests
- If an issue has a milestone but its linked PR doesn't, the milestone is copied to the PR
- If a PR has a milestone but its linked issue doesn't, the milestone is copied to the issue

## How Linking Works

The automation detects issue-PR relationships through:

1. **Issue references in PR title/body**:
   - `#105` (simple reference)
   - `fixes #105`, `closes #105`, `resolves #105` (closing keywords)
   - Full GitHub URLs to issues

2. **Keywords supported**:
   - `close`, `closes`, `closed`
   - `fix`, `fixes`, `fixed`
   - `resolve`, `resolves`, `resolved`

## Workflows

The automation is implemented through several GitHub Actions workflows:

- `sync-issue-labels.yml`: Handles bidirectional label synchronization
- `project-board-automation.yml`: **Main workflow** - Manages project board status updates using GitHub Projects v2 API
- `project-automation.yml`: Legacy workflow with placeholder implementations
- `github-projects-integration.yml`: Legacy workflow with partial GraphQL integration
- `automation-suite.yml`: Comprehensive workflow combining label and milestone features

## Setup Requirements

For full functionality, you need to:

1. **Create a "Portfolio Devmt" project** in your GitHub repository or user account
   - Go to your GitHub profile or repository
   - Click on "Projects" tab
   - Create a new project (Projects V2/beta)
   - Name it exactly "Portfolio Devmt"

2. **Set up project statuses** with these exact names:
   - "Backlog" (where new issues are placed)
   - "In Progress" (for issues with active PRs)
   - "In Review" (for issues with PRs ready for review or merged)
   - "Done" (managed by GitHub's built-in automation)

3. **Configure the Status field**:
   - In your project, ensure you have a "Status" field (single select)
   - Add the status options listed above

4. **Grant workflow permissions**:
   - The workflow uses `GITHUB_TOKEN` which has the necessary permissions by default
   - No additional PAT (Personal Access Token) is required
   - Ensure "Read and write permissions" are enabled in Settings > Actions > General > Workflow permissions

## How It Works

### New Issue Created
When a new issue is opened:
1. Workflow triggers on `issues: opened` event
2. Uses GraphQL to find the "Portfolio Devmt" project
3. Adds the issue to the project using `addProjectV2ItemById` mutation
4. Sets the issue status to "Backlog"

### Pull Request Opened
When a PR is opened that references an issue:
1. Workflow triggers on `pull_request: opened` event
2. Extracts linked issue numbers from PR title and body
3. Finds each linked issue in the project
4. Updates status to "In Progress"

### Pull Request Ready for Review
When a draft PR is marked as ready for review:
1. Workflow triggers on `pull_request: ready_for_review` event
2. Updates linked issues to "In Review" status

### Pull Request Merged
When a PR is merged:
1. Workflow triggers on `pull_request: closed` event
2. Checks if PR was merged (not just closed)
3. Updates linked issues to "In Review" status
4. GitHub's built-in project automation can then move them to "Done"

### Multiple PRs for One Issue
The workflow handles edge cases:
- If multiple PRs reference the same issue, each PR event updates the issue status
- The status reflects the most recent PR action
- Closed PRs without merging do not update issue status (to avoid moving issues backward)

## Benefits

- **Consistency**: Labels and milestones stay synchronized across related issues and PRs
- **Visibility**: Clear project board status reflects the actual development progress
- **Automation**: Reduces manual overhead in project management
- **Traceability**: Maintains clear relationships between issues and their implementing PRs

## Customization

The workflows can be customized by:

- Modifying the project name in `github-projects-integration.yml`
- Adjusting status names to match your project board setup
- Adding or removing label synchronization rules
- Customizing the issue detection patterns

## Troubleshooting

### General Issues
- Check the Actions tab in your repository to see workflow execution logs
- Ensure proper permissions are granted to GitHub Actions (Settings > Actions > General)
- Verify that issue references use the correct format
- For project board integration, you may need additional tokens or permissions

### Project Automation Specific
- **"Project not found" error**: Ensure your project is named exactly "Portfolio Devmt" (case-sensitive)
- **"Status field not found" error**: Verify your project has a "Status" field with single-select options
- **Issues not being added**: Check that the workflow has `repository-projects: write` permission
- **Status not updating**: Ensure your project has the exact status names: "Backlog", "In Progress", "In Review", "Done"
- **GraphQL errors**: Review the workflow logs for detailed error messages from the GitHub API
- **User vs Organization projects**: The workflow queries user projects - if using organization projects, modify the GraphQL query to use `organization(login: $owner)` instead of `user(login: $owner)`

### Testing the Workflow
1. Create a test issue
2. Check if it appears in your project's "Backlog" column
3. Create a PR with "Fixes #[issue-number]" in the description
4. Verify the issue moves to "In Progress"
5. Mark the PR as ready for review
6. Verify the issue moves to "In Review"
