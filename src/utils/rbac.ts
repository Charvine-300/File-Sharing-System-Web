export const USER_TYPES = {
  SUPER_ADMIN: "SuperAdmin",
  REGULAR_USER: "RegularUser",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// Mirrors the [SuperAdmin] attribute placement on UsersController/AttributesController.
// Editing one's own basic info (firstName/lastName/email) is deliberately left out of
// this map: it's a self-service action on the Edit Profile page, not something the
// admin Users table exposes for other people's accounts — SuperAdmin's write access
// to another user is scoped to attributes only.
export const PERMISSIONS = {
  "users.view": [USER_TYPES.SUPER_ADMIN],
  "users.create": [USER_TYPES.SUPER_ADMIN],
  "users.updateAttributes": [USER_TYPES.SUPER_ADMIN],
  "users.updateStatus": [USER_TYPES.SUPER_ADMIN],
  "users.delete": [USER_TYPES.SUPER_ADMIN],
  "attributes.view": [USER_TYPES.SUPER_ADMIN],
  "attributes.manage": [USER_TYPES.SUPER_ADMIN],
  "files.view": [USER_TYPES.SUPER_ADMIN, USER_TYPES.REGULAR_USER],
} as const satisfies Record<string, readonly UserType[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(
  userType: string | null | undefined,
  permission: Permission
): boolean {
  if (!userType) return false;
  const allowedRoles: readonly string[] = PERMISSIONS[permission];
  return allowedRoles.includes(userType);
}

export function isSuperAdmin(userType: string | null | undefined): boolean {
  return userType === USER_TYPES.SUPER_ADMIN;
}
