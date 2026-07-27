// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
};

/**
 * Chỉ giữ path đang dùng trên menu + route chính.
 * Path legacy nằm ở src/pages/_legacy (không còn đăng ký route).
 */
export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  /** Alias đăng nhập xong → báo cáo tổng quan */
  overview: path(ROOTS_DASHBOARD, '/operations/reporting/executive'),
  integration: path(ROOTS_DASHBOARD, '/integration-management'),
  documents: path(ROOTS_DASHBOARD, '/document-management'),
  exchange: path(ROOTS_DASHBOARD, '/operations/document-exchange'),
  admin: {
    root: path(ROOTS_DASHBOARD, '/admin'),
    users: path(ROOTS_DASHBOARD, '/admin/users'),
    units: path(ROOTS_DASHBOARD, '/admin/units'),
    roles: path(ROOTS_DASHBOARD, '/admin/roles'),
    categories: path(ROOTS_DASHBOARD, '/admin/categories'),
  },
  reporting: {
    root: path(ROOTS_DASHBOARD, '/operations/reporting'),
    executive: path(ROOTS_DASHBOARD, '/operations/reporting/executive'),
    document: path(ROOTS_DASHBOARD, '/operations/reporting/document'),
    incoming: path(ROOTS_DASHBOARD, '/operations/reporting/incoming'),
    type: path(ROOTS_DASHBOARD, '/operations/reporting/type'),
    delivery: path(ROOTS_DASHBOARD, '/operations/reporting/delivery'),
    error: path(ROOTS_DASHBOARD, '/operations/reporting/error'),
    retry: path(ROOTS_DASHBOARD, '/operations/reporting/retry'),
    agency: path(ROOTS_DASHBOARD, '/operations/reporting/agency'),
    daily: path(ROOTS_DASHBOARD, '/operations/reporting/daily'),
    export: path(ROOTS_DASHBOARD, '/operations/reporting/export'),
  },
  /** Giữ tương thích cũ: operations.reporting / operations.exchange */
  operations: {
    root: path(ROOTS_DASHBOARD, '/operations'),
    exchange: path(ROOTS_DASHBOARD, '/operations/document-exchange'),
    reporting: {
      root: path(ROOTS_DASHBOARD, '/operations/reporting'),
      executive: path(ROOTS_DASHBOARD, '/operations/reporting/executive'),
      document: path(ROOTS_DASHBOARD, '/operations/reporting/document'),
      incoming: path(ROOTS_DASHBOARD, '/operations/reporting/incoming'),
      type: path(ROOTS_DASHBOARD, '/operations/reporting/type'),
      delivery: path(ROOTS_DASHBOARD, '/operations/reporting/delivery'),
      error: path(ROOTS_DASHBOARD, '/operations/reporting/error'),
      retry: path(ROOTS_DASHBOARD, '/operations/reporting/retry'),
      agency: path(ROOTS_DASHBOARD, '/operations/reporting/agency'),
      daily: path(ROOTS_DASHBOARD, '/operations/reporting/daily'),
      export: path(ROOTS_DASHBOARD, '/operations/reporting/export'),
    },
  },
};
