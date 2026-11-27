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
export function globMatch (pattern, filePath) {
  const normalized = filePath.replace(/\\/g, '/')
  const reSource = pattern
    .replace(/\\/g, '/')
    .replace(/\./g, '\\.')
    .replace(/\*\*\//g, '(?:.*/)?')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
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
