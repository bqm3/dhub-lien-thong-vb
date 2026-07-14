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
        children: [
          { title: 'Người dùng', path: PATH_DASHBOARD.admin.users },
          { title: 'Đơn vị', path: PATH_DASHBOARD.admin.units },
          { title: 'Vai trò / phân quyền', path: PATH_DASHBOARD.admin.roles },
          { title: 'Danh mục dùng chung', path: PATH_DASHBOARD.admin.categories },
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
        children: [
          { title: 'Văn bản đi', path: PATH_DASHBOARD.docMgmt.outgoing },
          { title: 'Văn bản đến', path: PATH_DASHBOARD.docMgmt.incoming },
          { title: 'Văn bản nội bộ', path: PATH_DASHBOARD.docMgmt.internal },
          { title: 'Hồ sơ văn bản', path: PATH_DASHBOARD.docMgmt.dossiers },
          { title: 'Tài liệu đính kèm', path: PATH_DASHBOARD.docMgmt.attachments },
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
        children: [
          { title: 'Luồng INTERNAL (nhiều cấp)', path: PATH_DASHBOARD.workflow.internal },
          { title: 'Studio ký số', path: PATH_DASHBOARD.signature.studio },
          { title: 'Trình duyệt', path: PATH_DASHBOARD.workflow.submit },
          { title: 'Phê duyệt / Từ chối', path: PATH_DASHBOARD.workflow.approve },
          { title: 'Giao việc', path: PATH_DASHBOARD.workflow.assign },
          { title: 'Theo dõi xử lý', path: PATH_DASHBOARD.workflow.tracking },
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
        children: [
          { title: 'Studio ký số', path: PATH_DASHBOARD.signature.studio },
          { title: 'Ký cá nhân', path: PATH_DASHBOARD.signature.personal },
          { title: 'Ký tổ chức / Đóng dấu', path: PATH_DASHBOARD.signature.org },
          { title: 'Lịch sử ký', path: PATH_DASHBOARD.signature.history },
          { title: 'Xác thực chữ ký', path: PATH_DASHBOARD.signature.verify },
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
        children: [
          { title: 'Gửi văn bản', path: PATH_DASHBOARD.interop.send },
          { title: 'Nhận văn bản', path: PATH_DASHBOARD.interop.receive },
          { title: 'Biên nhận', path: PATH_DASHBOARD.interop.acknowledgement },
          { title: 'Đồng bộ trạng thái', path: PATH_DASHBOARD.interop.sync },
          { title: 'Retry lỗi', path: PATH_DASHBOARD.interop.retry },
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
        children: [
          { title: 'Kho file', path: PATH_DASHBOARD.storage.files },
          { title: 'Version file', path: PATH_DASHBOARD.storage.versions },
          { title: 'Preview tài liệu', path: PATH_DASHBOARD.storage.preview },
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
        children: [
          { title: 'Trao đổi văn bản', path: PATH_DASHBOARD.operations.exchange },
          { title: 'Báo cáo thống kê', path: PATH_DASHBOARD.operations.reporting },
          { title: 'API mẫu', path: PATH_DASHBOARD.operations.api },
        ],
      },
    ],
  },
];

export default navConfig;
