import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
import PermissionGuard from '../auth/PermissionGuard';
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
            {
              path: 'users',
              element: (
                <PermissionGuard required={['USER_MANAGE']}>
                  <UsersPage />
                </PermissionGuard>
              ),
            },
            {
              path: 'units',
              element: (
                <PermissionGuard required={['UNIT_MANAGE']}>
                  <UnitsPage />
                </PermissionGuard>
              ),
            },
            {
              path: 'roles',
              element: (
                <PermissionGuard required={['ROLE_MANAGE']}>
                  <RolesPage />
                </PermissionGuard>
              ),
            },
            {
              path: 'categories',
              element: (
                <PermissionGuard required={['CATEGORY_MANAGE']}>
                  <CategoriesPage />
                </PermissionGuard>
              ),
            },
          ],
        },
        {
          path: 'documents',
          children: [
            { element: <Navigate to="/dashboard/documents/outgoing" replace />, index: true },
            { path: 'outgoing', element: <OutgoingDocumentsPage /> },
            { path: 'incoming', element: <IncomingDocumentsPage /> },
            { path: 'internal', element: <InternalDocumentsPage /> },
            { path: 'dossiers', element: <DossiersPage /> },
            { path: 'attachments', element: <AttachmentsPage /> },
          ],
        },
        {
          path: 'workflow',
          children: [
            { element: <Navigate to="/dashboard/workflow/internal" replace />, index: true },
            { path: 'internal', element: <InternalWorkflowPage /> },
            { path: 'submit', element: <WorkflowSubmitPage /> },
            { path: 'approve', element: <WorkflowApprovePage /> },
            { path: 'assign', element: <WorkflowAssignPage /> },
            { path: 'tracking', element: <WorkflowTrackingPage /> },
          ],
        },
        {
          path: 'signature',
          children: [
            { element: <Navigate to="/dashboard/signature/studio" replace />, index: true },
            { path: 'studio', element: <SignatureStudioPage /> },
            { path: 'personal', element: <PersonalSignPage /> },
            { path: 'org', element: <OrgSignPage /> },
            { path: 'history', element: <SignHistoryPage /> },
            { path: 'verify', element: <SignVerifyPage /> },
          ],
        },
        {
          path: 'interop',
          children: [
            { element: <Navigate to="/dashboard/interop/send" replace />, index: true },
            { path: 'send', element: <SendInteropPage /> },
            { path: 'receive', element: <ReceiveInteropPage /> },
            { path: 'acknowledgement', element: <AcknowledgementPage /> },
            { path: 'sync', element: <SyncStatusPage /> },
            { path: 'retry', element: <RetryQueuePage /> },
          ],
        },
        {
          path: 'storage',
          children: [
            { element: <Navigate to="/dashboard/storage/files" replace />, index: true },
            { path: 'files', element: <FileStoragePage /> },
            { path: 'versions', element: <FileVersionPage /> },
            { path: 'preview', element: <DocumentPreviewPage /> },
          ],
        },
        {
          path: 'operations',
          children: [
            { element: <Navigate to="/dashboard/operations/document-exchange" replace />, index: true },
            { path: 'document-exchange', element: <DocumentExchangePage /> },
            { path: 'reporting', element: <ReportingPage /> },
            { path: 'sample-api', element: <SampleApiPage /> },
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
