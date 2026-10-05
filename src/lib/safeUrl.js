/**
 * Links and media addresses come from the CMS (an admin types them), so they
 * are only used when they are a same-site path or a plain http(s) address.
 * Anything else — javascript:, data:, vbscript:, protocol-relative "//host" —
 * returns '' so callers can leave the link out.
 */
export function safeUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')) return raw
  try {
    const { protocol } = new URL(raw)
    return protocol === 'http:' || protocol === 'https:' ? raw : ''
  } catch {
    return ''
  }
}
