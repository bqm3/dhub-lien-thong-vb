import { Button, Grid, LinearProgress, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { workflowTrackings, WorkflowTracking } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: WorkflowTracking = {
  id: '',
  documentCode: '',
  currentStep: '',
  handler: '',
  progress: 0,
  dueDate: '',
  overdue: 'Không',
};

export default function WorkflowTrackingPage() {
  const crud = useCrudList(workflowTrackings, emptyForm, 'id', {
    generateId: () => `TK-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    currentStep: item.currentStep,
    handler: item.handler,
    progress: (
      <Stack spacing={0.5} sx={{ minWidth: 100 }}>
        <LinearProgress variant="determinate" value={item.progress} sx={{ height: 8, borderRadius: 99 }} />
        <span style={{ fontSize: 12 }}>{item.progress}%</span>
      </Stack>
    ),
    dueDate: item.dueDate,
    overdue: <StatusChip status={item.overdue === 'Có' ? 'failed' : 'active'} />,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Theo dõi xử lý"
      subtitle="Ai đang xử lý, xử lý đến bước nào, quá hạn hay chưa."
      metrics={[
        { label: 'Đang theo dõi', value: crud.rows.length, helper: 'Tiến độ xử lý', icon: 'solar:chart-2-bold' },
        { label: 'Quá hạn', value: crud.rows.filter((d) => d.overdue === 'Có').length, helper: 'Cần xử lý gấp', icon: 'solar:alarm-bold' },
        { label: 'TB tiến độ', value: `${Math.round(crud.rows.reduce((s, d) => s + d.progress, 0) / (crud.rows.length || 1))}%`, helper: 'Trung bình', icon: 'solar:graph-up-bold' },
        { label: 'Hoàn thành', value: crud.rows.filter((d) => d.progress === 100).length, helper: '100%', icon: 'solar:check-circle-bold' },
      ]}
      listTitle="Danh sách theo dõi"
      listSubtitle="CRUD theo dõi tiến độ qua popup modal."
      addLabel="Thêm theo dõi"
      searchPlaceholder="Số văn bản, bước xử lý, người xử lý"
      deleteEntityLabel="bản ghi theo dõi"
      editorCreateTitle="Thêm theo dõi"
      editorEditTitle="Cập nhật theo dõi"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'currentStep', label: 'Bước hiện tại' },
        { key: 'handler', label: 'Người xử lý' },
        { key: 'progress', label: 'Tiến độ', align: 'center' },
        { key: 'dueDate', label: 'Hạn', align: 'center' },
        { key: 'overdue', label: 'Quá hạn', align: 'center' },
        { key: 'actions', label: 'Thao tác', align: 'right' },
      ]}
      tableRows={tableRows}
      keyword={crud.keyword}
      onKeywordChange={crud.setKeyword}
      openEditor={crud.openEditor}
      editingId={crud.editingId}
      deletingId={crud.deletingId}
      onOpenCreate={crud.handleOpenCreate}
      onCloseEditor={() => crud.setOpenEditor(false)}
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.handler))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Bước hiện tại" value={crud.formValues.currentStep}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, currentStep: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người xử lý" value={crud.formValues.handler}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, handler: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Tiến độ (%)" type="number" value={crud.formValues.progress}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, progress: Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Hạn xử lý" value={crud.formValues.dueDate}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, dueDate: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Quá hạn" select value={crud.formValues.overdue}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, overdue: e.target.value }))}>
              <MenuItem value="Không">Không</MenuItem>
              <MenuItem value="Có">Có</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
