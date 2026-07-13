// Quản lý văn bản
export type OutgoingDoc = {
  code: string;
  title: string;
  type: string;
  receiver: string;
  urgency: string;
  status: string;
  createdAt: string;
};

export type IncomingDoc = {
  code: string;
  title: string;
  sender: string;
  assignedTo: string;
  deadline: string;
  status: string;
};

export type InternalDoc = {
  code: string;
  title: string;
  fromDept: string;
  toDept: string;
  status: string;
  createdAt: string;
};

export type Dossier = {
  code: string;
  name: string;
  docCount: number;
  owner: string;
  status: string;
  updatedAt: string;
};

export type Attachment = {
  id: string;
  fileName: string;
  documentCode: string;
  fileType: string;
  size: string;
  version: string;
};

// Luồng xử lý
export type WorkflowSubmit = {
  id: string;
  documentCode: string;
  title: string;
  submitter: string;
  approver: string;
  status: string;
  submittedAt: string;
};

export type WorkflowApprove = {
  id: string;
  documentCode: string;
  title: string;
  approver: string;
  decision: string;
  comment: string;
  updatedAt: string;
};

export type WorkflowAssign = {
  id: string;
  documentCode: string;
  assigner: string;
  assignee: string;
  deadline: string;
  status: string;
};

export type WorkflowTracking = {
  id: string;
  documentCode: string;
  currentStep: string;
  handler: string;
  progress: number;
  dueDate: string;
  overdue: string;
};

// Ký số
export type PersonalSign = {
  id: string;
  documentCode: string;
  signer: string;
  signType: string;
  status: string;
  signedAt: string;
};

export type OrgSign = {
  id: string;
  documentCode: string;
  orgName: string;
  stampType: string;
  status: string;
  signedAt: string;
};

export type SignHistory = {
  id: string;
  documentCode: string;
  signer: string;
  signType: string;
  result: string;
  signedAt: string;
};

export type SignVerification = {
  id: string;
  documentCode: string;
  fileName: string;
  signer: string;
  certificate: string;
  signTime: string;
  verifyResult: string;
  verifiedAt: string;
};

// Liên thông
export type SendInterop = {
  id: string;
  documentCode: string;
  receiver: string;
  route: string;
  status: string;
  sentAt: string;
};

export type ReceiveInterop = {
  id: string;
  documentCode: string;
  sender: string;
  receivedAt: string;
  status: string;
};

export type Acknowledgement = {
  id: string;
  transactionId: string;
  documentCode: string;
  ackCode: string;
  status: string;
  ackAt: string;
};

export type SyncStatus = {
  id: string;
  transactionId: string;
  documentCode: string;
  syncStatus: string;
  lastSyncAt: string;
};

export type RetryQueue = {
  id: string;
  transactionId: string;
  documentCode: string;
  errorType: string;
  retries: number;
  status: string;
};

// Lưu trữ
export type FileStorage = {
  id: string;
  fileName: string;
  path: string;
  size: string;
  type: string;
  uploadedAt: string;
};

export type FileVersion = {
  id: string;
  fileName: string;
  documentCode: string;
  version: string;
  status: string;
  updatedAt: string;
};

export type DocumentPreview = {
  id: string;
  fileName: string;
  documentCode: string;
  fileType: string;
  previewStatus: string;
  pageCount: number;
  lastViewedAt: string;
};

// Thông báo
export type Notification = {
  id: string;
  title: string;
  type: string;
  recipient: string;
  read: string;
  createdAt: string;
};

export const outgoingDocs: OutgoingDoc[] = [
  {
    code: 'VB-DI-001',
    title: 'Công văn gửi Bộ TTTT về chuyển đổi số',
    type: 'Công văn',
    receiver: 'Bộ TTTT',
    urgency: 'Thường',
    status: 'Đã phát hành',
    createdAt: '25/06/2026 08:00',
  },
  {
    code: 'VB-DI-002',
    title: 'Quyết định phê duyệt quy trình liên thông',
    type: 'Quyết định',
    receiver: 'Sở TTTT',
    urgency: 'Khẩn',
    status: 'Chờ ký',
    createdAt: '26/06/2026 10:30',
  },
];

