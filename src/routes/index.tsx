import { Navigate, useRoutes } from 'react-router-dom';
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
import { GuardedPage } from '../auth/PermissionGuard';
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
import { PATH_AFTER_LOGIN } from '../config';
import {
  Page404,
  IntegrationManagementPage,
  DocumentExchangePage,
  LoginPage,
  DocumentManagementPage,
  UsersPage,
  UnitsPage,
  RolesPage,
  CategoriesPage,
  ExecutiveReportPage,
  DocumentReportPage,
  IncomingReportPage,
  DocumentTypeReportPage,
  DeliveryReportPage,
  ErrorReportPage,
  RetryReportPage,
  AgencyReportPage,
  DailyOperationReportPage,
  ExportReportPage,
} from './elements';

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
        { path: 'login/internal', element: <Navigate to={PATH_AFTER_LOGIN} replace /> },
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
        { path: 'overview', element: <Navigate to={PATH_AFTER_LOGIN} replace /> },
        { path: 'integration-management', element: <IntegrationManagementPage /> },
        { path: 'document-management', element: <DocumentManagementPage /> },
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
          path: 'operations',
          children: [
            { element: <Navigate to="/dashboard/operations/document-exchange" replace />, index: true },
            {
              path: 'document-exchange',
              element: <GuardedPage path="/dashboard/operations/document-exchange" element={<DocumentExchangePage />} />,
            },
            {
              path: 'reporting',
              children: [
                { element: <Navigate to="/dashboard/operations/reporting/executive" replace />, index: true },
                { path: 'executive', element: <GuardedPage path="/dashboard/operations/reporting/executive" element={<ExecutiveReportPage />} /> },
                { path: 'document', element: <GuardedPage path="/dashboard/operations/reporting/document" element={<DocumentReportPage />} /> },
                { path: 'incoming', element: <GuardedPage path="/dashboard/operations/reporting/incoming" element={<IncomingReportPage />} /> },
                { path: 'type', element: <GuardedPage path="/dashboard/operations/reporting/type" element={<DocumentTypeReportPage />} /> },
                { path: 'delivery', element: <GuardedPage path="/dashboard/operations/reporting/delivery" element={<DeliveryReportPage />} /> },
                { path: 'error', element: <GuardedPage path="/dashboard/operations/reporting/error" element={<ErrorReportPage />} /> },
                { path: 'retry', element: <GuardedPage path="/dashboard/operations/reporting/retry" element={<RetryReportPage />} /> },
                { path: 'agency', element: <GuardedPage path="/dashboard/operations/reporting/agency" element={<AgencyReportPage />} /> },
                { path: 'daily', element: <GuardedPage path="/dashboard/operations/reporting/daily" element={<DailyOperationReportPage />} /> },
                { path: 'export', element: <GuardedPage path="/dashboard/operations/reporting/export" element={<ExportReportPage />} /> },
              ],
            },
          ],
        },
      ],
    },
    { element: <CompactLayout />, children: [{ path: '404', element: <Page404 /> }] },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
