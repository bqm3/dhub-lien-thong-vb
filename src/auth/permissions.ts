export type PermissionCode = string;

export type PermissionCheckMode = 'any' | 'all';

export type DemoRole = 'ADMIN' | 'AGENCY';

export const PERMISSIONS = {
  ADMIN_MANAGE: 'ADMIN_MANAGE',
  DOC_MANAGE: 'DOC_MANAGE',
  WF_MANAGE: 'WF_MANAGE',
  EXCHANGE_MANAGE: 'EXCHANGE_MANAGE',
};

/** Chỉ 2 role: Admin hệ thống và Role đơn vị */
export const ROLE_PERMISSIONS: Record<DemoRole, PermissionCode[]> = {
  ADMIN: [
    PERMISSIONS.ADMIN_MANAGE,
    PERMISSIONS.DOC_MANAGE,
    PERMISSIONS.WF_MANAGE,
    PERMISSIONS.EXCHANGE_MANAGE,
  ],
  AGENCY: [PERMISSIONS.DOC_MANAGE, PERMISSIONS.EXCHANGE_MANAGE, PERMISSIONS.WF_MANAGE],
};

/** Chỉ map path đang ship trên menu / router chính */
export const PATH_PERMISSIONS: Record<string, PermissionCode[]> = {
  '/dashboard/admin': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/admin/users': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/admin/units': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/admin/roles': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/admin/categories': [PERMISSIONS.ADMIN_MANAGE],

  '/dashboard/document-management': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/integration-management': [PERMISSIONS.EXCHANGE_MANAGE],

  '/dashboard/operations': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/document-exchange': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/executive': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/document': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/incoming': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/type': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/delivery': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/error': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/retry': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/agency': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/daily': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/operations/reporting/export': [PERMISSIONS.EXCHANGE_MANAGE],
};

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
