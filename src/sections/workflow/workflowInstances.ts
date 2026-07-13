import { DEFAULT_WORKFLOW_TEMPLATE, WorkflowInstance, WorkflowStep } from './workflowTypes';
import { WorkflowTemplate } from './workflowTemplates';

function buildSteps(activeIndex: number, templateSteps = DEFAULT_WORKFLOW_TEMPLATE): WorkflowStep[] {
  return templateSteps.map((tpl, index) => {
    let status: WorkflowStep['status'] = 'pending';
    if (index < activeIndex) status = 'approved';
    else if (index === activeIndex) status = 'active';
    return {
      ...tpl,
      id: `step-${tpl.order}`,
      status,
      actedAt: index < activeIndex ? `0${index + 1}/07/2026 10:${index}0` : undefined,
      comment: index < activeIndex ? 'Đồng ý' : undefined,
    };
  });
}

export const workflowInstances: WorkflowInstance[] = [
  {
    id: 'WF-INT-001',
    documentCode: 'VB-NB-2026-0145',
    title: 'Công văn trình ký kế hoạch chuyển đổi số Q3',
    submitter: 'Chuyên viên CNTT',
    unit: 'Phòng CNTT',
    templateId: 'TPL-INTERNAL-DEFAULT',
    currentStepId: 'step-3',
    overallStatus: 'Đang xử lý',
    fileName: 'cong-van-ke-hoach.pdf',
    steps: buildSteps(2),
    createdAt: '05/07/2026 08:00',
    updatedAt: '07/07/2026 14:30',
  },
  {
    id: 'WF-INT-002',
    documentCode: 'VB-NB-2026-0146',
    title: 'Quyết định phê duyệt quy trình nội bộ',
    submitter: 'Văn phòng',
    unit: 'Văn phòng UBND',
    templateId: 'TPL-INTERNAL-DEFAULT',
    currentStepId: 'step-6',
    overallStatus: 'Chờ ký',
    fileName: 'quyet-dinh.pdf',
    steps: buildSteps(5),
    createdAt: '01/07/2026 09:15',
    updatedAt: '08/07/2026 10:00',
  },
  {
    id: 'WF-INT-003',
    documentCode: 'VB-NB-2026-0140',
    title: 'Báo cáo tổng kết liên thông Q2',
    submitter: 'Sở TTTT',
    unit: 'Sở TTTT',
    templateId: 'TPL-INTERNAL-DEFAULT',
    currentStepId: 'step-7',
    overallStatus: 'Đã gửi liên thông',
    fileName: 'bao-cao-q2.pdf',
    steps: buildSteps(7),
    createdAt: '20/06/2026 11:00',
    updatedAt: '28/06/2026 16:45',
  },
];

export function createWorkflowInstance(
  title: string,
  submitter: string,
  unit: string,
  template?: Pick<WorkflowTemplate, 'id' | 'steps'>
): WorkflowInstance {
  const id = `WF-INT-${String(Date.now()).slice(-6)}`;
  const templateId = template?.id ?? 'TPL-INTERNAL-DEFAULT';
  const steps = buildSteps(0, template?.steps ?? DEFAULT_WORKFLOW_TEMPLATE);
  return {
    id,
    documentCode: `VB-NB-2026-${String(Date.now()).slice(-4)}`,
    title,
    submitter,
    unit,
    templateId,
    currentStepId: 'step-1',
    overallStatus: 'Đang xử lý',
    steps,
    createdAt: new Date().toLocaleString('vi-VN'),
    updatedAt: new Date().toLocaleString('vi-VN'),
  };
}
