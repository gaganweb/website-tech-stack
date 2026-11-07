/**
 * Normalize a free-form URL input into a valid absolute URL.
 *
 * Handles the common mistakes users make when typing URLs:
 * - missing protocol: "bbc.co.uk" → "https://bbc.co.uk"
 * - with scheme:     "https://bbc.co.uk"  (left untouched)
 * - with scheme:     "http://bbc.co.uk"   (left untouched)
 * - leading "www." or other host fragments: "www.bbc.co.uk" → "https://www.bbc.co.uk"
 *
 * Returns null for blank or syntactically invalid input so callers can surface
 * a 4xx error instead of falling through to malformed fetch requests.
 */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(candidate).toString();
  } catch {
    return null;
  }
}
