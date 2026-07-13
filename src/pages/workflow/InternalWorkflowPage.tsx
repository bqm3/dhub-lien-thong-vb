import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Iconify from '../../components/iconify';
import { MetricCard, PageShell, SectionCard, StatusChip } from '../../sections/interoperability/components';
import WorkflowPipeline from '../../sections/workflow/components/WorkflowPipeline';
import SignatureStudio from '../../sections/workflow/components/SignatureStudio';
import { createWorkflowInstance, workflowInstances as initialInstances } from '../../sections/workflow/workflowInstances';
import { PlacedSignature, WorkflowInstance, WorkflowStep } from '../../sections/workflow/workflowTypes';
import { loadWorkflowTemplates, saveWorkflowTemplates, WorkflowTemplate, WorkflowTemplateStep } from '../../sections/workflow/workflowTemplates';
import { useAuthContext } from '../../auth/useAuthContext';
import { hasPermissions } from '../../auth/permissions';

function advanceStep(instance: WorkflowInstance, decision: 'approve' | 'reject', comment: string): WorkflowInstance {
  const activeIdx = instance.steps.findIndex((s) => s.status === 'active');
  if (activeIdx < 0) return instance;

  const steps = instance.steps.map((step, idx) => {
    if (idx === activeIdx) {
      return {
        ...step,
        status: decision === 'approve' ? ('approved' as const) : ('rejected' as const),
        comment,
        actedAt: new Date().toLocaleString('vi-VN'),
      };
    }
    if (decision === 'approve' && idx === activeIdx + 1) {
      return { ...step, status: 'active' as const };
    }
    return step;
  });

  const nextActive = steps.find((s) => s.status === 'active');
  const { overallStatus: initialStatus } = instance;
  let overallStatus = initialStatus;
  if (decision === 'reject') overallStatus = 'Từ chối';
  else if (!nextActive) overallStatus = 'Hoàn tất nội bộ';
  else if (nextActive.name.includes('Ký số')) overallStatus = 'Chờ ký';
  else if (nextActive.phase === 'EXTERNAL') overallStatus = 'Đã gửi liên thông';

  return {
    ...instance,
    steps,
    currentStepId: nextActive?.id ?? instance.currentStepId,
    overallStatus,
    updatedAt: new Date().toLocaleString('vi-VN'),
  };
}

