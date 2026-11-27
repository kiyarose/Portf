/**
 * @file Reports how far the local fork is ahead/behind the upstream Portf repo.
 */
import { execFileSync } from 'node:child_process'
import {
  GIT_EXECUTABLE,
  ensureUpstreamRemote,
  isHiddenFromUpstreamDiff,
  loadUpstreamSyncManifest,
  repoRoot,
  shouldTakeFromUpstream
} from './upstream-sync-lib.mjs'

const jsonMode = process.argv.includes('--json')
const statMode = process.argv.includes('--stat')
const codeOnly = process.argv.includes('--code-only')
const skipRemoteSetup = process.argv.includes('--skip-remote-setup')
const branchArg = process.argv.find((a) => a.startsWith('--branch='))?.slice(9)

function git (...args) {
  return execFileSync(GIT_EXECUTABLE, args, {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim()
}

function hasUpstreamRemote () {
  try {
    const remotes = git('remote')
    return remotes.split('\n').includes('upstream')
  } catch {
    return false
  }
}

function logRemoteSetupNote (setup, url) {
  const templates = {
    added: `Added git remote \`upstream\` → ${url}`,
    updated: `Updated \`upstream\` remote URL → ${url}`
  }
  const note = templates[setup]
  if (!note) return
  if (jsonMode) {
    console.error(note)
  } else {
    console.log(note)
  }
}

/**
 * @param {object} manifest
 * @returns {number | null} exit code when setup failed, or null to continue
 */
function ensureUpstreamReady (manifest) {
  if (hasUpstreamRemote()) return null

  if (skipRemoteSetup) {
    const message =
      'No `upstream` remote. Run: npm run upstream:setup (or: git remote add upstream ' +
      manifest.upstream.url +
      ')'
    if (jsonMode) {
      console.log(
        JSON.stringify({ error: message, upstreamAhead: null }, null, 2)
      )
    } else {
      console.error(message)
    }
    return 2
  }

  const setup = ensureUpstreamRemote(manifest)
  logRemoteSetupNote(setup, manifest.upstream.url)
  return null
}

/**
 * @param {object} manifest
 * @returns {number | null}
 */
function fetchUpstreamBranch (manifest) {
  try {
    git('fetch', 'upstream', manifest.upstream.defaultBranch)
    return null
  } catch (error) {
    console.error('git fetch upstream failed:', error.message ?? error)
    return 1
  }
}

function countAheadBehind (branch, upstreamRef) {
  const aheadOfUs = git(
    'rev-list',
    '--count',
    '--left-right',
    `${branch}...${upstreamRef}`
  )
    .split(/\s+/)
    .map(Number)
  const [forkAhead, upstreamAhead] = aheadOfUs.length >= 2 ? aheadOfUs : [0, 0]
  return { forkAhead, upstreamAhead }
}

function buildStatusResult (branch, upstreamRef, manifest, forkAhead, upstreamAhead) {
  const upstreamOnly = git('log', '--oneline', `${branch}..${upstreamRef}`)
  const forkOnly = git('log', '--oneline', `${upstreamRef}..${branch}`)
  return {
    branch,
    upstreamRef,
    upstreamAhead,
    forkAhead,
    lastMergedUpstreamSha: manifest.lastMergedUpstreamSha,
    commitsOnUpstreamNotOnFork: upstreamOnly ? upstreamOnly.split('\n') : [],
    commitsOnForkNotOnUpstream: forkOnly ? forkOnly.split('\n') : []
  }
}

function filterDiffPaths (allFiles, manifest) {
  const visible = codeOnly
    ? allFiles.filter((p) => shouldTakeFromUpstream(p, manifest))
    : allFiles.filter((p) => !isHiddenFromUpstreamDiff(p, manifest))
  return { visible, hiddenCount: allFiles.length - visible.length }
}

function printFilteredDiff (branch, upstreamRef, manifest, upstreamAhead) {
  if (!(statMode || codeOnly) || upstreamAhead <= 0) return

  const allFiles = git('diff', '--name-only', `${branch}...${upstreamRef}`)
    .split('\n')
    .filter(Boolean)
  const { visible, hiddenCount } = filterDiffPaths(allFiles, manifest)

  const heading = codeOnly
    ? `--- code-only paths (${visible.length} of ${allFiles.length} files; bespoke/URL/submodule paths hidden) ---`
    : `--- diff file list (${visible.length} of ${allFiles.length}; ${hiddenCount} hidden by keepOurs/hideFromDiff) ---`

  console.log(`\n${heading}\n`)
  if (visible.length > 0) {
    console.log(visible.join('\n'))
  }
  if (statMode && visible.length > 0) {
    console.log('\n--- diff stat (filtered) ---\n')
    console.log(
      git('diff', '--stat', `${branch}...${upstreamRef}`, '--', ...visible)
    )
  }
}

function printHumanStatus (result, manifest, branch) {
  const { upstreamRef, upstreamAhead, forkAhead, lastMergedUpstreamSha } =
    result
  console.log(`Branch: ${branch} vs ${upstreamRef}`)
  if (lastMergedUpstreamSha) {
    console.log(`Last recorded upstream merge: ${lastMergedUpstreamSha}`)
  }
  console.log(`Upstream commits not on ${branch}: ${upstreamAhead}`)
  if (result.commitsOnUpstreamNotOnFork.length > 0) {
    console.log(result.commitsOnUpstreamNotOnFork.join('\n'))
  }
  console.log(`\nFork-only commits (not on upstream): ${forkAhead}`)
  if (result.commitsOnForkNotOnUpstream.length > 0) {
    console.log(result.commitsOnForkNotOnUpstream.join('\n'))
  }
  printFilteredDiff(branch, upstreamRef, manifest, upstreamAhead)
}

/**
 * @returns {number} shell exit code
 */
function main () {
  const manifest = loadUpstreamSyncManifest()
  const branch = branchArg ?? git('rev-parse', '--abbrev-ref', 'HEAD')
  const upstreamRef = `upstream/${manifest.upstream.defaultBranch}`

  const setupExit = ensureUpstreamReady(manifest)
  if (setupExit !== null) return setupExit

  const fetchExit = fetchUpstreamBranch(manifest)
  if (fetchExit !== null) return fetchExit

  const { forkAhead, upstreamAhead } = countAheadBehind(branch, upstreamRef)
  const result = buildStatusResult(
    branch,
    upstreamRef,
    manifest,
    forkAhead,
    upstreamAhead
  )

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    printHumanStatus(result, manifest, branch)
  }

  return upstreamAhead > 0 ? 1 : 0
}

try {
  process.exitCode = main()
} catch (error) {
  console.error(error.message ?? error)
  process.exitCode = 1
}