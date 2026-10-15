/**
 * Validate a canonical source URL for JYC Now cards.
 *
 * This is a browser-navigation boundary, not a server-side fetch guard:
 * only explicit absolute HTTP(S) URLs are accepted, and embedded credentials
 * and control characters are rejected. Relative/protocol-relative paths are
 * deliberately rejected so a source card cannot silently point back into JYC.
 */
export function safeJycNowExternalUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    return url.href;
  } catch {
    return '';
  }
}