function StepTimeline({ steps }: { steps: WorkflowStep[] }) {
  return (
    <Stack spacing={1.5}>
      {steps.map((step) => (
        <Box
          key={step.id}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: step.status === 'active' ? 'warning.main' : 'divider',
            bgcolor: step.status === 'active' ? 'warning.light' : 'background.neutral',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label={step.phase} size="small" color={step.phase === 'FINAL' ? 'secondary' : step.phase === 'EXTERNAL' ? 'success' : 'primary'} />
                <Typography variant="subtitle2">
                  L{step.level}: {step.name}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {step.role} — {step.assignee}
              </Typography>
              {step.comment && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  "{step.comment}"
                </Typography>
              )}
            </Box>
            <StatusChip
              status={
                step.status === 'approved'
                  ? 'Đã phát hành'
                  : step.status === 'active'
                    ? 'Đang xử lý'
                    : step.status === 'rejected'
                      ? 'failed'
                      : 'pending'
              }
            />
          </Stack>
          {step.actedAt && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {step.actedAt}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}

export default function InternalWorkflowPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const [instances, setInstances] = useState<WorkflowInstance[]>(initialInstances);
  const [selectedId, setSelectedId] = useState<string>(initialInstances[0]?.id ?? '');
  const [tab, setTab] = useState(0);
  const [comment, setComment] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubmitter, setNewSubmitter] = useState('');
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(() => loadWorkflowTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? 'TPL-INTERNAL-DEFAULT');
  const [openTemplateEditor, setOpenTemplateEditor] = useState(false);
  const [tplIdEditing, setTplIdEditing] = useState<string | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplSteps, setTplSteps] = useState<WorkflowTemplateStep[]>([]);

  const selected = useMemo(
    () => instances.find((i) => i.id === selectedId) ?? instances[0],
    [instances, selectedId]
  );

  const activeStep = selected?.steps.find((s) => s.status === 'active');
  const isSignStep = activeStep?.name.includes('Ký số');
  const canApprove =
    activeStep &&
    !isSignStep &&
    activeStep.phase !== 'EXTERNAL' &&
    hasPermissions({ userPermissions: user?.permissions, required: activeStep.requiredPermissions });

  function handleDecision(decision: 'approve' | 'reject') {
    if (!selected) return;
    const updated = advanceStep(selected, decision, comment || (decision === 'approve' ? 'Đồng ý' : 'Không đồng ý'));
    setInstances((prev) => prev.map((i) => (i.id === selected.id ? updated : i)));
    setComment('');
    enqueueSnackbar(decision === 'approve' ? 'Đã phê duyệt bước hiện tại' : 'Đã từ chối', {
      variant: decision === 'approve' ? 'success' : 'warning',
    });
    if (updated.steps.find((s) => s.status === 'active')?.name.includes('Ký số')) {
      setTab(1);
    }
  }

  function handleSignComplete(sigs: PlacedSignature[]) {
    if (!selected) return;
    enqueueSnackbar(`Đã đặt ${sigs.length} chữ ký — chuyển bước gửi liên thông`, { variant: 'success' });
    const updated = advanceStep(selected, 'approve', `Đã ký ${sigs.length} vị trí`);
    setInstances((prev) => prev.map((i) => (i.id === selected.id ? updated : i)));
    setTab(0);
  }

  function handleCreate() {
    if (!newTitle || !newSubmitter) return;
    const template = templates.find((t) => t.id === selectedTemplateId);
    const item = createWorkflowInstance(newTitle, newSubmitter, 'Phòng CNTT', template ? { id: template.id, steps: template.steps } : undefined);
    setInstances((prev) => [item, ...prev]);
    setSelectedId(item.id);
    setOpenCreate(false);
    setNewTitle('');
    setNewSubmitter('');
    enqueueSnackbar('Đã tạo luồng INTERNAL mới', { variant: 'success' });
  }

  function openNewTemplate() {
    setTplIdEditing(null);
    setTplName('');
    setTplDesc('');
    setTplSteps([
      {
        order: 1,
        phase: 'INTERNAL',
        level: 1,
        name: 'Bước duyệt L1',
        role: 'Trưởng phòng',
        assignee: 'Nguyễn Văn A',
        requiredPermissions: ['WF_APPROVE'],
      },
    ]);
    setOpenTemplateEditor(true);
  }

  function openEditTemplate(template: WorkflowTemplate) {
    setTplIdEditing(template.id);
    setTplName(template.name);
    setTplDesc(template.description ?? '');
    setTplSteps(template.steps.map((s) => ({ ...s })));
    setOpenTemplateEditor(true);
  }

  function persistTemplates(next: WorkflowTemplate[]) {
    setTemplates(next);
    saveWorkflowTemplates(next);
  }

  function handleSaveTemplate() {
    if (!tplName.trim() || tplSteps.length === 0) return;

    const now = new Date().toLocaleString('vi-VN');
    const normalizedSteps = tplSteps
      .filter((s) => s.name.trim())
      .map((s, idx) => ({
        ...s,
        order: idx + 1,
        level: idx + 1,
        requiredPermissions: (s.requiredPermissions ?? []).filter(Boolean),
      }));

    if (tplIdEditing) {
      const next = templates.map((t) =>
        t.id === tplIdEditing
          ? { ...t, name: tplName.trim(), description: tplDesc.trim() || undefined, steps: normalizedSteps, updatedAt: now }
          : t
      );
      persistTemplates(next);
      enqueueSnackbar('Đã cập nhật mẫu luồng', { variant: 'success' });
    } else {
      const id = `TPL-INTERNAL-${String(Date.now()).slice(-6)}`;
      const newTpl: WorkflowTemplate = {
        id,
        name: tplName.trim(),
        description: tplDesc.trim() || undefined,
        steps: normalizedSteps,
        createdAt: now,
        updatedAt: now,
      };
      const next = [newTpl, ...templates];
      persistTemplates(next);
      setSelectedTemplateId(newTpl.id);
      enqueueSnackbar('Đã tạo mẫu luồng INTERNAL mới', { variant: 'success' });
    }

    setOpenTemplateEditor(false);
  }

  if (!selected) return null;

  return (
    <PageShell
      title="Luồng INTERNAL — Duyệt nhiều cấp"
      subtitle="Soạn thảo → duyệt L1/L2/L3... → FINAL → Ký số (kéo thả chữ ký) → Gửi liên thông ra bên ngoài."
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard
            title="Mẫu luồng INTERNAL (Template)"
            subtitle="Tạo/sửa mẫu luồng: cấu hình các bước + gán permission được phép phê duyệt ở từng bước. (Fake lưu localStorage)"
            action={
              <Button size="small" variant="contained" onClick={openNewTemplate}>
                Tạo luồng INTERNAL mới
              </Button>
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Chọn mẫu luồng dùng khi tạo instance"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {templates.slice(0, 6).map((t) => (
                    <Chip
                      key={t.id}
                      label={t.id === selectedTemplateId ? `${t.name} (đang chọn)` : t.name}
                      variant={t.id === selectedTemplateId ? 'filled' : 'outlined'}
                      color={t.id === selectedTemplateId ? 'primary' : 'default'}
                      onClick={() => setSelectedTemplateId(t.id)}
                      onDelete={() => openEditTemplate(t)}
                      deleteIcon={<Iconify icon="solar:pen-bold" width={18} />}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Mẹo: bấm icon bút trên chip để chỉnh sửa mẫu.
                </Typography>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Luồng đang chạy" value={instances.filter((i) => i.overallStatus === 'Đang xử lý').length} helper="INTERNAL" icon="solar:route-bold" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Chờ ký số" value={instances.filter((i) => i.overallStatus === 'Chờ ký').length} helper="Bước ký file" icon="solar:pen-new-square-bold" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Đã gửi ra ngoài" value={instances.filter((i) => i.overallStatus === 'Đã gửi liên thông').length} helper="EXTERNAL" icon="solar:upload-bold" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Số bước / luồng" value={selected.steps.length} helper="Nhiều cấp duyệt" icon="solar:layers-bold" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Danh sách luồng"
            subtitle="Chọn luồng INTERNAL để xử lý"
            action={
              <Button size="small" variant="contained" onClick={() => setOpenCreate(true)}>
                Tạo luồng
              </Button>
            }
          >
            <List disablePadding>
              {instances.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={item.id === selected.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setTab(0);
                  }}
                  sx={{ borderRadius: 1.5, mb: 1, bgcolor: 'background.neutral' }}
                >
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography variant="caption">{item.documentCode}</Typography>
                        <WorkflowPipeline steps={item.steps} compact />
                      </Stack>
                    }
                  />
                  <StatusChip status={item.overallStatus} />
                </ListItemButton>
              ))}
            </List>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={8}>
          <SectionCard title={selected.title} subtitle={`${selected.documentCode} · ${selected.unit}`}>
            <WorkflowPipeline steps={selected.steps} />

            <Divider sx={{ my: 3 }} />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Phê duyệt & Tiến độ" icon={<Iconify icon="solar:clipboard-check-bold" width={18} />} iconPosition="start" />
              <Tab
                label="Ký số — Upload & Kéo thả"
                icon={<Iconify icon="solar:pen-new-square-bold" width={18} />}
                iconPosition="start"
              />
            </Tabs>

            {tab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Chi tiết từng bước duyệt
                  </Typography>
                  <StepTimeline steps={selected.steps} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Bước hiện tại
                    </Typography>
                    {activeStep ? (
                      <>
                        <Chip label={activeStep.phase} size="small" sx={{ mb: 1 }} />
                        <Typography variant="body1" fontWeight={600}>
                          {activeStep.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {activeStep.assignee} ({activeStep.role})
                        </Typography>

                        {canApprove && (
                          <>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              label="Ý kiến xử lý"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                            <Stack direction="row" spacing={1}>
                              <Button variant="contained" color="success" onClick={() => handleDecision('approve')}>
                                Duyệt
                              </Button>
                              <Button variant="outlined" color="warning" onClick={() => handleDecision('reject')}>
                                Từ chối
                              </Button>
                              <Button variant="outlined" onClick={() => handleDecision('approve')}>
                                Yêu cầu sửa
                              </Button>
                            </Stack>
                          </>
                        )}

                        {isSignStep && (
                          <Button variant="contained" onClick={() => setTab(1)} startIcon={<Iconify icon="solar:pen-bold" />}>
                            Mở màn hình ký số
                          </Button>
                        )}

                        {activeStep.phase === 'EXTERNAL' && activeStep.status === 'active' && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleDecision('approve')}
                            startIcon={<Iconify icon="solar:upload-bold" />}
                          >
                            Gửi liên thông
                          </Button>
                        )}
                      </>
                    ) : (
                      <Typography color="text.secondary">Luồng đã hoàn tất</Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>
            )}

            {tab === 1 && (
              <SignatureStudio fileName={selected.fileName} onSignComplete={handleSignComplete} />
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tạo luồng INTERNAL mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Trích yếu văn bản" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <TextField fullWidth label="Người trình" value={newSubmitter} onChange={(e) => setNewSubmitter(e.target.value)} />
            <TextField
              select
              fullWidth
              label="Mẫu luồng (template)"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              SelectProps={{ native: true }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </TextField>
            <Typography variant="caption" color="text.secondary">
              Luồng mặc định: L1 Trưởng phòng → L2 Phó GĐ → L3 Giám đốc → Văn thư → FINAL Lãnh đạo → Ký số → Gửi liên thông
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTemplateEditor} onClose={() => setOpenTemplateEditor(false)} fullWidth maxWidth="md">
        <DialogTitle>{tplIdEditing ? 'Chỉnh sửa mẫu luồng INTERNAL' : 'Tạo mẫu luồng INTERNAL mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Tên mẫu luồng" value={tplName} onChange={(e) => setTplName(e.target.value)} />
            <TextField fullWidth label="Mô tả" value={tplDesc} onChange={(e) => setTplDesc(e.target.value)} />

            <Divider />

            <Typography variant="subtitle2">Danh sách bước</Typography>
            <Stack spacing={1.5}>
              {tplSteps.map((step, idx) => (
                <Card key={idx} sx={{ p: 2, bgcolor: 'background.neutral' }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={`Tên bước (L${idx + 1})`}
                        value={step.name}
                        onChange={(e) =>
                          setTplSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, name: e.target.value } : s)))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        select
                        label="Phase"
                        value={step.phase}
                        onChange={(e) =>
                          setTplSteps((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, phase: e.target.value as WorkflowTemplateStep['phase'] } : s))
                          )
                        }
                        SelectProps={{ native: true }}
                      >
                        <option value="INTERNAL">INTERNAL</option>
                        <option value="FINAL">FINAL</option>
                        <option value="EXTERNAL">EXTERNAL</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Role hiển thị"
                        value={step.role}
                        onChange={(e) =>
                          setTplSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, role: e.target.value } : s)))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Assignee hiển thị"
                        value={step.assignee}
                        onChange={(e) =>
                          setTplSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, assignee: e.target.value } : s)))
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Required permissions (phân tách bằng dấu phẩy)"
                        value={(step.requiredPermissions ?? []).join(',')}
                        onChange={(e) => {
                          const perms = e.target.value
                            .split(',')
                            .map((x) => x.trim())
                            .filter(Boolean);
                          setTplSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, requiredPermissions: perms } : s)));
                        }}
                        helperText="Ví dụ: WF_APPROVE, WF_REJECT hoặc SIGN_PERSONAL, SIGN_ORG"
                      />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setTplSteps((prev) => prev.filter((_, i) => i !== idx))}
                      disabled={tplSteps.length <= 1}
                    >
                      Xóa bước
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setTplSteps((prev) => {
                          const next = [...prev];
                          if (idx > 0) [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          return next;
                        })
                      }
                      disabled={idx === 0}
                    >
                      Lên
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setTplSteps((prev) => {
                          const next = [...prev];
                          if (idx < next.length - 1) [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                          return next;
                        })
                      }
                      disabled={idx === tplSteps.length - 1}
                    >
                      Xuống
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Button
              variant="outlined"
              onClick={() =>
                setTplSteps((prev) => [
                  ...prev,
                  {
                    order: prev.length + 1,
                    level: prev.length + 1,
                    phase: 'INTERNAL',
                    name: `Bước duyệt L${prev.length + 1}`,
                    role: 'Lãnh đạo',
                    assignee: '—',
                    requiredPermissions: ['WF_APPROVE'],
                  },
                ])
              }
            >
              Thêm bước
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateEditor(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            Lưu mẫu
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
