import { Suspense, lazy, ElementType } from 'react';
import LoadingScreen from '../components/loading-screen';

const Loadable = (Component: ElementType) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

export const LoginPage = Loadable(lazy(() => import('../pages/LoginPage')));

export const IntegrationManagementPage = Loadable(lazy(() => import('../pages/integration/IntegrationManagementPage')));
export const DocumentManagementPage = Loadable(lazy(() => import('../pages/documents/DocumentManagementPage')));
export const DocumentExchangePage = Loadable(lazy(() => import('../pages/exchange/DocumentExchangePage')));

export const ExecutiveReportPage = Loadable(lazy(() => import('../pages/reporting/ExecutiveReportPage')));
export const DocumentReportPage = Loadable(lazy(() => import('../pages/reporting/DocumentReportPage')));
export const IncomingReportPage = Loadable(lazy(() => import('../pages/reporting/IncomingReportPage')));
export const DocumentTypeReportPage = Loadable(lazy(() => import('../pages/reporting/DocumentTypeReportPage')));
export const DeliveryReportPage = Loadable(lazy(() => import('../pages/reporting/DeliveryReportPage')));
export const ErrorReportPage = Loadable(lazy(() => import('../pages/reporting/ErrorReportPage')));
export const RetryReportPage = Loadable(lazy(() => import('../pages/reporting/RetryReportPage')));
export const AgencyReportPage = Loadable(lazy(() => import('../pages/reporting/AgencyReportPage')));
export const DailyOperationReportPage = Loadable(lazy(() => import('../pages/reporting/DailyOperationReportPage')));
export const ExportReportPage = Loadable(lazy(() => import('../pages/reporting/ExportReportPage')));

export const UsersPage = Loadable(lazy(() => import('../pages/admin/UsersPage')));
export const UnitsPage = Loadable(lazy(() => import('../pages/admin/UnitsPage')));
export const RolesPage = Loadable(lazy(() => import('../pages/admin/RolesPage')));
export const CategoriesPage = Loadable(lazy(() => import('../pages/admin/CategoriesPage')));

export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
