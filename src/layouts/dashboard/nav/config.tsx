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
};

const navConfig = [
  {
    subheader: 'Tổng quan',
    items: [
      {
        title: 'Báo cáo thống kê',
        path: PATH_DASHBOARD.operations.reporting.root,
        icon: ICONS.dashboard,
        children: [
          { title: 'Tổng quan hệ thống', path: PATH_DASHBOARD.operations.reporting.executive },
          { title: 'Báo cáo văn bản', path: PATH_DASHBOARD.operations.reporting.document },
          { title: 'Văn bản nhận vào', path: PATH_DASHBOARD.operations.reporting.incoming },
          { title: 'Theo loại văn bản', path: PATH_DASHBOARD.operations.reporting.type },
          { title: 'Báo cáo giao nhận', path: PATH_DASHBOARD.operations.reporting.delivery },
          { title: 'Báo cáo giao dịch lỗi', path: PATH_DASHBOARD.operations.reporting.error },
          { title: 'Báo cáo gửi lại', path: PATH_DASHBOARD.operations.reporting.retry },
          { title: 'Báo cáo theo đơn vị', path: PATH_DASHBOARD.operations.reporting.agency },
          { title: 'Vận hành hằng ngày', path: PATH_DASHBOARD.operations.reporting.daily },
          { title: 'Xuất báo cáo', path: PATH_DASHBOARD.operations.reporting.export },
        ],
      },
    ],
  },
  {
    subheader: 'ket noi lien thong',
    items: [
      {
        title: 'Ket noi lien thong',
        path: PATH_DASHBOARD.integration,
        icon: ICONS.ecommerce,
      },
    ],
  },
  {
    subheader: 'quan ly van ban',
    items: [
      {
        title: 'Danh sach van ban',
        path: PATH_DASHBOARD.documents,
        icon: ICONS.analytics,
      },
    ],
  },
  {
    subheader: 'trao doi van ban',
    items: [
      {
        title: 'Trao doi van ban',
        path: PATH_DASHBOARD.operations.exchange,
        icon: ICONS.ecommerce,
      },
    ],
  },
  {
    subheader: 'quan tri he thong',
    items: [
      {
        title: 'Quan tri nen tang',
        path: PATH_DASHBOARD.admin.root,
        icon: ICONS.user,
        children: [
          { title: 'Nguoi dung', path: PATH_DASHBOARD.admin.users },
          { title: 'Don vi', path: PATH_DASHBOARD.admin.units },
          { title: 'Vai tro / phan quyen', path: PATH_DASHBOARD.admin.roles },
          { title: 'Danh muc dung chung', path: PATH_DASHBOARD.admin.categories },
        ],
      },
    ],
  },
];

export default navConfig;
