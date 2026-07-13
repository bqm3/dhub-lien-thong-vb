import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { incomingDocs, IncomingDoc } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: IncomingDoc = {
  code: '',
  title: '',
  sender: '',
  assignedTo: '',
  deadline: '',
  status: 'Chờ phân luồng',
};

export default function IncomingDocumentsPage() {
  const crud = useCrudList(incomingDocs, emptyForm, 'code', {
    generateId: () => `VB-DEN-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((doc) => ({
    code: doc.code,
    title: doc.title,
    sender: doc.sender,
    assignedTo: doc.assignedTo,
    deadline: doc.deadline,
    status: <StatusChip status={doc.status} />,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(doc)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(doc.code)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Văn bản đến"
      subtitle="Tiếp nhận văn bản từ đơn vị khác, phân luồng xử lý, giao việc, theo dõi kết quả."
      metrics={[
        { label: 'Tổng văn bản đến', value: crud.rows.length, helper: 'Dữ liệu demo', icon: 'solar:inbox-in-bold' },
        { label: 'Đang xử lý', value: crud.rows.filter((d) => d.status === 'Đang xử lý').length, helper: 'Cần theo dõi', icon: 'solar:clock-circle-bold' },
        { label: 'Chờ phân luồng', value: crud.rows.filter((d) => d.status === 'Chờ phân luồng').length, helper: 'Chưa giao việc', icon: 'solar:sort-horizontal-bold' },
        { label: 'Hoàn thành', value: crud.rows.filter((d) => d.status === 'Hoàn thành').length, helper: 'Đã xử lý xong', icon: 'solar:check-circle-bold' },
      ]}
      listTitle="Danh sách văn bản đến"
      listSubtitle="CRUD văn bản đến qua popup modal."
      addLabel="Tiếp nhận văn bản"
      searchPlaceholder="Số ký hiệu, trích yếu, nơi gửi, người xử lý"
      deleteEntityLabel="văn bản đến"
      editorCreateTitle="Tiếp nhận văn bản mới"
      editorEditTitle="Cập nhật văn bản đến"
      columns={[
        { key: 'code', label: 'Số ký hiệu' },
        { key: 'title', label: 'Trích yếu' },
        { key: 'sender', label: 'Nơi gửi' },
        { key: 'assignedTo', label: 'Người xử lý' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.code && f.title && f.sender))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số ký hiệu" disabled={Boolean(crud.editingId)} value={crud.formValues.code}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, code: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Trích yếu" value={crud.formValues.title}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, title: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Nơi gửi" value={crud.formValues.sender}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, sender: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người xử lý" value={crud.formValues.assignedTo}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, assignedTo: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Hạn xử lý" value={crud.formValues.deadline}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, deadline: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Chờ phân luồng">Chờ phân luồng</MenuItem>
              <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
              <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
