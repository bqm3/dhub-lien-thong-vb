// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  overview: path(ROOTS_DASHBOARD, '/operations/reporting/executive'),
  integration: path(ROOTS_DASHBOARD, '/integration-management'),
  documents: path(ROOTS_DASHBOARD, '/document-management'),
  admin: {
    root: path(ROOTS_DASHBOARD, '/admin'),
    users: path(ROOTS_DASHBOARD, '/admin/users'),
    units: path(ROOTS_DASHBOARD, '/admin/units'),
    roles: path(ROOTS_DASHBOARD, '/admin/roles'),
    categories: path(ROOTS_DASHBOARD, '/admin/categories'),
  },
  docMgmt: {
    root: path(ROOTS_DASHBOARD, '/documents'),
    outgoing: path(ROOTS_DASHBOARD, '/documents/outgoing'),
    incoming: path(ROOTS_DASHBOARD, '/documents/incoming'),
    internal: path(ROOTS_DASHBOARD, '/documents/internal'),
    dossiers: path(ROOTS_DASHBOARD, '/documents/dossiers'),
    attachments: path(ROOTS_DASHBOARD, '/documents/attachments'),
  },
  workflow: {
    root: path(ROOTS_DASHBOARD, '/workflow'),
    internal: path(ROOTS_DASHBOARD, '/workflow/internal'),
    submit: path(ROOTS_DASHBOARD, '/workflow/submit'),
    approve: path(ROOTS_DASHBOARD, '/workflow/approve'),
    assign: path(ROOTS_DASHBOARD, '/workflow/assign'),
    tracking: path(ROOTS_DASHBOARD, '/workflow/tracking'),
  },
  signature: {
    root: path(ROOTS_DASHBOARD, '/signature'),
    studio: path(ROOTS_DASHBOARD, '/signature/studio'),
    personal: path(ROOTS_DASHBOARD, '/signature/personal'),
    org: path(ROOTS_DASHBOARD, '/signature/org'),
    history: path(ROOTS_DASHBOARD, '/signature/history'),
    verify: path(ROOTS_DASHBOARD, '/signature/verify'),
  },
  interop: {
    root: path(ROOTS_DASHBOARD, '/interop'),
    send: path(ROOTS_DASHBOARD, '/interop/send'),
    receive: path(ROOTS_DASHBOARD, '/interop/receive'),
    acknowledgement: path(ROOTS_DASHBOARD, '/interop/acknowledgement'),
    sync: path(ROOTS_DASHBOARD, '/interop/sync'),
    retry: path(ROOTS_DASHBOARD, '/interop/retry'),
  },
  storage: {
    root: path(ROOTS_DASHBOARD, '/storage'),
    files: path(ROOTS_DASHBOARD, '/storage/files'),
    versions: path(ROOTS_DASHBOARD, '/storage/versions'),
    preview: path(ROOTS_DASHBOARD, '/storage/preview'),
  },
  notifications: path(ROOTS_DASHBOARD, '/notifications'),
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
    api: path(ROOTS_DASHBOARD, '/operations/sample-api'),
  },
};
