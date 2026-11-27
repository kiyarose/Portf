/**
 * @file Shared helpers for kiyarose upstream sync CLI scripts.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

export function loadUpstreamSyncManifest () {
  const manifestPath = path.join(repoRoot, '.github', 'upstream-sync.json')
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

/**
 * Minimal glob matcher for paths (supports * and **).
 * @param {string} pattern
 * @param {string} filePath
 */
function escapeRegexLiteral (segment) {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const GIT_EXECUTABLE = process.env.GIT_EXECUTABLE ?? 'git'

/**
 * @param {...string} args
 */
export function gitAtRepo (...args) {
  return execFileSync(GIT_EXECUTABLE, args, {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim()
}

function normalizeGitRemoteUrl (url) {
  return url
    .replace(/\.git$/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\/$/, '')
    .toLowerCase()
}

/**
 * Ensure the local clone has `upstream` pointing at the manifest URL (per-clone setup).
 * @param {{ upstream: { url: string } }} manifest
 * @returns {'added' | 'updated' | 'ok'}
 */
export function ensureUpstreamRemote (manifest) {
  const url = manifest.upstream.url
  const remotes = gitAtRepo('remote').split('\n').filter(Boolean)
  if (!remotes.includes('upstream')) {
    gitAtRepo('remote', 'add', 'upstream', url)
    return 'added'
  }
  const current = gitAtRepo('remote', 'get-url', 'upstream')
  if (normalizeGitRemoteUrl(current) !== normalizeGitRemoteUrl(url)) {
    gitAtRepo('remote', 'set-url', 'upstream', url)
    return 'updated'
  }
  return 'ok'
}

export function globMatch (pattern, filePath) {
  const normalized = filePath.replaceAll('\\', '/')
  const normalizedPattern = pattern.replaceAll('\\', '/')
  const reSource = normalizedPattern
    .split('**/')
    .map((part) =>
      part
        .split('**')
        .map((chunk) => escapeRegexLiteral(chunk).replaceAll('\\*', '[^/]*'))
        .join('.*')
    )
    .join('(?:.*/)?')
  return new RegExp(`^${reSource}$`).test(normalized)
}

/**
 * @param {string} filePath
 * @param {string[]} patterns
 */
export function matchesKeepOurs (filePath, patterns) {
  return patterns.some((pattern) => globMatch(pattern, filePath))
}

export { repoRoot }
