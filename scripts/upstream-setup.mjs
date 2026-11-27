/**
 * @file One-time (per clone) upstream remote setup from upstream-sync.json.
 */
import { execFileSync } from 'node:child_process'
import {
  GIT_EXECUTABLE,
  ensureUpstreamRemote,
  loadUpstreamSyncManifest,
  repoRoot
} from './upstream-sync-lib.mjs'

function git (...args) {
  return execFileSync(GIT_EXECUTABLE, args, {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim()
}

function main () {
  const manifest = loadUpstreamSyncManifest()
  const setup = ensureUpstreamRemote(manifest)
  if (setup === 'added') {
    console.log(`Added git remote \`upstream\` → ${manifest.upstream.url}`)
  } else if (setup === 'updated') {
    console.log(`Updated \`upstream\` remote URL → ${manifest.upstream.url}`)
  } else {
    console.log(`Remote \`upstream\` already set → ${manifest.upstream.url}`)
  }

  try {
    git('fetch', 'upstream', manifest.upstream.defaultBranch)
    console.log(`Fetched upstream/${manifest.upstream.defaultBranch}`)
  } catch (error) {
    console.error('git fetch upstream failed:', error.message ?? error)
    return 1
  }

  try {
    const driver = git('config', '--get', 'merge.ours.driver')
    if (driver !== 'true') {
      console.log(
        'Tip: run `git config merge.ours.driver true` once so bespoke paths use merge=ours (see .github/UPSTREAM.md).'
      )
    }
  } catch {
    console.log(
      'Tip: run `git config merge.ours.driver true` once so bespoke paths use merge=ours (see .github/UPSTREAM.md).'
    )
  }

  return 0
}

process.exitCode = main()
