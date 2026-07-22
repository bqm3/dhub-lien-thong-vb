// QuÃ¡ÂºÂ£n lÃƒÂ½ vÃ„Æ’n bÃ¡ÂºÂ£n
export type OutgoingDoc = {
  code: string;
  title: string;
  type: string;
  receiver: string;
  urgency: string;
  status: string;
  createdAt: string;
  attachments?: string[];
  signProvider?: string;
  signStatus?: string;
};

export type IncomingDoc = {
  code: string;
  title: string;
  sender: string;
  assignedTo: string;
  deadline: string;
  status: string;
  attachments?: string[];
};

export type InternalDoc = {
  code: string;
  title: string;
  fromDept: string;
  toDept: string;
  status: string;
  createdAt: string;
  attachments?: string[];
  signProvider?: string;
  signStatus?: string;
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

// LuÃ¡Â»â€œng xÃ¡Â»Â­ lÃƒÂ½
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
  attachments?: string[];
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

// KÃƒÂ½ sÃ¡Â»â€˜
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

// LiÃƒÂªn thÃƒÂ´ng
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
  attachments?: string[];
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
  attachments?: string[];
};

// LÃ†Â°u trÃ¡Â»Â¯
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

// ThÃƒÂ´ng bÃƒÂ¡o
export type Notification = {
  id: string;
  title: string;
  type: string;
  recipient: string;
  read: string;
  createdAt: string;
  attachments?: string[];
  signProvider?: string;
  signStatus?: string;
};

export const outgoingDocs: OutgoingDoc[] = [
  {
    code: 'VB-DI-001',
    title: 'CÃƒÂ´ng vÃ„Æ’n gÃ¡Â»Â­i BÃ¡Â»â„¢ TTTT vÃ¡Â»Â chuyÃ¡Â»Æ’n Ã„â€˜Ã¡Â»â€¢i sÃ¡Â»â€˜',
    type: 'CÃƒÂ´ng vÃ„Æ’n',
    receiver: 'BÃ¡Â»â„¢ TTTT',
    urgency: 'ThÃ†Â°Ã¡Â»Âng',
    status: 'Ã„ÂÃƒÂ£ phÃƒÂ¡t hÃƒÂ nh',
    createdAt: '25/06/2026 08:00',
  },
  {
    code: 'VB-DI-002',
    title: 'QuyÃ¡ÂºÂ¿t Ã„â€˜Ã¡Â»â€¹nh phÃƒÂª duyÃ¡Â»â€¡t quy trÃƒÂ¬nh liÃƒÂªn thÃƒÂ´ng',
    type: 'QuyÃ¡ÂºÂ¿t Ã„â€˜Ã¡Â»â€¹nh',
    receiver: 'SÃ¡Â»Å¸ TTTT',
    urgency: 'KhÃ¡ÂºÂ©n',
    status: 'ChÃ¡Â»Â kÃƒÂ½',
    createdAt: '26/06/2026 10:30',
  },
];

export const incomingDocs: IncomingDoc[] = [
  {
    code: 'VB-DEN-001',
    title: 'CÃƒÂ´ng vÃ„Æ’n yÃƒÂªu cÃ¡ÂºÂ§u bÃƒÂ¡o cÃƒÂ¡o quÃƒÂ½ II',
    sender: 'BÃ¡Â»â„¢ TTTT',
    assignedTo: 'PhÃƒÂ²ng CNTT',
    deadline: '15/07/2026',
    status: 'Ã„Âang xÃ¡Â»Â­ lÃƒÂ½',
  },
  {
    code: 'VB-DEN-002',
    title: 'ThÃƒÂ´ng bÃƒÂ¡o hÃ¡Â»Âp Ã„â€˜iÃ¡Â»Âu phÃ¡Â»â€˜i liÃƒÂªn thÃƒÂ´ng',
    sender: 'UBND HÃƒÂ  NÃ¡Â»â„¢i',
    assignedTo: 'VÃ„Æ’n phÃƒÂ²ng',
    deadline: '10/07/2026',
    status: 'ChÃ¡Â»Â phÃƒÂ¢n luÃ¡Â»â€œng',
  },
];

export const internalDocs: InternalDoc[] = [
  {
    code: 'VB-NB-001',
    title: 'PhiÃ¡ÂºÂ¿u trÃƒÂ¬nh kÃƒÂ½ nÃ¡Â»â„¢i bÃ¡Â»â„¢',
    fromDept: 'PhÃƒÂ²ng CNTT',
    toDept: 'VÃ„Æ’n phÃƒÂ²ng',
    status: 'Ã„Âang duyÃ¡Â»â€¡t',
    createdAt: '01/07/2026 09:00',
  },
];

