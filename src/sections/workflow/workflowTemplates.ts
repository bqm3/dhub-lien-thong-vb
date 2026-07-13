import { DEFAULT_WORKFLOW_TEMPLATE, WorkflowPhase, WorkflowStep } from './workflowTypes';

export type WorkflowTemplateStep = Omit<WorkflowStep, 'id' | 'status' | 'actedAt' | 'comment'> & {
  requiredPermissions?: string[];
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowTemplateStep[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'workflowTemplates.v1';

const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'TPL-INTERNAL-DEFAULT',
    name: 'INTERNAL — Mẫu mặc định (nhiều cấp)',
    description: 'Trình duyệt nhiều cấp → FINAL → Ký số → Gửi liên thông',
    steps: DEFAULT_WORKFLOW_TEMPLATE.map((s) => ({ ...s })),
    createdAt: '01/07/2026 08:00',
    updatedAt: '01/07/2026 08:00',
  },
];

export function normalizeTemplateSteps(steps: WorkflowTemplateStep[]): WorkflowTemplateStep[] {
  // Ensure order/level are consistent and sorted
  return steps
    .map((s, idx) => ({
      ...s,
      order: Number.isFinite(s.order) ? s.order : idx + 1,
      level: Number.isFinite(s.level) ? s.level : idx + 1,
      phase: (s.phase ?? 'INTERNAL') as WorkflowPhase,
      requiredPermissions: (s.requiredPermissions ?? []).filter(Boolean),
    }))
    .sort((a, b) => a.order - b.order)
    .map((s, idx) => ({ ...s, order: idx + 1, level: idx + 1 }));
}

export function loadWorkflowTemplates(): WorkflowTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw) as WorkflowTemplate[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TEMPLATES;
    return parsed.map((t) => ({ ...t, steps: normalizeTemplateSteps(t.steps ?? []) }));
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveWorkflowTemplates(templates: WorkflowTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

