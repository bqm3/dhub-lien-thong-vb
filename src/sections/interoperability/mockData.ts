export type AgencyConnection = {
  code: string;
  name: string;
  level: string;
  clientId: string;
  apiKey: string;
  endpoint: string;
  credentialType: string;
  status: 'active' | 'pending' | 'warning';
  successRate: number;
  avgLatency: string;
};

export type DocumentRecord = {
  code: string;
  title: string;
  type: string;
  sender: string;
  receiver: string;
  version: string;
  classification: string;
  status: string;
  createdAt: string;
};

export type ExchangeTransaction = {
  id: string;
  documentCode: string;
  documentTitle?: string;
  documentType?: string;
  route: string;
  sender: string;
  senderPerson?: string;
  senderTitle?: string;
  receiver: string;
  status: 'sent' | 'received' | 'failed' | 'retrying';
  ack: 'ACK' | 'NACK' | 'WAITING';
  retries: number;
  sentAt?: string;
  receivedAt?: string;
  updatedAt: string;
  errorReason?: string;
  errorDetail?: string;
};

// Prefer richer JSON for demo UI
// eslint-disable-next-line import/no-named-as-default
import fakeData from './fakeData.json';

export const overviewMetrics = [
  { label: 'Tổng số văn bản', value: String(fakeData.documents.length), helper: `${fakeData.documents.length} văn bản trong hệ thống` },
  { label: 'Tổng giao dịch', value: String(fakeData.exchangeTransactions.length), helper: `${fakeData.exchangeTransactions.length} giao dịch liên thông` },
  { label: 'Tổng file đính kèm', value: String(fakeData.documents.length * 2), helper: 'Ước tính ~2 file/văn bản' },
  { label: 'Đơn vị tham gia', value: String(fakeData.agencies.length), helper: `${fakeData.agencies.filter((a) => a.status === 'active').length} active / ${fakeData.agencies.filter((a) => a.status === 'pending').length} pending` },
  {
    label: 'Tỷ lệ thành công',
    value: `${(fakeData.exchangeTransactions.filter((t) => t.status === 'received' || t.status === 'sent').length / fakeData.exchangeTransactions.length * 100).toFixed(1)}%`,
    helper: `${fakeData.exchangeTransactions.filter((t) => t.status === 'received' || t.status === 'sent').length}/${fakeData.exchangeTransactions.length} giao dịch thành công`,
  },
  {
    label: 'Tỷ lệ lỗi',
    value: `${(fakeData.exchangeTransactions.filter((t) => t.status === 'failed').length / fakeData.exchangeTransactions.length * 100).toFixed(1)}%`,
    helper: `${fakeData.exchangeTransactions.filter((t) => t.status === 'failed').length} giao dịch thất bại`,
  },
];

export const integrationFunctions = [
  'Đăng ký đơn vị',
  'Cấp Client ID',
  'Cấp API Key',
  'Quản lý Endpoint',
  'Quản lý Credential',
];

export const documentFunctions = [
  'Document Registry',
  'Document Metadata Management',
  'Document Repository',
  'Attachment Management',
  'Document Version Management',
  'Document Lifecycle Management',
  'Document Search & Retrieval',
  'Document Classification',
  'Document Security Management',
  'Document Retention & Archive',
  'Document Audit Trail',
];

export const exchangeFunctions = [
  'Document Submission',
  'Document Delivery',
  'Routing Management',
  'Recipient Management',
  'Message Exchange Management',
  'Delivery Tracking',
  'Acknowledgement Management',
  'Status Management',
  'Retry & Error Handling',
  'Transaction Management',
  'Exchange Policy',
  'Exchange Audit',
];

export const agencies: AgencyConnection[] = fakeData.agencies as AgencyConnection[];

export const documents: DocumentRecord[] = fakeData.documents as DocumentRecord[];

export const exchangeTransactions: ExchangeTransaction[] = fakeData.exchangeTransactions as ExchangeTransaction[];

export const documentLifecycle = [
  'Tạo mới',
  'Đăng ký',
  'Ký số',
  'Phát hành',
  'Gửi liên thông',
  'Tiếp nhận',
  'Xử lý',
  'Lưu trữ',
  'Tra cứu',
  'Archive/Hủy',
];

export const reportCatalog = [
  'Báo cáo tổng quan hệ thống',
  'Báo cáo văn bản',
  'Báo cáo văn bản nhận vào',
  'Báo cáo theo loại văn bản',
  'Báo cáo giao nhận',
  'Báo cáo giao dịch lỗi',
  'Báo cáo retry',
  'Báo cáo theo đơn vị',
  'Báo cáo vận hành hàng ngày',
  'Export Report',
];

