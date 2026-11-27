import { isPortfolioDataResource } from '../../src/data/resources.mjs'

export const EDADMIN_API_PREFIX = '/api/edadmin/'

export const MAX_EDADMIN_BODY_BYTES = 2 * 1024 * 1024

/** @typedef {{
 *   PF_ALLOW_NOEDIT?: string;
 *   PF_EDADMIN_TOKEN?: string;
 *   PF_DATA_BASE_URL?: string;
 * }} EdadminEnv */

/**
 * @param {string | undefined} rawUrl
 */
export function normalizeDataBaseUrl (rawUrl) {
  const normalized = (rawUrl ?? '').trim().replace(/\/$/, '')
  return normalized.length > 0 ? normalized : null
}

/**
 * @param {string | undefined} resource
 */
export function parseEdadminResource (resource) {
  if (!resource || typeof resource !== 'string') {
    return null
  }
  const decoded = decodeURIComponent(resource).replace(/\.json$/i, '')
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(decoded)) {
    return null
  }
  if (!isPortfolioDataResource(decoded)) {
    return null
  }
  return decoded
}

/**
 * @param {EdadminEnv} env
 */
export function isEdadminEnabled (env) {
  return env.PF_ALLOW_NOEDIT === '1'
}

/**
 * @param {Request} request
 * @param {string} resourceName
 * @param {EdadminEnv} env
 */
export async function handleEdadminRequest (request, resourceName, env) {
  if (!isEdadminEnabled(env)) {
    return new Response('Not Found', { status: 404 })
  }

  if (request.method !== 'PUT') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'PUT' }
    })
  }

  const resource = parseEdadminResource(resourceName)
  if (!resource) {
    return new Response('Bad Request', { status: 400 })
  }

  const token = (env.PF_EDADMIN_TOKEN ?? '').trim()
  if (!token) {
    return new Response('Service Unavailable', { status: 503 })
  }

  const baseUrl = normalizeDataBaseUrl(env.PF_DATA_BASE_URL)
  if (!baseUrl) {
    return new Response('Service Unavailable', { status: 503 })
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10)
    if (Number.isFinite(length) && length > MAX_EDADMIN_BODY_BYTES) {
      return new Response('Payload Too Large', { status: 413 })
    }
  }

  const bodyText = await request.text()
  if (bodyText.length > MAX_EDADMIN_BODY_BYTES) {
    return new Response('Payload Too Large', { status: 413 })
  }

  try {
    JSON.parse(bodyText)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const upstreamUrl = `${baseUrl}/${resource}.json`
  let upstreamResponse
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: bodyText
    })
  } catch {
    return new Response('Upstream Error', { status: 502 })
  }

  const responseBody = await upstreamResponse.text()
  const headers = new Headers()
  const contentType = upstreamResponse.headers.get('content-type')
  if (contentType) {
    headers.set('content-type', contentType)
  } else {
    headers.set('content-type', 'application/json')
  }

  if (upstreamResponse.ok) {
    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers
    })
  }

  return new Response(
    upstreamResponse.status >= 500 ? 'Upstream Error' : 'Upstream Rejected',
    { status: upstreamResponse.status, headers }
  )
}
