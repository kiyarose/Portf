/**
 * Type-only surface for the shared Pages Function handler.
 * Implementation lives in `functions/lib/edadminProxy.mjs`.
 */
export type EdadminEnv = {
  PF_ALLOW_NOEDIT?: string;
  PF_EDADMIN_TOKEN?: string;
  PF_DATA_BASE_URL?: string;
};

export {
  EDADMIN_API_PREFIX,
  EDADMIN_STAGE_HEADER,
  MAX_EDADMIN_BODY_BYTES,
  handleEdadminRequest,
  isEdadminEnabled,
  jsonErrorResponse,
  normalizeDataBaseUrl,
  parseEdadminResource,
  resolveAuthScheme,
  resolveUpstreamToken,
} from "../../functions/lib/edadminProxy.mjs";