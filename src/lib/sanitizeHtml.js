import DOMPurify from 'dompurify'

// Links in CMS pages open safely whatever the author wrote.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    if (node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer')
  }
})

const OPTIONS = {
  ADD_ATTR: ['target'],
  // Content pages are text, images, tables and links — nothing that could draw
  // a fake login box or restyle the whole site.
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea', 'iframe', 'object', 'embed', 'link', 'meta'],
}

/** Cleans CMS-authored HTML so it can be rendered without running script. */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(String(html ?? ''), OPTIONS)
}