export const incomingDocs: IncomingDoc[] = [
  {
    code: 'VB-DEN-001',
    title: 'Công văn yêu cầu báo cáo quý II',
    sender: 'Bộ TTTT',
    assignedTo: 'Phòng CNTT',
    deadline: '15/07/2026',
    status: 'Đang xử lý',
  },
  {
    code: 'VB-DEN-002',
    title: 'Thông báo họp điều phối liên thông',
    sender: 'UBND Hà Nội',
    assignedTo: 'Văn phòng',
    deadline: '10/07/2026',
    status: 'Chờ phân luồng',
  },
];

export const internalDocs: InternalDoc[] = [
  {
    code: 'VB-NB-001',
    title: 'Phiếu trình ký nội bộ',
    fromDept: 'Phòng CNTT',
    toDept: 'Văn phòng',
    status: 'Đang duyệt',
    createdAt: '01/07/2026 09:00',
  },
];

export const dossiers: Dossier[] = [
  {
    code: 'HS-001',
    name: 'Hồ sơ triển khai liên thông Q2/2026',
    docCount: 12,
    owner: 'Phòng CNTT',
    status: 'Đang mở',
    updatedAt: '02/07/2026 14:00',
  },
];

export const attachments: Attachment[] = [
  {
    id: 'ATT-001',
    fileName: 'cong-van.pdf',
    documentCode: 'VB-DI-001',
    fileType: 'PDF',
    size: '2.4 MB',
    version: 'v1',
  },
  {
    id: 'ATT-002',
    fileName: 'phu-luc.docx',
    documentCode: 'VB-DI-001',
    fileType: 'DOCX',
    size: '856 KB',
    version: 'v2',
  },
];

export const workflowSubmits: WorkflowSubmit[] = [
  {
    id: 'WF-001',
    documentCode: 'VB-DI-002',
    title: 'Quyết định phê duyệt quy trình',
    submitter: 'Nguyễn Văn A',
    approver: 'Lê Văn C',
    status: 'Chờ duyệt',
    submittedAt: '26/06/2026 11:00',
  },
];

export const workflowApproves: WorkflowApprove[] = [
  {
    id: 'AP-001',
    documentCode: 'VB-DI-001',
    title: 'Công văn gửi Bộ TTTT',
    approver: 'Lê Văn C',
    decision: 'Duyệt',
    comment: 'Đồng ý phát hành',
    updatedAt: '25/06/2026 09:30',
  },
];

export const workflowAssigns: WorkflowAssign[] = [
  {
    id: 'AS-001',
    documentCode: 'VB-DEN-001',
    assigner: 'Lê Văn C',
    assignee: 'Trần Thị B',
    deadline: '15/07/2026',
    status: 'Đang xử lý',
  },
];

export const workflowTrackings: WorkflowTracking[] = [
  {
    id: 'TK-001',
    documentCode: 'VB-DEN-001',
    currentStep: 'Xử lý chuyên môn',
    handler: 'Trần Thị B',
    progress: 60,
    dueDate: '15/07/2026',
    overdue: 'Không',
  },
];

export const personalSigns: PersonalSign[] = [
  {
    id: 'KS-001',
    documentCode: 'VB-DI-001',
    signer: 'Lê Văn C',
    signType: 'Ký chính',
    status: 'Thành công',
    signedAt: '25/06/2026 08:45',
  },
];

export const orgSigns: OrgSign[] = [
  {
    id: 'KT-001',
    documentCode: 'VB-DI-001',
    orgName: 'UBND Hà Nội',
    stampType: 'Đóng dấu điện tử',
    status: 'Thành công',
    signedAt: '25/06/2026 09:00',
  },
];

export const signHistories: SignHistory[] = [
  {
    id: 'LH-001',
    documentCode: 'VB-DI-001',
    signer: 'Lê Văn C',
    signType: 'Ký cá nhân',
    result: 'Thành công',
    signedAt: '25/06/2026 08:45',
  },
  {
    id: 'LH-002',
    documentCode: 'VB-DI-001',
    signer: 'UBND Hà Nội',
    signType: 'Ký tổ chức',
    result: 'Thành công',
    signedAt: '25/06/2026 09:00',
  },
];

