// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: icon('ic_user'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  file: icon('ic_file'),
  folder: icon('ic_folder'),
};

const navConfig = [
  {
    subheader: 'Tổng quan',
    items: [
      {
        title: 'Tổng quan hệ thống',
        path: PATH_DASHBOARD.reporting.executive,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    subheader: 'Kết nối liên thông',
    items: [
      {
        title: 'Kết nối liên thông',
        path: PATH_DASHBOARD.integration,
        icon: ICONS.ecommerce,
      },
    ],
  },
  {
    subheader: 'Quản lý văn bản',
    items: [
      {
        title: 'Danh sách văn bản',
        path: PATH_DASHBOARD.documents,
        icon: ICONS.folder,
      },
    ],
  },
  {
    subheader: 'Trao đổi văn bản',
    items: [
      {
        title: 'Trao đổi văn bản',
        path: PATH_DASHBOARD.exchange,
        icon: ICONS.ecommerce,
      },
    ],
  },
  {
    subheader: 'Báo cáo thống kê',
    items: [
      {
        title: 'Báo cáo văn bản',
        path: PATH_DASHBOARD.reporting.document,
        icon: ICONS.file,
        children: [
          { title: 'Báo cáo văn bản', path: PATH_DASHBOARD.reporting.document },
          { title: 'Văn bản nhận vào', path: PATH_DASHBOARD.reporting.incoming },
          { title: 'Theo loại văn bản', path: PATH_DASHBOARD.reporting.type },
          { title: 'Báo cáo theo đơn vị', path: PATH_DASHBOARD.reporting.agency },
        ],
      },
      {
        title: 'Báo cáo vận hành',
        path: PATH_DASHBOARD.reporting.delivery,
        icon: ICONS.analytics,
        children: [
          { title: 'Báo cáo giao nhận', path: PATH_DASHBOARD.reporting.delivery },
          { title: 'Báo cáo giao dịch lỗi', path: PATH_DASHBOARD.reporting.error },
          { title: 'Báo cáo gửi lại', path: PATH_DASHBOARD.reporting.retry },
          { title: 'Vận hành hằng ngày', path: PATH_DASHBOARD.reporting.daily },
          { title: 'Xuất báo cáo', path: PATH_DASHBOARD.reporting.export },
        ],
      },
    ],
  },
  {
    subheader: 'Quản trị hệ thống',
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
];

export default navConfig;
