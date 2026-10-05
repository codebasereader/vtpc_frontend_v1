// Password rules (mirrors the backend): ≥ 10 characters, a letter and a number.
export const PASSWORD_RULES = ['At least 10 characters', 'Contains a letter', 'Contains a number']

/** Returns the rules the password does NOT satisfy yet (empty = valid). */
export function passwordProblems(password) {
  const problems = []
  if (password.length < 10) problems.push(PASSWORD_RULES[0])
  if (!/[A-Za-z]/.test(password)) problems.push(PASSWORD_RULES[1])
  if (!/\d/.test(password)) problems.push(PASSWORD_RULES[2])
  return problems
}

/** A readable random password that satisfies the rules (no look-alike characters). */
export function generatePassword(length = 12) {
  const letters = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '23456789'
  const symbols = '@#$%&*'
  const all = letters + digits + symbols
  const pick = (chars) => {
    const buffer = new Uint32Array(1)
    crypto.getRandomValues(buffer)
    return chars[buffer[0] % chars.length]
  }
  const chars = [pick(letters), pick(digits), pick(symbols)]
  while (chars.length < length) chars.push(pick(all))
  // Fisher–Yates shuffle so the guaranteed characters aren't always first.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const buffer = new Uint32Array(1)
    crypto.getRandomValues(buffer)
    const j = buffer[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