export const dossiers: Dossier[] = [
  {
    code: 'HS-001',
    name: 'HÃ¡Â»â€œ sÃ†Â¡ triÃ¡Â»Æ’n khai liÃƒÂªn thÃƒÂ´ng Q2/2026',
    docCount: 12,
    owner: 'PhÃƒÂ²ng CNTT',
    status: 'Ã„Âang mÃ¡Â»Å¸',
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
    title: 'QuyÃ¡ÂºÂ¿t Ã„â€˜Ã¡Â»â€¹nh phÃƒÂª duyÃ¡Â»â€¡t quy trÃƒÂ¬nh',
    submitter: 'NguyÃ¡Â»â€¦n VÃ„Æ’n A',
    approver: 'LÃƒÂª VÃ„Æ’n C',
    status: 'ChÃ¡Â»Â duyÃ¡Â»â€¡t',
    submittedAt: '26/06/2026 11:00',
  },
];

export const workflowApproves: WorkflowApprove[] = [
  {
    id: 'AP-001',
    documentCode: 'VB-DI-001',
    title: 'CÃƒÂ´ng vÃ„Æ’n gÃ¡Â»Â­i BÃ¡Â»â„¢ TTTT',
    approver: 'LÃƒÂª VÃ„Æ’n C',
    decision: 'DuyÃ¡Â»â€¡t',
    comment: 'Ã„ÂÃ¡Â»â€œng ÃƒÂ½ phÃƒÂ¡t hÃƒÂ nh',
    updatedAt: '25/06/2026 09:30',
  },
];

export const workflowAssigns: WorkflowAssign[] = [
  {
    id: 'AS-001',
    documentCode: 'VB-DEN-001',
    assigner: 'LÃƒÂª VÃ„Æ’n C',
    assignee: 'TrÃ¡ÂºÂ§n ThÃ¡Â»â€¹ B',
    deadline: '15/07/2026',
    status: 'Ã„Âang xÃ¡Â»Â­ lÃƒÂ½',
  },
];

export const workflowTrackings: WorkflowTracking[] = [
  {
    id: 'TK-001',
    documentCode: 'VB-DEN-001',
    currentStep: 'XÃ¡Â»Â­ lÃƒÂ½ chuyÃƒÂªn mÃƒÂ´n',
    handler: 'TrÃ¡ÂºÂ§n ThÃ¡Â»â€¹ B',
    progress: 60,
    dueDate: '15/07/2026',
    overdue: 'KhÃƒÂ´ng',
  },
];

export const personalSigns: PersonalSign[] = [
  {
    id: 'KS-001',
    documentCode: 'VB-DI-001',
    signer: 'LÃƒÂª VÃ„Æ’n C',
    signType: 'KÃƒÂ½ chÃƒÂ­nh',
    status: 'ThÃƒÂ nh cÃƒÂ´ng',
    signedAt: '25/06/2026 08:45',
  },
];

export const orgSigns: OrgSign[] = [
  {
    id: 'KT-001',
    documentCode: 'VB-DI-001',
    orgName: 'UBND HÃƒÂ  NÃ¡Â»â„¢i',
    stampType: 'Ã„ÂÃƒÂ³ng dÃ¡ÂºÂ¥u Ã„â€˜iÃ¡Â»â€¡n tÃ¡Â»Â­',
    status: 'ThÃƒÂ nh cÃƒÂ´ng',
    signedAt: '25/06/2026 09:00',
  },
];

export const signHistories: SignHistory[] = [
  {
    id: 'LH-001',
    documentCode: 'VB-DI-001',
    signer: 'LÃƒÂª VÃ„Æ’n C',
    signType: 'KÃƒÂ½ cÃƒÂ¡ nhÃƒÂ¢n',
    result: 'ThÃƒÂ nh cÃƒÂ´ng',
    signedAt: '25/06/2026 08:45',
  },
  {
    id: 'LH-002',
    documentCode: 'VB-DI-001',
    signer: 'UBND HÃƒÂ  NÃ¡Â»â„¢i',
    signType: 'KÃƒÂ½ tÃ¡Â»â€¢ chÃ¡Â»Â©c',
    result: 'ThÃƒÂ nh cÃƒÂ´ng',
    signedAt: '25/06/2026 09:00',
  },
];

