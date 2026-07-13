export type StepStatus = 'pending' | 'active' | 'approved' | 'rejected' | 'skipped';

export type WorkflowPhase = 'INTERNAL' | 'FINAL' | 'EXTERNAL';

export type WorkflowStep = {
  id: string;
  order: number;
  phase: WorkflowPhase;
  level: number;
  name: string;
  role: string;
  assignee: string;
  requiredPermissions?: string[];
  status: StepStatus;
  comment?: string;
  actedAt?: string;
};

export type WorkflowInstance = {
  id: string;
  documentCode: string;
  title: string;
  submitter: string;
  unit: string;
  templateId?: string;
  currentStepId: string;
  overallStatus: 'Đang xử lý' | 'Chờ ký' | 'Hoàn tất nội bộ' | 'Đã gửi liên thông' | 'Từ chối';
  fileName?: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
};

export type SignatureType = 'initial' | 'main' | 'stamp';

export type PlacedSignature = {
  id: string;
  type: SignatureType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
};

export const SIGNATURE_PRESETS: { type: SignatureType; label: string; color: string }[] = [
  { type: 'initial', label: 'Ký nháy', color: '#1976d2' },
  { type: 'main', label: 'Ký chính', color: '#2e7d32' },
  { type: 'stamp', label: 'Đóng dấu', color: '#ed6c02' },
];

export const DEFAULT_WORKFLOW_TEMPLATE: Omit<WorkflowStep, 'id' | 'status' | 'actedAt' | 'comment'>[] = [
  {
    order: 1,
    phase: 'INTERNAL',
    level: 1,
    name: 'Trưởng phòng duyệt',
    role: 'Trưởng phòng',
    assignee: 'Nguyễn Văn A',
    requiredPermissions: ['WF_APPROVE'],
  },
  {
    order: 2,
    phase: 'INTERNAL',
    level: 2,
    name: 'Phó giám đốc duyệt',
    role: 'Phó GĐ',
    assignee: 'Trần Thị B',
    requiredPermissions: ['WF_APPROVE'],
  },
  {
    order: 3,
    phase: 'INTERNAL',
    level: 3,
    name: 'Giám đốc duyệt',
    role: 'Giám đốc',
    assignee: 'Lê Văn C',
    requiredPermissions: ['WF_APPROVE'],
  },
  {
    order: 4,
    phase: 'INTERNAL',
    level: 4,
    name: 'Văn thư kiểm tra',
    role: 'Văn thư',
    assignee: 'Phạm Thị D',
    requiredPermissions: ['DOC_REGISTER'],
  },
  {
    order: 5,
    phase: 'FINAL',
    level: 5,
    name: 'Lãnh đạo phê duyệt cuối',
    role: 'Lãnh đạo',
    assignee: 'Hoàng Văn E',
    requiredPermissions: ['WF_APPROVE'],
  },
  {
    order: 6,
    phase: 'INTERNAL',
    level: 6,
    name: 'Ký số trên file',
    role: 'Người ký',
    assignee: 'Hoàng Văn E',
    requiredPermissions: ['SIGN_PERSONAL', 'SIGN_ORG'],
  },
  { order: 7, phase: 'EXTERNAL', level: 7, name: 'Gửi liên thông', role: 'Hệ thống', assignee: 'Trục liên thông' },
];
