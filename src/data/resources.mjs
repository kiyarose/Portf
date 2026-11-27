import resourceList from "./portfolio-resources.json" with { type: "json" };

export const PORTFOLIO_DATA_RESOURCES = Object.freeze([...resourceList]);

export function isPortfolioDataResource(value) {
  return PORTFOLIO_DATA_RESOURCES.includes(value);
}
