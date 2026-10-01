import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../redux/slices/authSlice'

// A backend that predates roles (no `permissions` on the profile) behaves as
// before: every logged-in user can open every ordinary page.
const hasRoleData = (user) => Array.isArray(user?.permissions)

export function isSuperAdminUser(user) {
  return Boolean(user?.isSuperAdmin)
}

export function userCan(user, key) {
  if (!user) return false
  if (user.isSuperAdmin) return true
  if (!hasRoleData(user)) return true
  return user.permissions.includes(key)
}

export function canAccessSection(user, section) {
  if (section.superAdminOnly) return isSuperAdminUser(user)
  return userCan(user, section.key)
}

export function roleLabel(user) {
  if (!user?.role) return ''
  return typeof user.role === 'string' ? user.role : user.role.name
}

export function useAccess() {
  const user = useSelector(selectCurrentUser)
  return {
    user,
    isSuperAdmin: isSuperAdminUser(user),
    can: (key) => userCan(user, key),
    canSection: (section) => canAccessSection(user, section),
  }
}

/** Sidebar/dashboard groups reduced to what this user may open (empty groups dropped). */
export function visibleGroups(groups, user) {
  return groups
    .map((group) => ({ ...group, items: group.items.filter((section) => canAccessSection(user, section)) }))
    .filter((group) => group.items.length > 0)
}
