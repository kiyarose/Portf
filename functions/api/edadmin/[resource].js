import { handleEdadminRequest } from '../../lib/edadminProxy.mjs'

/** @type {import('@cloudflare/workers-types').PagesFunction} */
export async function onRequest (context) {
  const resource = context.params.resource
  return handleEdadminRequest(context.request, resource, context.env)
}