export const reportHighlights = [
  { label: 'QUYẾT ĐỊNH', value: 22 },
  { label: 'CÔNG VĂN', value: 45 },
  { label: 'BÁO CÁO', value: 20 },
  { label: 'THÔNG BÁO', value: 8 },
  { label: 'KẾ HOẠCH', value: 5 },
];

export const deliveryStatusSummary = [
  { label: 'SENT', value: 12400 },
  { label: 'RECEIVED', value: 11850 },
  { label: 'RETRYING', value: 320 },
  { label: 'FAILED', value: 430 },
];

export const errorSummary = [
  { label: 'API Timeout', value: 215 },
  { label: 'Signature Error', value: 172 },
  { label: 'Routing Error', value: 118 },
  { label: 'Storage Error', value: 64 },
  { label: 'Auth Failed', value: 31 },
];

export const retrySummary = [
  { label: 'Lần 1', value: 520 },
  { label: 'Lần 2', value: 210 },
  { label: 'Lần 3', value: 85 },
  { label: 'Lần 4+', value: 25 },
];

export const topAgencies = {
  senders: [
    'UBND Hà Nội: 8,240 văn bản',
    'Bộ Thông tin và Truyền thông: 6,500 văn bản',
    'Sở Nội Vụ: 5,180 văn bản',
    'Bộ Công an: 4,970 văn bản',
    'UBND TP.HCM: 4,600 văn bản',
  ],
  receivers: [
    'Sở Nội Vụ: 50,000 văn bản',
    'Sở TTTT: 45,200 văn bản',
    'UBND Hà Nội: 39,800 văn bản',
    'Bộ Tài chính: 32,400 văn bản',
    'Kho bạc Nhà nước: 28,750 văn bản',
  ],
  sla: [
    'SO_NOI_VU | Nhận thành công: 99.8% | Avg: 3.1s',
    'KBNN | Nhận thành công: 99.7% | Avg: 2.9s',
    'UBND_HANOI | Nhận thành công: 99.5% | Avg: 2.8s',
    'BO_CONG_AN | Nhận thành công: 99.9% | Avg: 2.5s',
    'SO_Y_TE_HN | Nhận thành công: 99.4% | Avg: 3.1s',
  ],
};

export const apiEndpoints = [
  {
    method: 'POST',
    path: '/api/integrations/agencies',
    auth: 'Bearer + API Key',
    description: 'Đăng ký đơn vị tham gia trục liên thông',
  },
  {
    method: 'POST',
    path: '/api/integrations/credentials/issue',
    auth: 'Bearer',
    description: 'Cấp Client ID, API Key và cấu hình credential',
  },
  {
    method: 'POST',
    path: '/api/documents',
    auth: 'Bearer + Signature',
    description: 'Đăng ký mới văn bản điện tử',
  },
  {
    method: 'GET',
    path: '/api/documents/{documentCode}',
    auth: 'Bearer',
    description: 'Lấy chi tiết metadata, file đính kèm và lịch sử',
  },
  {
    method: 'POST',
    path: '/api/exchange/submit',
    auth: 'Bearer + Signature',
    description: 'Gửi văn bản vào trục liên thông',
  },
  {
    method: 'POST',
    path: '/api/exchange/ack',
    auth: 'Bearer',
    description: 'Gửi ACK/NACK xác nhận đã nhận văn bản',
  },
  {
    method: 'GET',
    path: '/api/reports/daily-operation',
    auth: 'Bearer',
    description: 'Lấy báo cáo vận hành hàng ngày',
  },
  {
    method: 'GET',
    path: '/api/reports/export?format=excel|pdf',
    auth: 'Bearer',
    description: 'Export báo cáo ra Excel/PDF',
  },
];

export const sampleAgencyRequest = `{
  "agencyCode": "UBND_HANOI",
  "agencyName": "UBND Hà Nội",
  "category": "TINH_THANH",
  "contactEmail": "admin@hanoi.gov.vn",
  "endpoint": "https://ubnd.hanoi.gov.vn/api/lienthong",
  "credentialType": "OAUTH2_MTLS"
}`;

export const sampleDocumentRequest = `{
  "documentCode": "VB-2026-000145",
  "title": "Công văn về kế hoạch chuyển đổi số cấp tỉnh",
  "documentType": "CONG_VAN",
  "senderCode": "UBND_HANOI",
  "receiverCodes": ["BO_TTTT", "SO_TTTT"],
  "classification": "NOI_BO",
  "attachments": [
    {
      "fileName": "cong-van.pdf",
      "contentType": "application/pdf",
      "size": 2489031
    }
  ]
}`;

export const sampleExchangeResponse = `{
  "transactionId": "TX-240625-1001",
  "status": "RECEIVED",
  "ackStatus": "ACK",
  "receivedAt": "2026-06-25T08:18:22+07:00",
  "route": [
    "UBND_HANOI",
    "TRUC_LIEN_THONG",
    "BO_TTTT"
  ]
}`;
