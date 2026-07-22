export type ReportSectionKey =
  | 'executive'
  | 'document'
  | 'incoming'
  | 'type'
  | 'delivery'
  | 'error'
  | 'retry'
  | 'agency'
  | 'daily'
  | 'export';

export type ReportMetric = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: string;
};

export type ChartPoint = Record<string, string | number>;

export type ReportConfig = {
  title: string;
  subtitle: string;
  metrics: ReportMetric[];
  trendTitle: string;
  trendSubtitle: string;
  trendData: ChartPoint[];
  trendSeries: { key: string; name: string; color: string }[];
  breakdownTitle: string;
  breakdownSubtitle: string;
  breakdownData: ChartPoint[];
  breakdownSeries: { key: string; name: string; color: string }[];
  distributionTitle: string;
  distributionSubtitle: string;
  distributionData: { name: string; value: number }[];
  tableTitle: string;
  tableSubtitle: string;
  columns: { key: string; label: string; align?: 'left' | 'right' | 'center' }[];
  rows: Record<string, string | number>[];
  insights: string[];
};

const colors = {
  blue: '#1976D2',
  cyan: '#00A6C8',
  green: '#2EAD6B',
  orange: '#F59E0B',
  red: '#E34D59',
  purple: '#7C4DFF',
};

const commonIcons = [
  'solar:documents-bold-duotone',
  'solar:chart-2-bold-duotone',
  'solar:verified-check-bold-duotone',
  'solar:clock-circle-bold-duotone',
];

const makeMetrics = (items: [string, string, string][]): ReportMetric[] =>
  items.map(([label, value, helper], index) => ({
    label,
    value,
    helper,
    icon: commonIcons[index],
    color: [colors.blue, colors.cyan, colors.green, colors.orange][index],
  }));

const weekly = [
  { label: '15/07', sent: 3280, received: 3150, failed: 42 },
  { label: '16/07', sent: 3560, received: 3410, failed: 38 },
  { label: '17/07', sent: 3420, received: 3305, failed: 51 },
  { label: '18/07', sent: 3890, received: 3748, failed: 35 },
  { label: '19/07', sent: 2960, received: 2855, failed: 29 },
  { label: '20/07', sent: 2480, received: 2390, failed: 24 },
  { label: '21/07', sent: 4125, received: 3982, failed: 31 },
];

export const reportOrder: { key: ReportSectionKey; label: string }[] = [
  { key: 'executive', label: 'Tổng quan hệ thống' },
  { key: 'document', label: 'Báo cáo văn bản' },
  { key: 'incoming', label: 'Văn bản nhận vào' },
  { key: 'type', label: 'Theo loại văn bản' },
  { key: 'delivery', label: 'Giao nhận' },
  { key: 'error', label: 'Giao dịch lỗi' },
  { key: 'retry', label: 'Giao dịch gửi lại' },
  { key: 'agency', label: 'Theo đơn vị' },
  { key: 'daily', label: 'Vận hành hằng ngày' },
  { key: 'export', label: 'Xuất báo cáo' },
];

