// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: icon('ic_user'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

const navConfig = [
  {
    subheader: 'quản trị hệ thống',
    items: [
      {
        title: 'Quản trị nền tảng',
        path: PATH_DASHBOARD.admin.root,
        icon: ICONS.user,
        permissions: ['USER_MANAGE', 'UNIT_MANAGE', 'ROLE_MANAGE', 'CATEGORY_MANAGE'],
        permissionMode: 'any',
        children: [
          { title: 'Người dùng', path: PATH_DASHBOARD.admin.users, permissions: ['USER_MANAGE'] },
          { title: 'Đơn vị', path: PATH_DASHBOARD.admin.units, permissions: ['UNIT_MANAGE'] },
          { title: 'Vai trò / phân quyền', path: PATH_DASHBOARD.admin.roles, permissions: ['ROLE_MANAGE'] },
          { title: 'Danh mục dùng chung', path: PATH_DASHBOARD.admin.categories, permissions: ['CATEGORY_MANAGE'] },
        ],
      },
    ],
  },
  {
    subheader: 'quản lý văn bản',
    items: [
      {
        title: 'Văn bản',
        path: PATH_DASHBOARD.docMgmt.root,
        icon: ICONS.analytics,
        permissions: ['DOC_CREATE', 'DOC_REGISTER', 'DOC_PUBLISH', 'DOC_RELEASE'],
        permissionMode: 'any',
        children: [
          { title: 'Văn bản đi', path: PATH_DASHBOARD.docMgmt.outgoing, permissions: ['DOC_CREATE', 'DOC_REGISTER'] },
          { title: 'Văn bản đến', path: PATH_DASHBOARD.docMgmt.incoming, permissions: ['DOC_REGISTER'] },
          { title: 'Văn bản nội bộ', path: PATH_DASHBOARD.docMgmt.internal, permissions: ['DOC_CREATE'] },
          { title: 'Hồ sơ văn bản', path: PATH_DASHBOARD.docMgmt.dossiers, permissions: ['DOC_REGISTER'] },
          { title: 'Tài liệu đính kèm', path: PATH_DASHBOARD.docMgmt.attachments, permissions: ['DOC_CREATE'] },
        ],
      },
    ],
  },
  {
    subheader: 'luồng xử lý',
    items: [
      {
        title: 'Workflow',
        path: PATH_DASHBOARD.workflow.root,
        icon: ICONS.ecommerce,
        permissions: ['WF_APPROVE', 'WF_REJECT', 'WF_ASSIGN'],
        permissionMode: 'any',
        children: [
          { title: 'Luồng INTERNAL (nhiều cấp)', path: PATH_DASHBOARD.workflow.internal, permissions: ['WF_APPROVE'] },
          { title: 'Studio ký số', path: PATH_DASHBOARD.signature.studio, permissions: ['SIGN_PERSONAL', 'SIGN_ORG'] },
          { title: 'Trình duyệt', path: PATH_DASHBOARD.workflow.submit, permissions: ['DOC_REGISTER'] },
          { title: 'Phê duyệt / Từ chối', path: PATH_DASHBOARD.workflow.approve, permissions: ['WF_APPROVE', 'WF_REJECT'] },
          { title: 'Giao việc', path: PATH_DASHBOARD.workflow.assign, permissions: ['WF_ASSIGN'] },
          { title: 'Theo dõi xử lý', path: PATH_DASHBOARD.workflow.tracking, permissions: ['WF_APPROVE', 'WF_ASSIGN'] },
        ],
      },
    ],
  },
  {
    subheader: 'ký số',
    items: [
      {
        title: 'Ký số',
        path: PATH_DASHBOARD.signature.root,
        icon: ICONS.user,
        permissions: ['SIGN_PERSONAL', 'SIGN_ORG'],
        permissionMode: 'any',
        children: [
          { title: 'Studio ký số', path: PATH_DASHBOARD.signature.studio, permissions: ['SIGN_PERSONAL', 'SIGN_ORG'] },
          { title: 'Ký cá nhân', path: PATH_DASHBOARD.signature.personal, permissions: ['SIGN_PERSONAL'] },
          { title: 'Ký tổ chức / Đóng dấu', path: PATH_DASHBOARD.signature.org, permissions: ['SIGN_ORG'] },
          { title: 'Lịch sử ký', path: PATH_DASHBOARD.signature.history, permissions: ['SIGN_PERSONAL', 'SIGN_ORG'] },
          { title: 'Xác thực chữ ký', path: PATH_DASHBOARD.signature.verify, permissions: ['SIGN_PERSONAL', 'SIGN_ORG'] },
        ],
      },
    ],
  },
  {
    subheader: 'liên thông',
    items: [
      {
        title: 'Gửi / Nhận',
        path: PATH_DASHBOARD.interop.root,
        icon: ICONS.ecommerce,
        permissions: ['EXCHANGE_SUBMIT', 'EXCHANGE_RECEIVE'],
        permissionMode: 'any',
        children: [
          { title: 'Gửi văn bản', path: PATH_DASHBOARD.interop.send, permissions: ['EXCHANGE_SUBMIT'] },
          { title: 'Nhận văn bản', path: PATH_DASHBOARD.interop.receive, permissions: ['EXCHANGE_RECEIVE'] },
          { title: 'Biên nhận', path: PATH_DASHBOARD.interop.acknowledgement, permissions: ['EXCHANGE_RECEIVE', 'EXCHANGE_SUBMIT'] },
          { title: 'Đồng bộ trạng thái', path: PATH_DASHBOARD.interop.sync, permissions: ['EXCHANGE_RECEIVE', 'EXCHANGE_SUBMIT'] },
          { title: 'Retry lỗi', path: PATH_DASHBOARD.interop.retry, permissions: ['EXCHANGE_SUBMIT'] },
        ],
      },
    ],
  },
  {
    subheader: 'lưu trữ & thông báo',
    items: [
      {
        title: 'Lưu trữ',
        path: PATH_DASHBOARD.storage.root,
        icon: ICONS.analytics,
        permissions: ['DOC_REGISTER', 'DOC_PUBLISH', 'DOC_RELEASE'],
        permissionMode: 'any',
        children: [
          { title: 'Kho file', path: PATH_DASHBOARD.storage.files, permissions: ['DOC_REGISTER', 'DOC_PUBLISH'] },
          { title: 'Version file', path: PATH_DASHBOARD.storage.versions, permissions: ['DOC_REGISTER', 'DOC_PUBLISH'] },
          { title: 'Preview tài liệu', path: PATH_DASHBOARD.storage.preview, permissions: ['DOC_REGISTER', 'DOC_PUBLISH'] },
        ],
      },
      { title: 'Thông báo nội bộ', path: PATH_DASHBOARD.notifications, icon: ICONS.dashboard },
    ],
  },
  {
    subheader: 'vận hành trục',
    items: [
      { title: 'Tổng quan', path: PATH_DASHBOARD.overview, icon: ICONS.dashboard },
      { title: 'Kết nối liên thông', path: PATH_DASHBOARD.integration, icon: ICONS.ecommerce },
      { title: 'Quản lý văn bản (tổng)', path: PATH_DASHBOARD.documents, icon: ICONS.analytics },
    ],
  },
  {
    subheader: 'điều hành nghiệp vụ',
    items: [
      {
        title: 'Giao dịch và báo cáo',
        path: PATH_DASHBOARD.operations.root,
        icon: ICONS.user,
        permissions: ['REPORT_VIEW'],
        permissionMode: 'any',
        children: [
          { title: 'Trao đổi văn bản', path: PATH_DASHBOARD.operations.exchange, permissions: ['EXCHANGE_SUBMIT', 'EXCHANGE_RECEIVE'] },
          { title: 'Báo cáo thống kê', path: PATH_DASHBOARD.operations.reporting, permissions: ['REPORT_VIEW'] },
          { title: 'API mẫu', path: PATH_DASHBOARD.operations.api, permissions: ['AUDIT_VIEW'] },
        ],
      },
    ],
  },
];

export default navConfig;
