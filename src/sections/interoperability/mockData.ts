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
  route: string;
  sender: string;
  receiver: string;
  status: 'sent' | 'received' | 'failed' | 'retrying';
  ack: 'ACK' | 'NACK' | 'WAITING';
  retries: number;
  updatedAt: string;
};

// Prefer richer JSON for demo UI
// eslint-disable-next-line import/no-named-as-default
import fakeData from './fakeData.json';

export const overviewMetrics = [
  { label: 'Tổng số văn bản', value: String(fakeData.documents.length), helper: 'Dataset demo (JSON)' },
  { label: 'Tổng giao dịch', value: String(fakeData.exchangeTransactions.length), helper: 'Dataset demo (JSON)' },
  { label: 'Đơn vị tham gia', value: String(fakeData.agencies.length), helper: 'Dataset demo (JSON)' },
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
  { label: 'QUYẾT ĐỊNH', value: 30 },
  { label: 'CÔNG VĂN', value: 50 },
  { label: 'BÁO CÁO', value: 20 },
];

export const deliveryStatusSummary = [
  { label: 'SENT', value: 10000 },
  { label: 'RECEIVED', value: 9800 },
  { label: 'FAILED', value: 200 },
];

export const errorSummary = [
  { label: 'API Timeout', value: 200 },
  { label: 'Signature Error', value: 150 },
  { label: 'Routing Error', value: 100 },
  { label: 'Storage Error', value: 50 },
];

export const retrySummary = [
  { label: 'Lần 1', value: 500 },
  { label: 'Lần 2', value: 200 },
];

export const topAgencies = {
  senders: ['UBND Hà Nội', 'Bộ TTTT', 'Sở Nội Vụ'],
  receivers: ['Sở Nội Vụ: 50,000', 'Sở TTTT: 45,000', 'UBND Hà Nội: 39,500'],
  sla: 'SO_NOI_VU | Receive success: 99.8% | Avg: 3s',
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
