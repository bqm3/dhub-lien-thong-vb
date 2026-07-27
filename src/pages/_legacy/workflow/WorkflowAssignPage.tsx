import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { workflowAssigns, WorkflowAssign } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: WorkflowAssign = {
  id: '',
  documentCode: '',
  assigner: '',
  assignee: '',
  deadline: '',
  status: 'Đang xử lý',
};

export default function WorkflowAssignPage() {
  const crud = useCrudList(workflowAssigns, emptyForm, 'id', {
    generateId: () => `AS-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    assigner: item.assigner,
    assignee: item.assignee,
    deadline: item.deadline,
    status: <StatusChip status={item.status} />,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Giao việc"
      subtitle="Lãnh đạo giao cho phòng ban/cá nhân xử lý văn bản đến."
      metrics={[
        { label: 'Tổng giao việc', value: crud.rows.length, helper: 'Phân công', icon: 'solar:user-hand-up-bold' },
        { label: 'Đang xử lý', value: crud.rows.filter((d) => d.status === 'Đang xử lý').length, helper: 'Chưa hoàn thành', icon: 'solar:clock-circle-bold' },
        { label: 'Hoàn thành', value: crud.rows.filter((d) => d.status === 'Hoàn thành').length, helper: 'Đã xử lý', icon: 'solar:check-circle-bold' },
        { label: 'Quá hạn', value: crud.rows.filter((d) => d.status === 'Quá hạn').length, helper: 'Cần nhắc', icon: 'solar:alarm-bold' },
      ]}
      listTitle="Danh sách giao việc"
      listSubtitle="CRUD giao việc qua popup modal."
      addLabel="Giao việc mới"
      searchPlaceholder="Số văn bản, người giao, người nhận"
      deleteEntityLabel="phiếu giao việc"
      editorCreateTitle="Giao việc mới"
      editorEditTitle="Cập nhật giao việc"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'assigner', label: 'Người giao' },
        { key: 'assignee', label: 'Người nhận' },
        { key: 'deadline', label: 'Hạn xử lý', align: 'center' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.assigner && f.assignee))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người giao" value={crud.formValues.assigner}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, assigner: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người nhận" value={crud.formValues.assignee}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, assignee: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Hạn xử lý" value={crud.formValues.deadline}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, deadline: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
              <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
              <MenuItem value="Quá hạn">Quá hạn</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
