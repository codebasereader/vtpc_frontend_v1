// A harmless "this browser logged in to the admin" marker (no token, nothing sensitive).
// The session cookie is HttpOnly, so the page cannot see it; without a marker the app would
// have to ask the server "who is logged in?" on every admin page load, and get a 401 each time
// for anyone who is simply looking at the login page.
const KEY = 'vtpc_admin_hint'

export function hasSessionHint() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setSessionHint(on) {
  try {
    if (on) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    // storage unavailable — the login page then just skips the early session check
  }
}