export const signVerifications: SignVerification[] = [
  {
    id: 'XT-001',
    documentCode: 'VB-DI-001',
    fileName: 'cong-van.pdf',
    signer: 'Lê Văn C',
    certificate: 'CN=Lê Văn C, O=UBND Hà Nội',
    signTime: '25/06/2026 08:45',
    verifyResult: 'Hợp lệ',
    verifiedAt: '25/06/2026 10:00',
  },
  {
    id: 'XT-002',
    documentCode: 'VB-DI-002',
    fileName: 'quyet-dinh.pdf',
    signer: 'Trần Thị B',
    certificate: 'CN=Trần Thị B, O=Sở TTTT',
    signTime: '26/06/2026 14:20',
    verifyResult: 'Không hợp lệ',
    verifiedAt: '26/06/2026 15:00',
  },
];

export const sendInterops: SendInterop[] = [
  {
    id: 'LT-G-001',
    documentCode: 'VB-DI-001',
    receiver: 'Bộ TTTT',
    route: 'UBND_HN -> TRUC_LT -> BO_TTTT',
    status: 'Đã gửi',
    sentAt: '25/06/2026 09:15',
  },
];

export const receiveInterops: ReceiveInterop[] = [
  {
    id: 'LT-N-001',
    documentCode: 'VB-DEN-001',
    sender: 'Bộ TTTT',
    receivedAt: '24/06/2026 16:30',
    status: 'Đã nhận',
  },
];

export const acknowledgements: Acknowledgement[] = [
  {
    id: 'BN-001',
    transactionId: 'TX-240625-1001',
    documentCode: 'VB-DI-001',
    ackCode: 'ACK-78901',
    status: 'ACK',
    ackAt: '25/06/2026 09:18',
  },
];

export const syncStatuses: SyncStatus[] = [
  {
    id: 'DB-001',
    transactionId: 'TX-240625-1001',
    documentCode: 'VB-DI-001',
    syncStatus: 'Đã đồng bộ',
    lastSyncAt: '25/06/2026 09:20',
  },
];

export const retryQueues: RetryQueue[] = [
  {
    id: 'RT-001',
    transactionId: 'TX-240625-1003',
    documentCode: 'VB-2026-000147',
    errorType: 'API Timeout',
    retries: 1,
    status: 'Đang retry',
  },
];

export const fileStorages: FileStorage[] = [
  {
    id: 'FS-001',
    fileName: 'cong-van.pdf',
    path: '/storage/2026/06/cong-van.pdf',
    size: '2.4 MB',
    type: 'PDF',
    uploadedAt: '25/06/2026 08:10',
  },
];

export const fileVersions: FileVersion[] = [
  {
    id: 'FV-001',
    fileName: 'cong-van.pdf',
    documentCode: 'VB-DI-001',
    version: 'v3',
    status: 'Đã ký',
    updatedAt: '25/06/2026 09:00',
  },
  {
    id: 'FV-002',
    fileName: 'cong-van.pdf',
    documentCode: 'VB-DI-001',
    version: 'v2',
    status: 'Đã duyệt',
    updatedAt: '25/06/2026 08:30',
  },
];

export const documentPreviews: DocumentPreview[] = [
  {
    id: 'PV-001',
    fileName: 'cong-van.pdf',
    documentCode: 'VB-DI-001',
    fileType: 'PDF',
    previewStatus: 'Sẵn sàng',
    pageCount: 5,
    lastViewedAt: '02/07/2026 09:30',
  },
  {
    id: 'PV-002',
    fileName: 'phu-luc.docx',
    documentCode: 'VB-DI-001',
    fileType: 'DOCX',
    previewStatus: 'Sẵn sàng',
    pageCount: 3,
    lastViewedAt: '01/07/2026 16:45',
  },
  {
    id: 'PV-003',
    fileName: 'bao-cao.pdf',
    documentCode: 'VB-DEN-001',
    fileType: 'PDF',
    previewStatus: 'Đang xử lý',
    pageCount: 12,
    lastViewedAt: '-',
  },
];

export const notifications: Notification[] = [
  {
    id: 'NT-001',
    title: 'Có văn bản mới cần duyệt',
    type: 'Cần duyệt',
    recipient: 'Lê Văn C',
    read: 'Chưa đọc',
    createdAt: '02/07/2026 08:00',
  },
  {
    id: 'NT-002',
    title: 'Văn bản quá hạn xử lý',
    type: 'Cảnh báo',
    recipient: 'Trần Thị B',
    read: 'Đã đọc',
    createdAt: '01/07/2026 17:30',
  },
];
