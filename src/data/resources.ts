import resourceList from "./portfolio-resources.json";

/** Remote JSON resource names — keep in sync with scripts/sync-remote-data.mjs */
export const PORTFOLIO_DATA_RESOURCES = resourceList as readonly string[];

export type PortfolioDataResource = (typeof PORTFOLIO_DATA_RESOURCES)[number];

export function isPortfolioDataResource(
  value: string,
): value is PortfolioDataResource {
  return (PORTFOLIO_DATA_RESOURCES as readonly string[]).includes(value);
}
