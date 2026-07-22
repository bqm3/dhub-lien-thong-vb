export type PermissionCode = string;

export type PermissionCheckMode = 'any' | 'all';

export const PERMISSIONS = {
  ADMIN_MANAGE: 'ADMIN_MANAGE',
  DOC_MANAGE: 'DOC_MANAGE',
  WF_MANAGE: 'WF_MANAGE',
  EXCHANGE_MANAGE: 'EXCHANGE_MANAGE',
};

export const ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  ADMIN: [
    PERMISSIONS.ADMIN_MANAGE,
    PERMISSIONS.DOC_MANAGE,
    PERMISSIONS.WF_MANAGE,
    PERMISSIONS.EXCHANGE_MANAGE,
  ],
  CLERK: [
    PERMISSIONS.DOC_MANAGE,
    PERMISSIONS.EXCHANGE_MANAGE,
  ],
  LEADER: [
    PERMISSIONS.WF_MANAGE,
    PERMISSIONS.EXCHANGE_MANAGE,
  ],
  MANAGER: [
    PERMISSIONS.WF_MANAGE,
    PERMISSIONS.EXCHANGE_MANAGE,
  ],
};

export const PATH_PERMISSIONS: Record<string, PermissionCode[]> = {
  '/dashboard/admin': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/documents': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/workflow': [PERMISSIONS.WF_MANAGE],
  '/dashboard/signature': [PERMISSIONS.WF_MANAGE],
  '/dashboard/interop': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/storage': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/operations': [PERMISSIONS.EXCHANGE_MANAGE],

  '/dashboard/admin/users': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/admin/units': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/admin/roles': [PERMISSIONS.ADMIN_MANAGE],
  '/dashboard/admin/categories': [PERMISSIONS.ADMIN_MANAGE],

  '/dashboard/documents/outgoing': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/documents/incoming': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/documents/internal': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/documents/dossiers': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/documents/attachments': [PERMISSIONS.DOC_MANAGE],

  '/dashboard/workflow/internal': [PERMISSIONS.WF_MANAGE],
  '/dashboard/workflow/submit': [PERMISSIONS.WF_MANAGE],
  '/dashboard/workflow/approve': [PERMISSIONS.WF_MANAGE],
  '/dashboard/workflow/assign': [PERMISSIONS.WF_MANAGE],
  '/dashboard/workflow/tracking': [PERMISSIONS.WF_MANAGE],

  '/dashboard/signature/studio': [PERMISSIONS.WF_MANAGE],
  '/dashboard/signature/personal': [PERMISSIONS.WF_MANAGE],
  '/dashboard/signature/org': [PERMISSIONS.WF_MANAGE],
  '/dashboard/signature/history': [PERMISSIONS.WF_MANAGE],
  '/dashboard/signature/verify': [PERMISSIONS.WF_MANAGE],

  '/dashboard/interop/send': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/interop/receive': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/interop/acknowledgement': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/interop/sync': [PERMISSIONS.EXCHANGE_MANAGE],
  '/dashboard/interop/retry': [PERMISSIONS.EXCHANGE_MANAGE],

  '/dashboard/storage/files': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/storage/versions': [PERMISSIONS.DOC_MANAGE],
  '/dashboard/storage/preview': [PERMISSIONS.DOC_MANAGE],

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
  '/dashboard/operations/sample-api': [PERMISSIONS.ADMIN_MANAGE],
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
