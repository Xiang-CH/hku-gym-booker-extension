// HTML parsing utilities

/**
 * Parse HTML to find availability information for a specific link
 * @param {string} htmlString - The HTML content to parse
 * @param {string} href - The href/link to search for
 * @returns {string} - Availability string (e.g. "1/24") or empty string if not found
 */
export function matchHtml(htmlString, href) {
  const escapedHref = href.replaceAll("/", "\\/").replaceAll("?", "\\?").replaceAll("&", "&amp;");
  const pattern = new RegExp(
    `<(?:a|div) class="text-default" href="${escapedHref}">[\\s\\S]*?<div class="row py-2 list-hover">[\\s\\S]*?<div class="col text-center">(.*?)<\\/div>[\\s\\S]*?<div class="col text-center">(.*?)<\\/div>[\\s\\S]*?<\\/div>[\\s\\S]*?<\\/(?:a|div)>`,
    'gm'
  );
  const matches = pattern.exec(htmlString);
  return matches ? matches[2] : "";
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    matchHtml
  };
} 