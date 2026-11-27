/**
 * @file Reports how far the local fork is ahead/behind the upstream Portf repo.
 */
import { execFileSync } from 'node:child_process'
import {
  GIT_EXECUTABLE,
  ensureUpstreamRemote,
  loadUpstreamSyncManifest,
  repoRoot
} from './upstream-sync-lib.mjs'

const jsonMode = process.argv.includes('--json')
const statMode = process.argv.includes('--stat')
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

/**
 * @returns {number} shell exit code
 */
function main () {
  const manifest = loadUpstreamSyncManifest()
  const branch = branchArg ?? git('rev-parse', '--abbrev-ref', 'HEAD')
  const upstreamRef = `upstream/${manifest.upstream.defaultBranch}`

  if (!hasUpstreamRemote()) {
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
    if (setup === 'added') {
      const note = `Added git remote \`upstream\` → ${manifest.upstream.url}`
      if (jsonMode) {
        console.error(note)
      } else {
        console.log(note)
      }
    } else if (setup === 'updated') {
      const note = `Updated \`upstream\` remote URL → ${manifest.upstream.url}`
      if (jsonMode) {
        console.error(note)
      } else {
        console.log(note)
      }
    }
  }

  try {
    git('fetch', 'upstream', manifest.upstream.defaultBranch)
  } catch (error) {
    console.error('git fetch upstream failed:', error.message ?? error)
    return 1
  }

  const aheadOfUs = git(
    'rev-list',
    '--count',
    '--left-right',
    `${branch}...${upstreamRef}`
  )
    .split(/\s+/)
    .map(Number)
  // left = commits only on branch (first), right = commits only on upstream (second)
  const [forkAhead, upstreamAhead] = aheadOfUs.length >= 2 ? aheadOfUs : [0, 0]

  const upstreamOnly = git('log', '--oneline', `${branch}..${upstreamRef}`)
  const forkOnly = git('log', '--oneline', `${upstreamRef}..${branch}`)
  const lastRecorded = manifest.lastMergedUpstreamSha

  const result = {
    branch,
    upstreamRef,
    upstreamAhead,
    forkAhead,
    lastMergedUpstreamSha: lastRecorded,
    commitsOnUpstreamNotOnFork: upstreamOnly ? upstreamOnly.split('\n') : [],
    commitsOnForkNotOnUpstream: forkOnly ? forkOnly.split('\n') : []
  }

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`Branch: ${branch} vs ${upstreamRef}`)
    if (lastRecorded) {
      console.log(`Last recorded upstream merge: ${lastRecorded}`)
    }
    console.log(`Upstream commits not on ${branch}: ${upstreamAhead}`)
    if (upstreamOnly) {
      console.log(upstreamOnly)
    }
    console.log(`\nFork-only commits (not on upstream): ${forkAhead}`)
    if (forkOnly) {
      console.log(forkOnly)
    }
    if (statMode && upstreamAhead > 0) {
      console.log('\n--- diff stat (fork...upstream) ---\n')
      console.log(git('diff', '--stat', `${branch}...${upstreamRef}`))
    }
  }

  return upstreamAhead > 0 ? 1 : 0
}

try {
  process.exitCode = main()
} catch (error) {
  console.error(error.message ?? error)
  process.exitCode = 1
}
