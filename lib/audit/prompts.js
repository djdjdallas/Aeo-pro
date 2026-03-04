// lib/audit/prompts.js
// Template-based prompt generator for audit multi-prompt AI checks (no LLM call)

/**
 * Generates 6 audit prompts based on business context.
 * @param {string} businessName - The business name
 * @param {string} businessType - The business type/category (optional)
 * @param {string} location - The business location (optional)
 * @returns {string[]} Array of 6 prompt strings
 */
export function generateAuditPrompts(businessName, businessType, location) {
  const name = businessName?.trim() || "";
  const type = businessType?.trim().toLowerCase() || "";
  const loc = location?.trim() || "";

  // Location + type: local-intent prompts
  if (loc && type) {
    return [
      `best ${type} in ${loc}`,
      `who do you recommend for ${type} near ${loc}`,
      `top rated ${type} in ${loc} area`,
      `I need a ${type} in ${loc}, who should I call?`,
      `${type} ${loc} reviews and recommendations`,
      name ? `is ${name} a good ${type} in ${loc}` : `most trusted ${type} in ${loc}`,
    ];
  }

  // Type only: capability prompts
  if (type) {
    return [
      `best ${type} services`,
      `top ${type} companies to hire`,
      `who do you recommend for ${type}`,
      `most trusted ${type} providers`,
      name ? `is ${name} good for ${type}` : `best ${type} in ${new Date().getFullYear()}`,
      `${type} recommendations and reviews`,
    ];
  }

  // Name only: direct queries
  if (name) {
    return [
      `tell me about ${name}`,
      `is ${name} any good`,
      `${name} reviews and reputation`,
      `what does ${name} do`,
      `would you recommend ${name}`,
      `${name} compared to competitors`,
    ];
  }

  // Fallback (should not happen)
  return [
    "best local business recommendations",
    "top rated service providers",
    "business recommendations near me",
    "who do you recommend for home services",
    "best companies to hire",
    "trusted service providers",
  ];
}