export const signVerifications: SignVerification[] = [
  {
    id: 'XT-001',
    documentCode: 'VB-DI-001',
    fileName: 'cong-van.pdf',
    signer: 'LÃƒÂª VÃ„Æ’n C',
    certificate: 'CN=LÃƒÂª VÃ„Æ’n C, O=UBND HÃƒÂ  NÃ¡Â»â„¢i',
    signTime: '25/06/2026 08:45',
    verifyResult: 'HÃ¡Â»Â£p lÃ¡Â»â€¡',
    verifiedAt: '25/06/2026 10:00',
  },
  {
    id: 'XT-002',
    documentCode: 'VB-DI-002',
    fileName: 'quyet-dinh.pdf',
    signer: 'TrÃ¡ÂºÂ§n ThÃ¡Â»â€¹ B',
    certificate: 'CN=TrÃ¡ÂºÂ§n ThÃ¡Â»â€¹ B, O=SÃ¡Â»Å¸ TTTT',
    signTime: '26/06/2026 14:20',
    verifyResult: 'KhÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡',
    verifiedAt: '26/06/2026 15:00',
  },
];

export const sendInterops: SendInterop[] = [
  {
    id: 'LT-G-001',
    documentCode: 'VB-DI-001',
    receiver: 'BÃ¡Â»â„¢ TTTT',
    route: 'UBND_HN -> TRUC_LT -> BO_TTTT',
    status: 'Ã„ÂÃƒÂ£ gÃ¡Â»Â­i',
    sentAt: '25/06/2026 09:15',
  },
];

export const receiveInterops: ReceiveInterop[] = [
  {
    id: 'LT-N-001',
    documentCode: 'VB-DEN-001',
    sender: 'BÃ¡Â»â„¢ TTTT',
    receivedAt: '24/06/2026 16:30',
    status: 'Ã„ÂÃƒÂ£ nhÃ¡ÂºÂ­n',
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
    syncStatus: 'Ã„ÂÃƒÂ£ Ã„â€˜Ã¡Â»â€œng bÃ¡Â»â„¢',
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
    status: 'Ã„Âang retry',
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
    status: 'Ã„ÂÃƒÂ£ kÃƒÂ½',
    updatedAt: '25/06/2026 09:00',
  },
  {
    id: 'FV-002',
    fileName: 'cong-van.pdf',
    documentCode: 'VB-DI-001',
    version: 'v2',
    status: 'Ã„ÂÃƒÂ£ duyÃ¡Â»â€¡t',
    updatedAt: '25/06/2026 08:30',
  },
];

export const documentPreviews: DocumentPreview[] = [
  {
    id: 'PV-001',
    fileName: 'cong-van.pdf',
    documentCode: 'VB-DI-001',
    fileType: 'PDF',
    previewStatus: 'SÃ¡ÂºÂµn sÃƒÂ ng',
    pageCount: 5,
    lastViewedAt: '02/07/2026 09:30',
  },
  {
    id: 'PV-002',
    fileName: 'phu-luc.docx',
    documentCode: 'VB-DI-001',
    fileType: 'DOCX',
    previewStatus: 'SÃ¡ÂºÂµn sÃƒÂ ng',
    pageCount: 3,
    lastViewedAt: '01/07/2026 16:45',
  },
  {
    id: 'PV-003',
    fileName: 'bao-cao.pdf',
    documentCode: 'VB-DEN-001',
    fileType: 'PDF',
    previewStatus: 'Ã„Âang xÃ¡Â»Â­ lÃƒÂ½',
    pageCount: 12,
    lastViewedAt: '-',
  },
];

export const notifications: Notification[] = [
  {
    id: 'NT-001',
    title: 'CÃƒÂ³ vÃ„Æ’n bÃ¡ÂºÂ£n mÃ¡Â»â€ºi cÃ¡ÂºÂ§n duyÃ¡Â»â€¡t',
    type: 'CÃ¡ÂºÂ§n duyÃ¡Â»â€¡t',
    recipient: 'LÃƒÂª VÃ„Æ’n C',
    read: 'ChÃ†Â°a Ã„â€˜Ã¡Â»Âc',
    createdAt: '02/07/2026 08:00',
  },
  {
    id: 'NT-002',
    title: 'VÃ„Æ’n bÃ¡ÂºÂ£n quÃƒÂ¡ hÃ¡ÂºÂ¡n xÃ¡Â»Â­ lÃƒÂ½',
    type: 'CÃ¡ÂºÂ£nh bÃƒÂ¡o',
    recipient: 'TrÃ¡ÂºÂ§n ThÃ¡Â»â€¹ B',
    read: 'Ã„ÂÃƒÂ£ Ã„â€˜Ã¡Â»Âc',
    createdAt: '01/07/2026 17:30',
  },
];
