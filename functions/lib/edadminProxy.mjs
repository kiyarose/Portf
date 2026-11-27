import { isPortfolioDataResource } from '../../src/data/resources.mjs'

export const EDADMIN_API_PREFIX = '/api/edadmin/'
export const EDADMIN_STAGE_HEADER = 'X-Edadmin-Stage'

export const MAX_EDADMIN_BODY_BYTES = 2 * 1024 * 1024

/** @typedef {{
 *   PF_ALLOW_NOEDIT?: string;
 *   PF_EDADMIN_TOKEN?: string;
 *   PF_DATA_BASE_URL?: string;
 *   PF_EDADMIN_AUTH_SCHEME?: string;
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
 * @param {string | undefined} raw
 */
export function resolveUpstreamToken (raw) {
  let token = (raw ?? '').trim()
  if (/^bearer\s+/i.test(token)) {
    token = token.replace(/^bearer\s+/i, '').trim()
  }
  return token
}

/**
 * @param {string | undefined} scheme
 */
export function resolveAuthScheme (scheme) {
  const normalized = (scheme ?? 'Bearer').trim()
  return normalized.length > 0 ? normalized : 'Bearer'
}

/**
 * @param {EdadminEnv} env
 */
export function isEdadminEnabled (env) {
  return env.PF_ALLOW_NOEDIT === '1'
}

/**
 * @param {string} url
 */
function upstreamHostFromUrl (url) {
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

/**
 * @param {{
 *   error: string;
 *   status: number;
 *   stage: string;
 *   hint: string;
 *   resource?: string;
 *   upstreamHost?: string | null;
 *   upstreamStatus?: number;
 * }} payload
 */
export function jsonErrorResponse (payload) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    [EDADMIN_STAGE_HEADER]: payload.stage
  })
  return new Response(JSON.stringify(payload), {
    status: payload.status,
    headers
  })
}

/**
 * @param {EdadminEnv} env
 * @param {string} resource
 */
function resolveEdadminWriteConfig (env, resource) {
  const token = resolveUpstreamToken(env.PF_EDADMIN_TOKEN)
  if (!token) {
    return jsonErrorResponse({
      error: 'proxy_misconfigured',
      status: 503,
      stage: 'proxy',
      hint: 'PF_EDADMIN_TOKEN is missing on Functions (Production). Use the raw token value.',
      resource
    })
  }

  const baseUrl = normalizeDataBaseUrl(env.PF_DATA_BASE_URL)
  if (!baseUrl) {
    return jsonErrorResponse({
      error: 'proxy_misconfigured',
      status: 503,
      stage: 'proxy',
      hint: 'PF_DATA_BASE_URL is missing on Functions (e.g. https://data.example.com/data).',
      resource
    })
  }

  return { token, baseUrl }
}

/**
 * @param {Request} request
 * @param {string} resource
 */
async function readValidatedJsonBody (request, resource) {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10)
    if (Number.isFinite(length) && length > MAX_EDADMIN_BODY_BYTES) {
      return jsonErrorResponse({
        error: 'payload_too_large',
        status: 413,
        stage: 'proxy',
        hint: 'JSON body exceeds the size limit.',
        resource
      })
    }
  }

  const bodyText = await request.text()
  if (bodyText.length > MAX_EDADMIN_BODY_BYTES) {
    return jsonErrorResponse({
      error: 'payload_too_large',
      status: 413,
      stage: 'proxy',
      hint: 'JSON body exceeds the size limit.',
      resource
    })
  }

  try {
    JSON.parse(bodyText)
  } catch {
    return jsonErrorResponse({
      error: 'invalid_json',
      status: 400,
      stage: 'proxy',
      hint: 'Request body must be valid JSON.',
      resource
    })
  }

  return bodyText
}

/**
 * @param {import('./edadminProxy.mjs').EdadminEnv} env
 * @param {string} resource
 * @param {string} bodyText
 * @param {typeof fetch} fetchImpl
 */
async function forwardEdadminPut (env, resource, bodyText, fetchImpl) {
  const token = resolveUpstreamToken(env.PF_EDADMIN_TOKEN)
  const baseUrl = normalizeDataBaseUrl(env.PF_DATA_BASE_URL)
  const upstreamUrl = `${baseUrl}/${resource}.json`
  const upstreamHost = upstreamHostFromUrl(upstreamUrl)
  const authScheme = resolveAuthScheme(env.PF_EDADMIN_AUTH_SCHEME)

  let upstreamResponse
  try {
    upstreamResponse = await fetchImpl(upstreamUrl, {
      method: 'PUT',
      headers: {
        Authorization: `${authScheme} ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: bodyText
    })
  } catch {
    return jsonErrorResponse({
      error: 'upstream_unreachable',
      status: 502,
      stage: 'upstream',
      hint: 'Could not reach the data host. Check PF_DATA_BASE_URL and worker availability.',
      resource,
      upstreamHost
    })
  }

  if (upstreamResponse.ok) {
    const responseBody = await upstreamResponse.text()
    const headers = new Headers({
      [EDADMIN_STAGE_HEADER]: 'upstream'
    })
    const contentType = upstreamResponse.headers.get('content-type')
    if (contentType) {
      headers.set('content-type', contentType)
    } else {
      headers.set('content-type', 'application/json')
    }
    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers
    })
  }

  const upstreamStatus = upstreamResponse.status
  const isServerError = upstreamStatus >= 500

  return jsonErrorResponse({
    error: isServerError ? 'upstream_error' : 'upstream_rejected',
    status: upstreamStatus,
    stage: 'upstream',
    hint: isServerError
      ? 'The data host returned a server error.'
      : 'The data host rejected the write (check token, worker auth, and URL). If you use Cloudflare Access on /api/edadmin, verify it allows this route.',
    resource,
    upstreamHost,
    upstreamStatus
  })
}

/**
 * @param {Request} request
 * @param {string} resourceName
 * @param {EdadminEnv} env
 * @param {{ fetchImpl?: typeof fetch }} [options]
 */
export async function handleEdadminRequest (
  request,
  resourceName,
  env,
  options = {}
) {
  const fetchImpl = options.fetchImpl ?? fetch

  if (!isEdadminEnabled(env)) {
    return jsonErrorResponse({
      error: 'editor_disabled',
      status: 404,
      stage: 'proxy',
      hint: 'Set PF_ALLOW_NOEDIT=1 on Functions and rebuild the site with the flag for the UI.'
    })
  }

  if (request.method !== 'PUT') {
    return jsonErrorResponse({
      error: 'method_not_allowed',
      status: 405,
      stage: 'proxy',
      hint: 'Use PUT with a JSON body.'
    })
  }

  const resource = parseEdadminResource(resourceName)
  if (!resource) {
    return jsonErrorResponse({
      error: 'invalid_resource',
      status: 400,
      stage: 'proxy',
      hint: 'Resource name must match an allowlisted portfolio JSON file.',
      resource: resourceName
    })
  }

  const config = resolveEdadminWriteConfig(env, resource)
  if (config instanceof Response) {
    return config
  }

  const body = await readValidatedJsonBody(request, resource)
  if (body instanceof Response) {
    return body
  }

  return forwardEdadminPut(env, resource, body, fetchImpl)
}