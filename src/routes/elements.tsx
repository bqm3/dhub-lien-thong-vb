import { Suspense, lazy, ElementType } from 'react';
// components
import LoadingScreen from '../components/loading-screen';

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: any) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// ----------------------------------------------------------------------

export const LoginPage = Loadable(lazy(() => import('../pages/LoginPage')));

export const ExecutiveDashboardPage = Loadable(
  lazy(() => import('../pages/dashboard/ExecutiveDashboardPage'))
);
export const IntegrationManagementPage = Loadable(
  lazy(() => import('../pages/integration/IntegrationManagementPage'))
);
export const DocumentManagementPage = Loadable(
  lazy(() => import('../pages/documents/DocumentManagementPage'))
);
export const DocumentExchangePage = Loadable(
  lazy(() => import('../pages/exchange/DocumentExchangePage'))
);
export const ReportingPage = Loadable(lazy(() => import('../pages/reporting/ReportingPage')));
export const SampleApiPage = Loadable(lazy(() => import('../pages/api/SampleApiPage')));

// Admin
export const UsersPage = Loadable(lazy(() => import('../pages/admin/UsersPage')));
export const UnitsPage = Loadable(lazy(() => import('../pages/admin/UnitsPage')));
export const RolesPage = Loadable(lazy(() => import('../pages/admin/RolesPage')));
export const CategoriesPage = Loadable(lazy(() => import('../pages/admin/CategoriesPage')));

// Documents
export const OutgoingDocumentsPage = Loadable(
  lazy(() => import('../pages/documents/OutgoingDocumentsPage'))
);
export const IncomingDocumentsPage = Loadable(
  lazy(() => import('../pages/documents/IncomingDocumentsPage'))
);
export const InternalDocumentsPage = Loadable(
  lazy(() => import('../pages/documents/InternalDocumentsPage'))
);
export const DossiersPage = Loadable(lazy(() => import('../pages/documents/DossiersPage')));
export const AttachmentsPage = Loadable(lazy(() => import('../pages/documents/AttachmentsPage')));

// Workflow
export const WorkflowSubmitPage = Loadable(
  lazy(() => import('../pages/workflow/WorkflowSubmitPage'))
);
export const WorkflowApprovePage = Loadable(
  lazy(() => import('../pages/workflow/WorkflowApprovePage'))
);
export const WorkflowAssignPage = Loadable(
  lazy(() => import('../pages/workflow/WorkflowAssignPage'))
);
export const WorkflowTrackingPage = Loadable(
  lazy(() => import('../pages/workflow/WorkflowTrackingPage'))
);
export const InternalWorkflowPage = Loadable(
  lazy(() => import('../pages/workflow/InternalWorkflowPage'))
);

// Signature
export const SignatureStudioPage = Loadable(
  lazy(() => import('../pages/signature/SignatureStudioPage'))
);
export const PersonalSignPage = Loadable(lazy(() => import('../pages/signature/PersonalSignPage')));
export const OrgSignPage = Loadable(lazy(() => import('../pages/signature/OrgSignPage')));
export const SignHistoryPage = Loadable(lazy(() => import('../pages/signature/SignHistoryPage')));
export const SignVerifyPage = Loadable(lazy(() => import('../pages/signature/SignVerifyPage')));

// Interop
export const SendInteropPage = Loadable(lazy(() => import('../pages/interop/SendInteropPage')));
export const ReceiveInteropPage = Loadable(lazy(() => import('../pages/interop/ReceiveInteropPage')));
export const AcknowledgementPage = Loadable(
  lazy(() => import('../pages/interop/AcknowledgementPage'))
);
export const SyncStatusPage = Loadable(lazy(() => import('../pages/interop/SyncStatusPage')));
export const RetryQueuePage = Loadable(lazy(() => import('../pages/interop/RetryQueuePage')));

// Storage
export const FileStoragePage = Loadable(lazy(() => import('../pages/storage/FileStoragePage')));
export const FileVersionPage = Loadable(lazy(() => import('../pages/storage/FileVersionPage')));
export const DocumentPreviewPage = Loadable(
  lazy(() => import('../pages/storage/DocumentPreviewPage'))
);

// Notifications
export const NotificationsPage = Loadable(
  lazy(() => import('../pages/notifications/NotificationsPage'))
);

export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
