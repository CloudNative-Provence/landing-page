/**
 * Slugify a string into a URL-safe identifier.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract "HH:MM" from an ISO-8601 datetime string, preserving the original local time.
 * e.g. "2026-12-10T09:00:00+01:00" → "09:00"
 * @param {string} isoString
 * @returns {string}
 */
export function extractLocalTime(isoString) {
  const match = isoString.match(/T(\d{2}):(\d{2})/);
  if (!match) {
    throw new Error(`Cannot extract time from ISO string: ${isoString}`);
  }
  return `${match[1]}:${match[2]}`;
}
