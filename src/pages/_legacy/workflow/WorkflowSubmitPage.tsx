import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { workflowSubmits, WorkflowSubmit } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: WorkflowSubmit = {
  id: '',
  documentCode: '',
  title: '',
  submitter: '',
  approver: '',
  status: 'Chờ duyệt',
  submittedAt: '',
};

export default function WorkflowSubmitPage() {
  const crud = useCrudList(workflowSubmits, emptyForm, 'id', {
    generateId: () => `WF-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    title: item.title,
    submitter: item.submitter,
    approver: item.approver,
    status: <StatusChip status={item.status} />,
    submittedAt: item.submittedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Trình duyệt"
      subtitle="Người soạn trình lãnh đạo/phòng ban duyệt văn bản."
      metrics={[
        { label: 'Tổng trình duyệt', value: crud.rows.length, helper: 'Luồng xử lý', icon: 'solar:send-square-bold' },
        { label: 'Chờ duyệt', value: crud.rows.filter((d) => d.status === 'Chờ duyệt').length, helper: 'Đang chờ', icon: 'solar:clock-circle-bold' },
        { label: 'Đã duyệt', value: crud.rows.filter((d) => d.status === 'Đã duyệt').length, helper: 'Hoàn tất', icon: 'solar:check-circle-bold' },
        { label: 'Trả lại', value: crud.rows.filter((d) => d.status === 'Trả lại').length, helper: 'Cần sửa', icon: 'solar:undo-left-round-bold' },
      ]}
      listTitle="Danh sách trình duyệt"
      listSubtitle="CRUD trình duyệt qua popup modal."
      addLabel="Trình duyệt mới"
      searchPlaceholder="Số văn bản, trích yếu, người trình, người duyệt"
      deleteEntityLabel="phiếu trình"
      editorCreateTitle="Tạo trình duyệt"
      editorEditTitle="Cập nhật trình duyệt"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'title', label: 'Trích yếu' },
        { key: 'submitter', label: 'Người trình' },
        { key: 'approver', label: 'Người duyệt' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
        { key: 'submittedAt', label: 'Thời gian', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.title && f.submitter))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Trích yếu" value={crud.formValues.title}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, title: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người trình" value={crud.formValues.submitter}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, submitter: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người duyệt" value={crud.formValues.approver}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, approver: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Chờ duyệt">Chờ duyệt</MenuItem>
              <MenuItem value="Đã duyệt">Đã duyệt</MenuItem>
              <MenuItem value="Trả lại">Trả lại</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
