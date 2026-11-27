import {
  EDADMIN_API_PREFIX,
  handleEdadminRequest
} from '../functions/lib/edadminProxy.mjs'

/**
 * Dev-only middleware mirroring Cloudflare Pages `functions/api/edadmin/[resource]`.
 * @type {import('vite').Connect.NextHandleFunction}
 */
export function edadminDevMiddleware (req, res, next) {
  if (!req.url?.startsWith(EDADMIN_API_PREFIX)) {
    next()
    return
  }

  if (process.env.PF_ALLOW_NOEDIT !== '1') {
    res.statusCode = 404
    res.end('Not Found')
    return
  }

  const remainder = req.url.slice(EDADMIN_API_PREFIX.length).split('?')[0]
  const resource = remainder.replace(/\/$/, '')

  const env = {
    PF_ALLOW_NOEDIT: process.env.PF_ALLOW_NOEDIT,
    PF_EDADMIN_TOKEN: process.env.PF_EDADMIN_TOKEN,
    PF_DATA_BASE_URL:
      process.env.PF_DATA_BASE_URL ?? process.env.VITE_REMOTE_DATA_URL
  }

  if (req.method !== 'PUT') {
    res.statusCode = 405
    res.setHeader('Allow', 'PUT')
    res.end('Method Not Allowed')
    return
  }

  const chunks = []
  let total = 0
  req.on('data', (chunk) => {
    total += chunk.length
    if (total > 2 * 1024 * 1024) {
      res.statusCode = 413
      res.end('Payload Too Large')
      req.destroy()
      return
    }
    chunks.push(chunk)
  })

  req.on('end', async () => {
    if (res.writableEnded) {
      return
    }

    const body = Buffer.concat(chunks).toString('utf8')
    const request = new Request(`http://localhost${req.url}`, {
      method: 'PUT',
      headers: {
        'content-type': req.headers['content-type'] ?? 'application/json'
      },
      body
    })

    try {
      const response = await handleEdadminRequest(request, resource, env)
      res.statusCode = response.status
      response.headers.forEach((value, key) => {
        res.setHeader(key, value)
      })
      const text = await response.text()
      res.end(text)
    } catch {
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  req.on('error', () => {
    if (!res.writableEnded) {
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
}
