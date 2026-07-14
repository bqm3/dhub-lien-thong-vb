import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
import PermissionGuard, { GuardedPage } from '../auth/PermissionGuard';
// layouts
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config';
//
import {
  Page404,
  ExecutiveDashboardPage,
  IntegrationManagementPage,
  SampleApiPage,
  DocumentExchangePage,
  ReportingPage,
  LoginPage,
  DocumentManagementPage,
  UsersPage,
  UnitsPage,
  RolesPage,
  CategoriesPage,
  OutgoingDocumentsPage,
  IncomingDocumentsPage,
  InternalDocumentsPage,
  DossiersPage,
  AttachmentsPage,
  WorkflowSubmitPage,
  WorkflowApprovePage,
  WorkflowAssignPage,
  WorkflowTrackingPage,
  InternalWorkflowPage,
  SignatureStudioPage,
  PersonalSignPage,
  OrgSignPage,
  SignHistoryPage,
  SignVerifyPage,
  SendInteropPage,
  ReceiveInteropPage,
  AcknowledgementPage,
  SyncStatusPage,
  RetryQueuePage,
  FileStoragePage,
  FileVersionPage,
  DocumentPreviewPage,
  NotificationsPage,
} from './elements';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
        {
          path: 'login/internal',
          element: <Navigate to={PATH_AFTER_LOGIN} replace />,
        },
      ],
    },
    {
      path: '/dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'overview', element: <ExecutiveDashboardPage /> },
        { path: 'integration-management', element: <IntegrationManagementPage /> },
        { path: 'document-management', element: <DocumentManagementPage /> },
        { path: 'notifications', element: <NotificationsPage /> },
        {
          path: 'admin',
          children: [
            { element: <Navigate to="/dashboard/admin/users" replace />, index: true },
            { path: 'users', element: <GuardedPage path="/dashboard/admin/users" element={<UsersPage />} /> },
            { path: 'units', element: <GuardedPage path="/dashboard/admin/units" element={<UnitsPage />} /> },
            { path: 'roles', element: <GuardedPage path="/dashboard/admin/roles" element={<RolesPage />} /> },
            { path: 'categories', element: <GuardedPage path="/dashboard/admin/categories" element={<CategoriesPage />} /> },
          ],
        },
        {
          path: 'documents',
          children: [
            { element: <Navigate to="/dashboard/documents/outgoing" replace />, index: true },
            { path: 'outgoing', element: <GuardedPage path="/dashboard/documents/outgoing" element={<OutgoingDocumentsPage />} /> },
            { path: 'incoming', element: <GuardedPage path="/dashboard/documents/incoming" element={<IncomingDocumentsPage />} /> },
            { path: 'internal', element: <GuardedPage path="/dashboard/documents/internal" element={<InternalDocumentsPage />} /> },
            { path: 'dossiers', element: <GuardedPage path="/dashboard/documents/dossiers" element={<DossiersPage />} /> },
            { path: 'attachments', element: <GuardedPage path="/dashboard/documents/attachments" element={<AttachmentsPage />} /> },
          ],
        },
        {
          path: 'workflow',
          children: [
            { element: <Navigate to="/dashboard/workflow/internal" replace />, index: true },
            { path: 'internal', element: <GuardedPage path="/dashboard/workflow/internal" element={<InternalWorkflowPage />} /> },
            { path: 'submit', element: <GuardedPage path="/dashboard/workflow/submit" element={<WorkflowSubmitPage />} /> },
            { path: 'approve', element: <GuardedPage path="/dashboard/workflow/approve" element={<WorkflowApprovePage />} /> },
            { path: 'assign', element: <GuardedPage path="/dashboard/workflow/assign" element={<WorkflowAssignPage />} /> },
            { path: 'tracking', element: <GuardedPage path="/dashboard/workflow/tracking" element={<WorkflowTrackingPage />} /> },
          ],
        },
        {
          path: 'signature',
          children: [
            { element: <Navigate to="/dashboard/signature/studio" replace />, index: true },
            { path: 'studio', element: <GuardedPage path="/dashboard/signature/studio" element={<SignatureStudioPage />} /> },
            { path: 'personal', element: <GuardedPage path="/dashboard/signature/personal" element={<PersonalSignPage />} /> },
            { path: 'org', element: <GuardedPage path="/dashboard/signature/org" element={<OrgSignPage />} /> },
            { path: 'history', element: <GuardedPage path="/dashboard/signature/history" element={<SignHistoryPage />} /> },
            { path: 'verify', element: <GuardedPage path="/dashboard/signature/verify" element={<SignVerifyPage />} /> },
          ],
        },
        {
          path: 'interop',
          children: [
            { element: <Navigate to="/dashboard/interop/send" replace />, index: true },
            { path: 'send', element: <GuardedPage path="/dashboard/interop/send" element={<SendInteropPage />} /> },
            { path: 'receive', element: <GuardedPage path="/dashboard/interop/receive" element={<ReceiveInteropPage />} /> },
            { path: 'acknowledgement', element: <GuardedPage path="/dashboard/interop/acknowledgement" element={<AcknowledgementPage />} /> },
            { path: 'sync', element: <GuardedPage path="/dashboard/interop/sync" element={<SyncStatusPage />} /> },
            { path: 'retry', element: <GuardedPage path="/dashboard/interop/retry" element={<RetryQueuePage />} /> },
          ],
        },
        {
          path: 'storage',
          children: [
            { element: <Navigate to="/dashboard/storage/files" replace />, index: true },
            { path: 'files', element: <GuardedPage path="/dashboard/storage/files" element={<FileStoragePage />} /> },
            { path: 'versions', element: <GuardedPage path="/dashboard/storage/versions" element={<FileVersionPage />} /> },
            { path: 'preview', element: <GuardedPage path="/dashboard/storage/preview" element={<DocumentPreviewPage />} /> },
          ],
        },
        {
          path: 'operations',
          children: [
            { element: <Navigate to="/dashboard/operations/document-exchange" replace />, index: true },
            { path: 'document-exchange', element: <GuardedPage path="/dashboard/operations/document-exchange" element={<DocumentExchangePage />} /> },
            { path: 'reporting', element: <GuardedPage path="/dashboard/operations/reporting" element={<ReportingPage />} /> },
            { path: 'sample-api', element: <GuardedPage path="/dashboard/operations/sample-api" element={<SampleApiPage />} /> },
          ],
        },
      ],
    },
    {
      element: <CompactLayout />,
      children: [{ path: '404', element: <Page404 /> }],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
