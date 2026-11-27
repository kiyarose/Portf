/**
 * @file Pull only allowlisted “code” paths from upstream (no full merge).
 */
import { execFileSync } from 'node:child_process'
import {
  GIT_EXECUTABLE,
  ensureUpstreamRemote,
  loadUpstreamSyncManifest,
  repoRoot,
  shouldTakeFromUpstream
} from './upstream-sync-lib.mjs'

const apply = process.argv.includes('--apply')
const jsonMode = process.argv.includes('--json')
const skipRemoteSetup = process.argv.includes('--skip-remote-setup')
const sinceArg = process.argv.find((a) => a.startsWith('--since='))?.slice(8)
const branchArg = process.argv.find((a) => a.startsWith('--branch='))?.slice(9)

function git (...args) {
  return execFileSync(GIT_EXECUTABLE, args, {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim()
}

function hasUpstreamRemote () {
  try {
    return git('remote').split('\n').includes('upstream')
  } catch {
    return false
  }
}

/**
 * @returns {number}
 */
function main () {
  const manifest = loadUpstreamSyncManifest()
  const branch = branchArg ?? git('rev-parse', '--abbrev-ref', 'HEAD')
  const upstreamRef = `upstream/${manifest.upstream.defaultBranch}`

  if (!hasUpstreamRemote()) {
    if (skipRemoteSetup) {
      console.error(
        'No upstream remote. Run npm run upstream:setup or node scripts/upstream-setup.mjs'
      )
      return 2
    }
    ensureUpstreamRemote(manifest)
  }

  try {
    git('fetch', 'upstream', manifest.upstream.defaultBranch)
  } catch (error) {
    console.error('git fetch upstream failed:', error.message ?? error)
    return 1
  }

  const since =
    sinceArg ?? manifest.lastMergedUpstreamSha ?? git('merge-base', branch, upstreamRef)

  if (!since) {
    console.error('Could not determine --since (pass --since=<sha> or set lastMergedUpstreamSha).')
    return 1
  }

  const changed = git('diff', '--name-only', `${since}..${upstreamRef}`)
    .split('\n')
    .filter(Boolean)

  const codePaths = changed.filter((p) => shouldTakeFromUpstream(p, manifest))
  const skipped = changed.filter((p) => !shouldTakeFromUpstream(p, manifest))

  const payload = {
    branch,
    upstreamRef,
    since,
    apply,
    wouldImport: codePaths,
    skippedCount: skipped.length,
    importCount: codePaths.length
  }

  if (jsonMode) {
    console.log(JSON.stringify(payload, null, 2))
  } else {
    console.log(`Since: ${since}`)
    console.log(`Upstream template paths changed: ${changed.length}`)
    console.log(`Code paths to import (allowlist): ${codePaths.length}`)
    if (codePaths.length > 0) {
      console.log('\n--- would take from upstream ---\n')
      console.log(codePaths.join('\n'))
    }
    console.log(
      `\nSkipped ${skipped.length} path(s) (bespoke, URLs, submodules, or not on allowlist).`
    )
    console.log(
      apply
        ? '\nApplying: git checkout upstream/main -- <paths> …'
        : '\nDry run. Re-run with --apply to copy these files from upstream.'
    )
  }

  if (!apply || codePaths.length === 0) {
    return 0
  }

  for (const filePath of codePaths) {
    git('checkout', upstreamRef, '--', filePath)
  }
  git('add', '--', ...codePaths)
  console.log(`Staged ${codePaths.length} file(s) from ${upstreamRef}. Review and commit.`)
  return 0
}

try {
  process.exitCode = main()
} catch (error) {
  console.error(error.message ?? error)
  process.exitCode = 1
}