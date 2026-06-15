import { ROLES, PERMISSIONS } from '@/config/roles';

// Returns the role config object, or null if the role key doesn't exist.
export function getRole(roleName) {
  return ROLES[roleName] ?? null;
}

// Returns true if the given role has the specified permission string.
export function hasPermission(roleName, permission) {
  const role = getRole(roleName);
  if (!role) return false;
  if (role.permissions.includes('*')) return true;
  return role.permissions.includes(permission);
}

// Returns true if actorRole can create or delete a user with targetRole.
// A role can only manage users whose level is strictly lower than its own.
export function canManageRole(actorRoleName, targetRoleName) {
  const actor = getRole(actorRoleName);
  const target = getRole(targetRoleName);
  if (!actor || !target) return false;
  return actor.level > target.level;
}

// Returns the role names the actor is allowed to assign to new users,
// sorted from lowest to highest level.
export function assignableRoles(actorRoleName) {
  const actor = getRole(actorRoleName);
  if (!actor) return [];
  return Object.entries(ROLES)
    .filter(([, role]) => role.level < actor.level)
    .sort((a, b) => a[1].level - b[1].level)
    .map(([name]) => name);
}

// Returns the full resolved permissions array for a role.
// '*' wildcard is expanded to all defined permission values.
export function getPermissions(roleName) {
  const role = getRole(roleName);
  if (!role) return [];
  if (role.permissions.includes('*')) return Object.values(PERMISSIONS);
  return [...role.permissions];
}
