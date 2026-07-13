export type PermissionCode = string;

export type PermissionCheckMode = 'any' | 'all';

export function normalizePermissions(perms: PermissionCode[] | undefined | null): Set<PermissionCode> {
  return new Set((perms ?? []).filter(Boolean));
}

export function hasPermissions(args: {
  userPermissions: PermissionCode[] | undefined | null;
  required?: PermissionCode[] | undefined | null;
  mode?: PermissionCheckMode;
}): boolean {
  const { userPermissions, required, mode = 'any' } = args;
  const requiredList = (required ?? []).filter(Boolean);
  if (requiredList.length === 0) return true;

  const userSet = normalizePermissions(userPermissions);
  if (mode === 'all') return requiredList.every((p) => userSet.has(p));
  return requiredList.some((p) => userSet.has(p));
}

