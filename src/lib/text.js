// Splits a heading string around a highlighted substring so a section can
// color one phrase differently per language (word order/length differ
// between English and Kannada, so the split has to happen per-render
// rather than being baked into fixed JSX).
export function splitHighlight(title, highlight) {
  if (!highlight) return [title, '', '']
  const index = title.indexOf(highlight)
  if (index === -1) return [title, '', '']
  return [title.slice(0, index), highlight, title.slice(index + highlight.length)]
}
