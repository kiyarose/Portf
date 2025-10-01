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

For full functionality, you may need to:

1. Create a "Portfolio Devmt" project in your GitHub repository/organization
2. Set up appropriate project statuses: "Backlog", "In Progress", "In Review", "Done"
3. Consider creating a personal access token with project permissions for enhanced project integration

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

- Check the Actions tab in your repository to see workflow execution logs
- Ensure proper permissions are granted to GitHub Actions
- Verify that issue references use the correct format
- For project board integration, you may need additional tokens or permissions
