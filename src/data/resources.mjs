/** Keep in sync with ./portfolio-resources.json */
const resourceList = [
  'Socials',
  'Experience',
  'Education',
  'Certifications',
  'Projects',
  'Skills'
]

export const PORTFOLIO_DATA_RESOURCES = Object.freeze([...resourceList])

export function isPortfolioDataResource (value) {
  return PORTFOLIO_DATA_RESOURCES.includes(value)
}