export const reportingData: Record<ReportSectionKey, ReportConfig> = {
  executive: {
    title: 'Báo cáo tổng quan hệ thống',
    subtitle: 'Bức tranh điều hành toàn hệ thống liên thông văn bản, cập nhật đến 21/07/2026.',
    metrics: makeMetrics([
      ['Tổng văn bản', '184.620', 'Tăng 8,4% so với tháng trước'],
      ['Tổng giao dịch', '356.842', '51.120 giao dịch trong 7 ngày'],
      ['Tỷ lệ thành công', '99,18%', 'Cao hơn SLA mục tiêu 0,18%'],
      ['Độ trễ trung bình', '2,7 giây', 'Giảm 0,4 giây so với tuần trước'],
    ]),
    trendTitle: 'Xu hướng giao dịch 7 ngày',
    trendSubtitle: 'So sánh lượng gửi, nhận thành công và giao dịch lỗi theo ngày.',
    trendData: weekly,
    trendSeries: [
      { key: 'sent', name: 'Gửi đi', color: colors.blue },
      { key: 'received', name: 'Nhận thành công', color: colors.green },
      { key: 'failed', name: 'Lỗi', color: colors.red },
    ],
    breakdownTitle: 'Sản lượng theo khối cơ quan',
    breakdownSubtitle: 'Số văn bản gửi và nhận trong tháng 7/2026.',
    breakdownData: [
      { label: 'Bộ, ngành', sent: 42800, received: 40520 },
      { label: 'Tỉnh, thành', sent: 56420, received: 53860 },
      { label: 'Sở, ban', sent: 38150, received: 36740 },
      { label: 'Quận, huyện', sent: 27680, received: 26310 },
      { label: 'Đơn vị khác', sent: 12340, received: 11860 },
    ],
    breakdownSeries: [
      { key: 'sent', name: 'Gửi đi', color: colors.blue },
      { key: 'received', name: 'Nhận vào', color: colors.cyan },
    ],
    distributionTitle: 'Trạng thái toàn hệ thống',
    distributionSubtitle: 'Cơ cấu 356.842 giao dịch liên thông.',
    distributionData: [
      { name: 'Thành công', value: 353916 },
      { name: 'Đang xử lý', value: 1680 },
      { name: 'Gửi lại', value: 840 },
      { name: 'Thất bại', value: 406 },
    ],
    tableTitle: 'Chỉ số vận hành trọng yếu',
    tableSubtitle: 'Theo dõi nhanh các chỉ tiêu điều hành và mức hoàn thành mục tiêu.',
    columns: [
      { key: 'metric', label: 'Chỉ tiêu' }, { key: 'current', label: 'Hiện tại', align: 'right' },
      { key: 'target', label: 'Mục tiêu', align: 'right' }, { key: 'change', label: 'Biến động', align: 'center' },
    ],
    rows: [
      { metric: 'Tỷ lệ giao nhận thành công', current: '99,18%', target: '≥ 99%', change: '+0,24%' },
      { metric: 'Thời gian phản hồi trung bình', current: '2,7 giây', target: '≤ 3 giây', change: '-0,4 giây' },
      { metric: 'Tỷ lệ ACK đúng hạn', current: '99,52%', target: '≥ 99,2%', change: '+0,12%' },
      { metric: 'Đơn vị kết nối ổn định', current: '126/128', target: '128/128', change: '+2 đơn vị' },
      { metric: 'Giao dịch tồn quá 30 phút', current: '38', target: '< 50', change: '-17' },
      { metric: 'Dung lượng lưu trữ sử dụng', current: '68,4%', target: '< 80%', change: '+1,8%' },
    ],
    insights: ['Lưu lượng cao nhất lúc 09:00–10:00, đạt 8.420 giao dịch/giờ.', 'Hai đơn vị đang có tỷ lệ thành công dưới 98,5%.', 'Số lỗi xác thực chữ ký giảm 21% sau khi đồng bộ chứng thư số.'],
  },
  document: {
    title: 'Báo cáo văn bản',
    subtitle: 'Phân tích sản lượng, tiến độ xử lý và chất lượng văn bản trên toàn hệ thống.',
    metrics: makeMetrics([
      ['Văn bản phát hành', '92.480', 'Tăng 7,8% so với tháng 6'],
      ['Văn bản đã ký số', '91.756', 'Đạt 99,22% tổng phát hành'],
      ['Đúng hạn xử lý', '96,84%', 'Tăng 1,12 điểm phần trăm'],
      ['Thời gian xử lý', '4,6 giờ', 'Giảm 32 phút/văn bản'],
    ]),
    trendTitle: 'Sản lượng văn bản theo ngày', trendSubtitle: 'Văn bản tạo mới, ký số và phát hành trong 7 ngày gần nhất.',
    trendData: weekly.map((d, i) => ({ label: d.label, created: 1450 + i * 73 + (i % 2) * 180, signed: 1402 + i * 70 + (i % 2) * 172, issued: 1360 + i * 67 + (i % 2) * 165 })),
    trendSeries: [{ key: 'created', name: 'Tạo mới', color: colors.blue }, { key: 'signed', name: 'Ký số', color: colors.purple }, { key: 'issued', name: 'Phát hành', color: colors.green }],
    breakdownTitle: 'Văn bản theo mức độ khẩn', breakdownSubtitle: 'Sản lượng và số văn bản đã hoàn thành.',
    breakdownData: [{ label: 'Bình thường', total: 68240, completed: 66180 }, { label: 'Khẩn', total: 15420, completed: 14930 }, { label: 'Hỏa tốc', total: 6240, completed: 6105 }, { label: 'Thượng khẩn', total: 2580, completed: 2518 }],
    breakdownSeries: [{ key: 'total', name: 'Tổng số', color: colors.blue }, { key: 'completed', name: 'Hoàn thành', color: colors.green }],
    distributionTitle: 'Trạng thái xử lý', distributionSubtitle: 'Cơ cấu văn bản trong kỳ báo cáo.',
    distributionData: [{ name: 'Đã phát hành', value: 72460 }, { name: 'Chờ ký', value: 8420 }, { name: 'Đang duyệt', value: 7360 }, { name: 'Thu hồi', value: 4240 }],
    tableTitle: 'Chi tiết theo đơn vị phát hành', tableSubtitle: 'Các đơn vị có sản lượng văn bản cao trong tháng.',
    columns: [{ key: 'agency', label: 'Đơn vị' }, { key: 'created', label: 'Tạo mới', align: 'right' }, { key: 'issued', label: 'Phát hành', align: 'right' }, { key: 'onTime', label: 'Đúng hạn', align: 'center' }],
    rows: [
      { agency: 'UBND thành phố Hà Nội', created: '12.840', issued: '12.315', onTime: '98,4%' }, { agency: 'Bộ Nội vụ', created: '10.620', issued: '10.182', onTime: '97,9%' },
      { agency: 'Bộ Tài chính', created: '9.850', issued: '9.476', onTime: '97,2%' }, { agency: 'Bộ Công an', created: '9.420', issued: '9.108', onTime: '98,8%' },
      { agency: 'UBND Thành phố Hồ Chí Minh', created: '8.970', issued: '8.534', onTime: '96,9%' }, { agency: 'Sở Nội vụ Hà Nội', created: '7.680', issued: '7.305', onTime: '98,1%' },
      { agency: 'Kho bạc Nhà nước', created: '6.940', issued: '6.722', onTime: '99,0%' }, { agency: 'Sở Tư pháp Đà Nẵng', created: '5.860', issued: '5.604', onTime: '97,6%' },
    ],
    insights: ['Văn bản hỏa tốc có tỷ lệ xử lý đúng hạn cao nhất: 98,7%.', 'Khung giờ phát hành nhiều nhất là 15:00–16:00.', '724 văn bản chưa ký số cần được rà soát.'],
  },
  incoming: {
    title: 'Báo cáo văn bản nhận vào', subtitle: 'Theo dõi tiếp nhận, phân luồng và hoàn thành xử lý văn bản đến.',
    metrics: makeMetrics([['Tổng tiếp nhận', '88.965', 'Tăng 6,1% so với tháng trước'], ['Đã phân luồng', '87.842', '98,74% tổng tiếp nhận'], ['Hoàn thành xử lý', '82.406', '92,62% tổng tiếp nhận'], ['Chờ quá hạn', '286', 'Giảm 14,6% so với tháng trước']]),
    trendTitle: 'Tiếp nhận và xử lý 7 ngày', trendSubtitle: 'So sánh văn bản tiếp nhận, phân luồng và hoàn thành.',
    trendData: weekly.map((d, i) => ({ label: d.label, incoming: 2680 + i * 95 + (i % 3) * 160, routed: 2610 + i * 91 + (i % 3) * 155, completed: 2470 + i * 86 + (i % 3) * 148 })),
    trendSeries: [{ key: 'incoming', name: 'Tiếp nhận', color: colors.blue }, { key: 'routed', name: 'Phân luồng', color: colors.cyan }, { key: 'completed', name: 'Hoàn thành', color: colors.green }],
    breakdownTitle: 'Tiến độ theo khối đơn vị', breakdownSubtitle: 'Tổng nhận vào và đã hoàn thành trong kỳ.',
    breakdownData: [{ label: 'Bộ, ngành', received: 28420, completed: 26650 }, { label: 'Tỉnh, thành', received: 31280, completed: 29140 }, { label: 'Sở, ban', received: 18760, completed: 17480 }, { label: 'Quận, huyện', received: 10505, completed: 9136 }],
    breakdownSeries: [{ key: 'received', name: 'Tiếp nhận', color: colors.blue }, { key: 'completed', name: 'Hoàn thành', color: colors.green }],
    distributionTitle: 'Tình trạng văn bản đến', distributionSubtitle: 'Cơ cấu tiến độ xử lý hiện tại.',
    distributionData: [{ name: 'Hoàn thành', value: 82406 }, { name: 'Đang xử lý', value: 5145 }, { name: 'Chờ phân luồng', value: 1128 }, { name: 'Quá hạn', value: 286 }],
    tableTitle: 'Chi tiết đơn vị nhận', tableSubtitle: 'Sản lượng và tiến độ xử lý tại các đơn vị nhận văn bản.',
    columns: [{ key: 'agency', label: 'Đơn vị nhận' }, { key: 'received', label: 'Tiếp nhận', align: 'right' }, { key: 'processing', label: 'Đang xử lý', align: 'right' }, { key: 'completed', label: 'Hoàn thành', align: 'right' }, { key: 'overdue', label: 'Quá hạn', align: 'right' }],
    rows: [
      { agency: 'Sở Nội vụ Hà Nội', received: '8.420', processing: '432', completed: '7.962', overdue: 26 }, { agency: 'Sở Thông tin và Truyền thông', received: '7.865', processing: '398', completed: '7.441', overdue: 26 },
      { agency: 'UBND thành phố Hà Nội', received: '7.540', processing: '356', completed: '7.158', overdue: 26 }, { agency: 'Bộ Tài chính', received: '6.980', processing: '340', completed: '6.615', overdue: 25 },
      { agency: 'Kho bạc Nhà nước', received: '6.475', processing: '286', completed: '6.170', overdue: 19 }, { agency: 'Sở Giáo dục và Đào tạo Hà Nội', received: '5.940', processing: '308', completed: '5.608', overdue: 24 },
      { agency: 'Bộ Tư pháp', received: '5.625', processing: '275', completed: '5.329', overdue: 21 }, { agency: 'UBND thành phố Đà Nẵng', received: '5.180', processing: '246', completed: '4.916', overdue: 18 },
    ],
    insights: ['98,74% văn bản được phân luồng tự động hoặc trong 30 phút.', '286 văn bản quá hạn tập trung tại 12 đơn vị.', 'Tỷ lệ hoàn thành trong ngày tăng 2,3 điểm phần trăm.'],
  },
  type: {
    title: 'Báo cáo theo loại văn bản', subtitle: 'Phân tích cơ cấu, tốc độ tăng trưởng và hiệu quả xử lý theo loại văn bản.',
    metrics: makeMetrics([['Loại văn bản', '12', 'Được chuẩn hóa toàn hệ thống'], ['Công văn', '68.420', 'Chiếm 37,06% tổng số'], ['Quyết định', '42.760', 'Chiếm 23,16% tổng số'], ['Tăng trưởng cao nhất', '+18,6%', 'Nhóm kế hoạch trong tháng 7']]),
    trendTitle: 'Xu hướng nhóm văn bản chính', trendSubtitle: 'Sản lượng 6 tháng gần nhất.',
    trendData: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((label, i) => ({ label, dispatch: 8200 + i * 570, decision: 5600 + i * 310, report: 4100 + i * 260, notice: 2900 + i * 185 })),
    trendSeries: [{ key: 'dispatch', name: 'Công văn', color: colors.blue }, { key: 'decision', name: 'Quyết định', color: colors.purple }, { key: 'report', name: 'Báo cáo', color: colors.green }, { key: 'notice', name: 'Thông báo', color: colors.orange }],
    breakdownTitle: 'Sản lượng và hoàn thành', breakdownSubtitle: 'So sánh tổng số với số đã hoàn thành xử lý.',
    breakdownData: [{ label: 'Công văn', total: 68420, completed: 65310 }, { label: 'Quyết định', total: 42760, completed: 41680 }, { label: 'Báo cáo', total: 31840, completed: 29750 }, { label: 'Thông báo', total: 22640, completed: 21980 }, { label: 'Kế hoạch', total: 12860, completed: 11970 }, { label: 'Khác', total: 6100, completed: 5710 }],
    breakdownSeries: [{ key: 'total', name: 'Tổng số', color: colors.blue }, { key: 'completed', name: 'Hoàn thành', color: colors.green }],
    distributionTitle: 'Cơ cấu loại văn bản', distributionSubtitle: 'Tỷ trọng theo tổng số văn bản trong kỳ.',
    distributionData: [{ name: 'Công văn', value: 68420 }, { name: 'Quyết định', value: 42760 }, { name: 'Báo cáo', value: 31840 }, { name: 'Thông báo', value: 22640 }, { name: 'Kế hoạch', value: 12860 }, { name: 'Khác', value: 6100 }],
    tableTitle: 'Hiệu quả theo loại văn bản', tableSubtitle: 'Số lượng, tỷ trọng và thời gian xử lý trung bình.',
    columns: [{ key: 'type', label: 'Loại văn bản' }, { key: 'quantity', label: 'Số lượng', align: 'right' }, { key: 'ratio', label: 'Tỷ trọng', align: 'center' }, { key: 'onTime', label: 'Đúng hạn', align: 'center' }, { key: 'avg', label: 'Xử lý TB', align: 'right' }],
    rows: [
      { type: 'Công văn', quantity: '68.420', ratio: '37,06%', onTime: '96,8%', avg: '4,2 giờ' }, { type: 'Quyết định', quantity: '42.760', ratio: '23,16%', onTime: '98,1%', avg: '3,6 giờ' },
      { type: 'Báo cáo', quantity: '31.840', ratio: '17,25%', onTime: '94,7%', avg: '6,8 giờ' }, { type: 'Thông báo', quantity: '22.640', ratio: '12,26%', onTime: '98,6%', avg: '2,4 giờ' },
      { type: 'Kế hoạch', quantity: '12.860', ratio: '6,97%', onTime: '93,1%', avg: '8,5 giờ' }, { type: 'Tờ trình', quantity: '3.280', ratio: '1,78%', onTime: '95,4%', avg: '7,2 giờ' },
      { type: 'Chỉ thị', quantity: '1.760', ratio: '0,95%', onTime: '97,2%', avg: '5,1 giờ' }, { type: 'Loại khác', quantity: '1.060', ratio: '0,57%', onTime: '92,8%', avg: '9,0 giờ' },
    ],
    insights: ['Công văn tiếp tục là nhóm lớn nhất, chiếm 37,06%.', 'Kế hoạch tăng nhanh nhất nhưng thời gian xử lý còn cao.', 'Thông báo có tỷ lệ đúng hạn tốt nhất: 98,6%.'],
  },
  delivery: {
    title: 'Báo cáo giao nhận', subtitle: 'Giám sát sản lượng, trạng thái ACK và chất lượng giao nhận văn bản.',
    metrics: makeMetrics([['Đã gửi', '181.420', 'Tăng 9,2% so với tháng trước'], ['Đã nhận', '179.936', '99,18% tổng lượt gửi'], ['ACK đúng hạn', '99,52%', 'Trong ngưỡng SLA vận hành'], ['Chờ xác nhận', '1.484', 'Giảm 328 giao dịch trong ngày']]),
    trendTitle: 'Giao nhận 7 ngày', trendSubtitle: 'Sản lượng gửi đi, nhận thành công và xác nhận ACK.',
    trendData: weekly.map((d) => ({ ...d, ack: Math.round(d.received * 0.995) })),
    trendSeries: [{ key: 'sent', name: 'Đã gửi', color: colors.blue }, { key: 'received', name: 'Đã nhận', color: colors.green }, { key: 'ack', name: 'Đã ACK', color: colors.purple }],
    breakdownTitle: 'Giao nhận theo tuyến', breakdownSubtitle: 'Sản lượng và số giao dịch nhận thành công.',
    breakdownData: [{ label: 'TW → Tỉnh', sent: 52640, received: 52130 }, { label: 'Tỉnh → TW', sent: 48120, received: 47680 }, { label: 'Nội tỉnh', sent: 62340, received: 61980 }, { label: 'Liên tỉnh', sent: 18320, received: 18146 }],
    breakdownSeries: [{ key: 'sent', name: 'Đã gửi', color: colors.blue }, { key: 'received', name: 'Đã nhận', color: colors.green }],
    distributionTitle: 'Trạng thái giao nhận', distributionSubtitle: 'Cơ cấu giao dịch tại thời điểm báo cáo.',
    distributionData: [{ name: 'Đã nhận', value: 179936 }, { name: 'Đã gửi', value: 824 }, { name: 'Đang gửi lại', value: 406 }, { name: 'Thất bại', value: 254 }],
    tableTitle: 'Chi tiết tuyến giao nhận', tableSubtitle: 'Các tuyến có lưu lượng cao nhất trong ngày.',
    columns: [{ key: 'route', label: 'Tuyến giao nhận' }, { key: 'sent', label: 'Đã gửi', align: 'right' }, { key: 'received', label: 'Đã nhận', align: 'right' }, { key: 'success', label: 'Thành công', align: 'center' }, { key: 'latency', label: 'Độ trễ TB', align: 'right' }],
    rows: [
      { route: 'UBND Hà Nội → Bộ Nội vụ', sent: '8.426', received: '8.389', success: '99,56%', latency: '2,2 giây' }, { route: 'Bộ Tài chính → Kho bạc Nhà nước', sent: '7.980', received: '7.954', success: '99,67%', latency: '1,9 giây' },
      { route: 'Bộ Công an → UBND các tỉnh', sent: '7.640', received: '7.584', success: '99,27%', latency: '2,8 giây' }, { route: 'UBND TP.HCM → Bộ Nội vụ', sent: '6.985', received: '6.932', success: '99,24%', latency: '3,0 giây' },
      { route: 'Bộ Tư pháp → Sở Tư pháp', sent: '6.470', received: '6.441', success: '99,55%', latency: '2,4 giây' }, { route: 'Sở Nội vụ → UBND quận, huyện', sent: '5.920', received: '5.865', success: '99,07%', latency: '3,2 giây' },
      { route: 'UBND Đà Nẵng → Bộ Tài chính', sent: '5.480', received: '5.462', success: '99,67%', latency: '2,1 giây' }, { route: 'Bộ GD&ĐT → Sở GD&ĐT', sent: '5.120', received: '5.086', success: '99,34%', latency: '2,7 giây' },
    ],
    insights: ['Tuyến nội tỉnh chiếm 34,36% tổng lưu lượng.', '99,52% ACK được phản hồi trong giới hạn 30 giây.', 'Ba tuyến có độ trễ trung bình trên 4 giây cần theo dõi.'],
  },
  error: {
    title: 'Báo cáo giao dịch lỗi', subtitle: 'Phân tích nguyên nhân, mức độ ảnh hưởng và tiến độ khắc phục giao dịch lỗi.',
    metrics: makeMetrics([['Tổng lỗi trong tháng', '1.246', 'Giảm 18,4% so với tháng trước'], ['Lỗi chưa xử lý', '86', '6,9% tổng số lỗi'], ['Thời gian khắc phục TB', '18 phút', 'Giảm 6 phút so với tháng 6'], ['Tỷ lệ lỗi', '0,35%', 'Thấp hơn ngưỡng cảnh báo 0,5%']]),
    trendTitle: 'Xu hướng lỗi 7 ngày', trendSubtitle: 'Số lỗi phát sinh, đã xử lý và còn tồn theo ngày.',
    trendData: [{ label: '15/07', opened: 186, resolved: 172, pending: 64 }, { label: '16/07', opened: 164, resolved: 170, pending: 58 }, { label: '17/07', opened: 198, resolved: 184, pending: 72 }, { label: '18/07', opened: 152, resolved: 168, pending: 56 }, { label: '19/07', opened: 138, resolved: 142, pending: 52 }, { label: '20/07', opened: 126, resolved: 133, pending: 45 }, { label: '21/07', opened: 142, resolved: 101, pending: 86 }],
    trendSeries: [{ key: 'opened', name: 'Phát sinh', color: colors.red }, { key: 'resolved', name: 'Đã xử lý', color: colors.green }, { key: 'pending', name: 'Còn tồn', color: colors.orange }],
    breakdownTitle: 'Lỗi theo nguyên nhân', breakdownSubtitle: 'Số lỗi phát sinh và đã khắc phục trong tháng.',
    breakdownData: [{ label: 'Timeout API', total: 386, resolved: 364 }, { label: 'Chữ ký số', total: 284, resolved: 270 }, { label: 'Định tuyến', total: 226, resolved: 210 }, { label: 'Xác thực', total: 164, resolved: 153 }, { label: 'Lưu trữ', total: 118, resolved: 105 }, { label: 'Khác', total: 68, resolved: 58 }],
    breakdownSeries: [{ key: 'total', name: 'Phát sinh', color: colors.red }, { key: 'resolved', name: 'Đã xử lý', color: colors.green }],
    distributionTitle: 'Cơ cấu nguyên nhân lỗi', distributionSubtitle: 'Tỷ trọng 1.246 lỗi trong kỳ.',
    distributionData: [{ name: 'Timeout API', value: 386 }, { name: 'Chữ ký số', value: 284 }, { name: 'Định tuyến', value: 226 }, { name: 'Xác thực', value: 164 }, { name: 'Lưu trữ', value: 118 }, { name: 'Khác', value: 68 }],
    tableTitle: 'Giao dịch lỗi gần đây', tableSubtitle: 'Danh sách mẫu phục vụ giám sát và điều phối xử lý.',
    columns: [{ key: 'id', label: 'Mã giao dịch' }, { key: 'time', label: 'Thời gian' }, { key: 'agency', label: 'Đơn vị' }, { key: 'reason', label: 'Nguyên nhân' }, { key: 'status', label: 'Trạng thái' }],
    rows: [
      { id: 'TX-210726-0842', time: '10:42:18', agency: 'UBND Hà Nội', reason: 'Timeout kết nối', status: 'Đang xử lý' }, { id: 'TX-210726-0838', time: '10:38:05', agency: 'Bộ Tài chính', reason: 'Chứng thư hết hạn', status: 'Đã khắc phục' },
      { id: 'TX-210726-0825', time: '10:25:44', agency: 'Sở Nội vụ', reason: 'Sai mã đơn vị nhận', status: 'Chờ đơn vị' }, { id: 'TX-210726-0819', time: '10:19:12', agency: 'Kho bạc Nhà nước', reason: 'Không thể lưu tệp', status: 'Đang xử lý' },
      { id: 'TX-210726-0807', time: '10:07:31', agency: 'UBND Đà Nẵng', reason: 'Token không hợp lệ', status: 'Đã khắc phục' }, { id: 'TX-210726-0758', time: '09:58:26', agency: 'Bộ Tư pháp', reason: 'Timeout kết nối', status: 'Đã gửi lại' },
      { id: 'TX-210726-0744', time: '09:44:03', agency: 'Sở GD&ĐT', reason: 'Sai định dạng chữ ký', status: 'Chờ đơn vị' }, { id: 'TX-210726-0731', time: '09:31:48', agency: 'UBND TP.HCM', reason: 'Lỗi định tuyến', status: 'Đã khắc phục' },
    ],
    insights: ['Timeout API chiếm 30,98% nhưng đã giảm liên tục 4 ngày.', '86 lỗi tồn đang được phân công cho 5 nhóm kỹ thuật.', '14 chứng thư số sẽ hết hạn trong 30 ngày tới.'],
  },
  retry: {
    title: 'Báo cáo giao dịch gửi lại', subtitle: 'Theo dõi hiệu quả cơ chế gửi lại tự động và các giao dịch cần can thiệp.',
    metrics: makeMetrics([['Tổng lượt gửi lại', '2.840', 'Giảm 12,7% so với tháng trước'], ['Thành công sau gửi lại', '2.712', 'Đạt tỷ lệ 95,49%'], ['Chờ gửi lại', '84', 'Theo lịch tự động trong 15 phút'], ['Cần can thiệp', '44', 'Gửi lại quá 3 lần']]),
    trendTitle: 'Gửi lại trong 7 ngày', trendSubtitle: 'Số giao dịch gửi lại và khôi phục thành công.',
    trendData: [{ label: '15/07', retry: 462, recovered: 438 }, { label: '16/07', retry: 426, recovered: 409 }, { label: '17/07', retry: 448, recovered: 421 }, { label: '18/07', retry: 398, recovered: 384 }, { label: '19/07', retry: 372, recovered: 360 }, { label: '20/07', retry: 326, recovered: 315 }, { label: '21/07', retry: 408, recovered: 385 }],
    trendSeries: [{ key: 'retry', name: 'Gửi lại', color: colors.orange }, { key: 'recovered', name: 'Khôi phục', color: colors.green }],
    breakdownTitle: 'Kết quả theo số lần gửi lại', breakdownSubtitle: 'Số giao dịch và số khôi phục thành công.',
    breakdownData: [{ label: 'Lần 1', total: 1840, recovered: 1802 }, { label: 'Lần 2', total: 682, recovered: 650 }, { label: 'Lần 3', total: 274, recovered: 238 }, { label: 'Lần 4+', total: 44, recovered: 22 }],
    breakdownSeries: [{ key: 'total', name: 'Tổng gửi lại', color: colors.orange }, { key: 'recovered', name: 'Thành công', color: colors.green }],
    distributionTitle: 'Phân bố số lần gửi lại', distributionSubtitle: 'Cơ cấu 2.840 giao dịch trong kỳ.',
    distributionData: [{ name: 'Lần 1', value: 1840 }, { name: 'Lần 2', value: 682 }, { name: 'Lần 3', value: 274 }, { name: 'Lần 4+', value: 44 }],
    tableTitle: 'Hàng đợi gửi lại', tableSubtitle: 'Các giao dịch đang chờ hoặc cần can thiệp thủ công.',
    columns: [{ key: 'id', label: 'Mã giao dịch' }, { key: 'agency', label: 'Đơn vị nhận' }, { key: 'attempt', label: 'Số lần', align: 'center' }, { key: 'next', label: 'Lần tiếp theo' }, { key: 'reason', label: 'Nguyên nhân' }],
    rows: [
      { id: 'TX-210726-0912', agency: 'UBND Hải Phòng', attempt: 1, next: '11:15', reason: 'Timeout API' }, { id: 'TX-210726-0905', agency: 'Sở Nội vụ Hà Nội', attempt: 2, next: '11:20', reason: 'Máy chủ bận' },
      { id: 'TX-210726-0857', agency: 'UBND Bình Dương', attempt: 3, next: '11:25', reason: 'Không nhận ACK' }, { id: 'TX-210726-0841', agency: 'Bộ Tài chính', attempt: 1, next: '11:28', reason: 'Timeout API' },
      { id: 'TX-210726-0822', agency: 'UBND Đà Nẵng', attempt: 4, next: 'Can thiệp', reason: 'Lỗi xác thực lặp lại' }, { id: 'TX-210726-0804', agency: 'Sở Tư pháp', attempt: 2, next: '11:35', reason: 'Máy chủ bảo trì' },
      { id: 'TX-210726-0750', agency: 'Kho bạc Nhà nước', attempt: 1, next: '11:40', reason: 'Kết nối bị ngắt' }, { id: 'TX-210726-0729', agency: 'UBND Cần Thơ', attempt: 3, next: '11:45', reason: 'Không nhận ACK' },
    ],
    insights: ['64,79% giao dịch được khôi phục ngay ở lần gửi lại đầu tiên.', '44 giao dịch gửi lại từ 4 lần cần can thiệp thủ công.', 'Khung giờ 08:30–09:30 có lượng gửi lại cao nhất.'],
  },
  agency: {
    title: 'Báo cáo theo đơn vị', subtitle: 'So sánh sản lượng, tỷ lệ thành công và mức đáp ứng SLA của các đơn vị.',
    metrics: makeMetrics([['Đơn vị kết nối', '128', '126 đơn vị đang hoạt động'], ['Đạt chuẩn SLA', '119', '92,97% tổng số đơn vị'], ['Sản lượng cao nhất', '28.640', 'UBND thành phố Hà Nội'], ['Độ trễ thấp nhất', '1,8 giây', 'Kho bạc Nhà nước']]),
    trendTitle: 'Sản lượng nhóm đơn vị dẫn đầu', trendSubtitle: 'Xu hướng giao dịch trong 6 tháng gần nhất.',
    trendData: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((label, i) => ({ label, hanoi: 16800 + i * 1700, hcm: 15200 + i * 1450, finance: 13800 + i * 1320, police: 12600 + i * 1180 })),
    trendSeries: [{ key: 'hanoi', name: 'UBND Hà Nội', color: colors.blue }, { key: 'hcm', name: 'UBND TP.HCM', color: colors.cyan }, { key: 'finance', name: 'Bộ Tài chính', color: colors.green }, { key: 'police', name: 'Bộ Công an', color: colors.purple }],
    breakdownTitle: 'Top đơn vị theo sản lượng', breakdownSubtitle: 'Tổng giao dịch gửi và nhận trong tháng.',
    breakdownData: [{ label: 'UBND Hà Nội', sent: 28640, received: 27420 }, { label: 'UBND TP.HCM', sent: 24980, received: 23860 }, { label: 'Bộ Tài chính', sent: 22840, received: 23620 }, { label: 'Bộ Công an', sent: 20560, received: 19840 }, { label: 'Bộ Nội vụ', sent: 18420, received: 21360 }, { label: 'Kho bạc NN', sent: 17680, received: 22940 }],
    breakdownSeries: [{ key: 'sent', name: 'Gửi đi', color: colors.blue }, { key: 'received', name: 'Nhận vào', color: colors.green }],
    distributionTitle: 'Mức đáp ứng SLA', distributionSubtitle: 'Phân nhóm 128 đơn vị đang kết nối.',
    distributionData: [{ name: 'Xuất sắc', value: 86 }, { name: 'Đạt', value: 33 }, { name: 'Cần cải thiện', value: 7 }, { name: 'Mất kết nối', value: 2 }],
    tableTitle: 'Xếp hạng hiệu quả đơn vị', tableSubtitle: 'Các đơn vị có sản lượng lớn và chất lượng kết nối tốt.',
    columns: [{ key: 'rank', label: 'Hạng', align: 'center' }, { key: 'agency', label: 'Đơn vị' }, { key: 'transactions', label: 'Giao dịch', align: 'right' }, { key: 'success', label: 'Thành công', align: 'center' }, { key: 'latency', label: 'Độ trễ', align: 'right' }],
    rows: [
      { rank: 1, agency: 'Kho bạc Nhà nước', transactions: '40.620', success: '99,92%', latency: '1,8 giây' }, { rank: 2, agency: 'Bộ Công an', transactions: '40.400', success: '99,88%', latency: '2,0 giây' },
      { rank: 3, agency: 'UBND thành phố Hà Nội', transactions: '56.060', success: '99,84%', latency: '2,1 giây' }, { rank: 4, agency: 'Bộ Tài chính', transactions: '46.460', success: '99,79%', latency: '2,2 giây' },
      { rank: 5, agency: 'Bộ Nội vụ', transactions: '39.780', success: '99,72%', latency: '2,4 giây' }, { rank: 6, agency: 'UBND Thành phố Hồ Chí Minh', transactions: '48.840', success: '99,68%', latency: '2,5 giây' },
      { rank: 7, agency: 'UBND thành phố Đà Nẵng', transactions: '32.440', success: '99,61%', latency: '2,6 giây' }, { rank: 8, agency: 'Bộ Tư pháp', transactions: '30.860', success: '99,55%', latency: '2,7 giây' },
    ],
    insights: ['119/128 đơn vị đáp ứng đầy đủ SLA vận hành.', 'Hai đơn vị đang mất kết nối do bảo trì theo kế hoạch.', 'UBND Hà Nội dẫn đầu sản lượng với 56.060 giao dịch hai chiều.'],
  },
  daily: {
    title: 'Báo cáo vận hành hằng ngày', subtitle: 'Tổng hợp sức khỏe hệ thống và hoạt động trong ngày 21/07/2026.',
    metrics: makeMetrics([['Giao dịch hôm nay', '51.120', 'Tăng 6,2% so với hôm qua'], ['Văn bản hôm nay', '24.860', 'Đạt 104% trung bình 30 ngày'], ['Hệ thống sẵn sàng', '99,98%', 'Không có gián đoạn nghiêm trọng'], ['Cảnh báo đang mở', '12', '3 cảnh báo mức độ cao']]),
    trendTitle: 'Lưu lượng theo giờ', trendSubtitle: 'Giao dịch gửi, nhận và lỗi từ 00:00 đến thời điểm hiện tại.',
    trendData: ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'].map((label, i) => ({ label, sent: [420, 280, 860, 4280, 2860, 3950, 2140, 960][i], received: [405, 271, 842, 4170, 2798, 3845, 2090, 934][i], error: [3, 2, 8, 32, 18, 26, 14, 7][i] })),
    trendSeries: [{ key: 'sent', name: 'Gửi đi', color: colors.blue }, { key: 'received', name: 'Nhận vào', color: colors.green }, { key: 'error', name: 'Lỗi', color: colors.red }],
    breakdownTitle: 'Tải theo dịch vụ', breakdownSubtitle: 'Số yêu cầu và số yêu cầu thành công trong ngày.',
    breakdownData: [{ label: 'Tiếp nhận', requests: 28460, success: 28370 }, { label: 'Gửi văn bản', requests: 26640, success: 26490 }, { label: 'Ký số', requests: 24780, success: 24695 }, { label: 'Lưu trữ', requests: 52140, success: 52082 }, { label: 'Tra cứu', requests: 68420, success: 68390 }],
    breakdownSeries: [{ key: 'requests', name: 'Yêu cầu', color: colors.blue }, { key: 'success', name: 'Thành công', color: colors.green }],
    distributionTitle: 'Cơ cấu cảnh báo', distributionSubtitle: '12 cảnh báo đang mở theo mức độ.',
    distributionData: [{ name: 'Thông tin', value: 4 }, { name: 'Cảnh báo', value: 5 }, { name: 'Nghiêm trọng', value: 3 }],
    tableTitle: 'Nhật ký vận hành trong ngày', tableSubtitle: 'Các sự kiện và công việc vận hành đáng chú ý.',
    columns: [{ key: 'time', label: 'Thời gian' }, { key: 'event', label: 'Sự kiện' }, { key: 'service', label: 'Dịch vụ' }, { key: 'duration', label: 'Thời lượng', align: 'right' }, { key: 'status', label: 'Trạng thái' }],
    rows: [
      { time: '08:12', event: 'Tăng tài nguyên tự động', service: 'API Gateway', duration: '2 phút', status: 'Hoàn thành' }, { time: '08:45', event: 'Cảnh báo độ trễ cao', service: 'Routing Service', duration: '6 phút', status: 'Đã khắc phục' },
      { time: '09:30', event: 'Đồng bộ chứng thư số', service: 'Signature Service', duration: '4 phút', status: 'Hoàn thành' }, { time: '10:05', event: 'Sao lưu định kỳ', service: 'Document Storage', duration: '18 phút', status: 'Hoàn thành' },
      { time: '11:20', event: 'Kiểm tra hàng đợi', service: 'Message Queue', duration: '3 phút', status: 'Ổn định' }, { time: '13:40', event: 'Cập nhật danh mục đơn vị', service: 'Agency Registry', duration: '5 phút', status: 'Hoàn thành' },
      { time: '15:15', event: 'Cảnh báo dung lượng', service: 'Object Storage', duration: 'Đang theo dõi', status: 'Đang xử lý' }, { time: '16:30', event: 'Kiểm tra SLA cuối ngày', service: 'Monitoring', duration: '7 phút', status: 'Đạt' },
    ],
    insights: ['Hệ thống duy trì 99,98% thời gian sẵn sàng trong ngày.', 'Đỉnh tải lúc 09:00 với 8.450 giao dịch/giờ.', 'Ba cảnh báo nghiêm trọng đã có người phụ trách.'],
  },
  export: {
    title: 'Xuất báo cáo', subtitle: 'Theo dõi khối lượng xuất dữ liệu, định dạng sử dụng và lịch chạy báo cáo.',
    metrics: makeMetrics([['Báo cáo đã xuất', '1.284', 'Tăng 16,8% so với tháng trước'], ['Dung lượng dữ liệu', '18,6 GB', 'Đã nén còn 6,2 GB'], ['Tỷ lệ thành công', '99,61%', '5 tác vụ thất bại trong tháng'], ['Thời gian tạo TB', '42 giây', 'Giảm 8 giây mỗi báo cáo']]),
    trendTitle: 'Lượt xuất báo cáo 7 ngày', trendSubtitle: 'Số tác vụ thành công và thất bại theo ngày.',
    trendData: [{ label: '15/07', success: 168, failed: 2 }, { label: '16/07', success: 182, failed: 1 }, { label: '17/07', success: 176, failed: 0 }, { label: '18/07', success: 205, failed: 1 }, { label: '19/07', success: 144, failed: 0 }, { label: '20/07', success: 126, failed: 0 }, { label: '21/07', success: 278, failed: 1 }],
    trendSeries: [{ key: 'success', name: 'Thành công', color: colors.green }, { key: 'failed', name: 'Thất bại', color: colors.red }],
    breakdownTitle: 'Lượt xuất theo nhóm báo cáo', breakdownSubtitle: 'Số báo cáo và dung lượng dữ liệu quy đổi (MB).',
    breakdownData: [{ label: 'Tổng quan', reports: 318, size: 2860 }, { label: 'Văn bản', reports: 286, size: 4620 }, { label: 'Giao nhận', reports: 242, size: 3980 }, { label: 'Theo đơn vị', reports: 196, size: 3240 }, { label: 'Lỗi & gửi lại', reports: 142, size: 2140 }, { label: 'Vận hành', reports: 100, size: 1760 }],
    breakdownSeries: [{ key: 'reports', name: 'Lượt xuất', color: colors.blue }, { key: 'size', name: 'Dung lượng (MB)', color: colors.purple }],
    distributionTitle: 'Định dạng báo cáo', distributionSubtitle: 'Cơ cấu 1.284 báo cáo đã xuất.',
    distributionData: [{ name: 'Excel', value: 642 }, { name: 'PDF', value: 386 }, { name: 'CSV', value: 154 }, { name: 'JSON/API', value: 102 }],
    tableTitle: 'Lịch sử xuất báo cáo', tableSubtitle: 'Các tác vụ xuất dữ liệu gần đây của người dùng hệ thống.',
    columns: [{ key: 'name', label: 'Tên báo cáo' }, { key: 'format', label: 'Định dạng' }, { key: 'creator', label: 'Người tạo' }, { key: 'createdAt', label: 'Thời gian' }, { key: 'size', label: 'Dung lượng', align: 'right' }, { key: 'status', label: 'Trạng thái' }],
    rows: [
      { name: 'Tổng quan vận hành 21/07', format: 'PDF', creator: 'Nguyễn Minh Anh', createdAt: '21/07 16:42', size: '8,4 MB', status: 'Hoàn thành' }, { name: 'Giao nhận theo đơn vị', format: 'Excel', creator: 'Trần Quốc Huy', createdAt: '21/07 16:18', size: '12,7 MB', status: 'Hoàn thành' },
      { name: 'Danh sách giao dịch lỗi', format: 'CSV', creator: 'Lê Thu Trang', createdAt: '21/07 15:55', size: '4,2 MB', status: 'Hoàn thành' }, { name: 'Dữ liệu BI trong ngày', format: 'JSON', creator: 'Tác vụ tự động', createdAt: '21/07 15:30', size: '28,6 MB', status: 'Hoàn thành' },
      { name: 'Văn bản nhận vào tháng 7', format: 'Excel', creator: 'Phạm Hải Nam', createdAt: '21/07 14:48', size: '16,9 MB', status: 'Hoàn thành' }, { name: 'Phân tích loại văn bản', format: 'PDF', creator: 'Vũ Hoàng Long', createdAt: '21/07 14:22', size: '6,8 MB', status: 'Hoàn thành' },
      { name: 'Hàng đợi gửi lại', format: 'Excel', creator: 'Ngô Mai Linh', createdAt: '21/07 13:56', size: '3,1 MB', status: 'Đang tạo' }, { name: 'SLA theo đơn vị quý II', format: 'PDF', creator: 'Đỗ Đức Anh', createdAt: '21/07 13:20', size: '9,5 MB', status: 'Hoàn thành' },
    ],
    insights: ['Excel là định dạng phổ biến nhất, chiếm đúng 50%.', 'Báo cáo văn bản tạo ra dung lượng dữ liệu lớn nhất.', 'Thời gian tạo trung bình giảm 16% nhờ xử lý nền song song.'],
  },
};
