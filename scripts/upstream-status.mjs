#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { loadUpstreamSyncManifest, repoRoot } from './upstream-sync-lib.mjs'

const jsonMode = process.argv.includes('--json')
const statMode = process.argv.includes('--stat')
const branchArg = process.argv.find((a) => a.startsWith('--branch='))?.slice(9)

function git (...args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()
}

function hasUpstreamRemote () {
  try {
    const remotes = git('remote')
    return remotes.split('\n').includes('upstream')
  } catch {
    return false
  }
}

function main () {
  const manifest = loadUpstreamSyncManifest()
  const branch = branchArg ?? git('rev-parse', '--abbrev-ref', 'HEAD')
  const upstreamRef = `upstream/${manifest.upstream.defaultBranch}`

  if (!hasUpstreamRemote()) {
    const message =
      'No `upstream` remote. Run: git remote add upstream ' +
      manifest.upstream.url
    if (jsonMode) {
      console.log(
        JSON.stringify({ error: message, upstreamAhead: null }, null, 2)
      )
    } else {
      console.error(message)
    }
    process.exit(2)
  }

  try {
    git('fetch', 'upstream', manifest.upstream.defaultBranch)
  } catch (error) {
    console.error('git fetch upstream failed:', error.message ?? error)
    process.exit(1)
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

  if (upstreamAhead > 0) {
    process.exit(1)
  }
}

main()
