import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { internalDocs, InternalDoc } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: InternalDoc = {
  code: '',
  title: '',
  fromDept: '',
  toDept: '',
  status: 'Soạn thảo',
  createdAt: '',
};

export default function InternalDocumentsPage() {
  const crud = useCrudList(internalDocs, emptyForm, 'code', {
    generateId: () => `VB-NB-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((doc) => ({
    code: doc.code,
    title: doc.title,
    fromDept: doc.fromDept,
    toDept: doc.toDept,
    status: <StatusChip status={doc.status} />,
    createdAt: doc.createdAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(doc)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(doc.code)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Văn bản nội bộ"
      subtitle="Gửi nhận giữa các phòng ban trong cùng đơn vị."
      metrics={[
        { label: 'Tổng văn bản', value: crud.rows.length, helper: 'Nội bộ đơn vị', icon: 'solar:documents-bold' },
        { label: 'Đang duyệt', value: crud.rows.filter((d) => d.status === 'Đang duyệt').length, helper: 'Chờ phê duyệt', icon: 'solar:hourglass-bold' },
        { label: 'Hoàn thành', value: crud.rows.filter((d) => d.status === 'Hoàn thành').length, helper: 'Đã xử lý', icon: 'solar:check-circle-bold' },
        { label: 'Phòng ban', value: new Set(crud.rows.flatMap((d) => [d.fromDept, d.toDept])).size, helper: 'Tham gia trao đổi', icon: 'solar:buildings-bold' },
      ]}
      listTitle="Danh sách văn bản nội bộ"
      listSubtitle="CRUD văn bản nội bộ qua popup modal."
      addLabel="Thêm văn bản nội bộ"
      searchPlaceholder="Số ký hiệu, trích yếu, phòng gửi/nhận"
      deleteEntityLabel="văn bản nội bộ"
      editorCreateTitle="Tạo văn bản nội bộ"
      editorEditTitle="Cập nhật văn bản nội bộ"
      columns={[
        { key: 'code', label: 'Số ký hiệu' },
        { key: 'title', label: 'Trích yếu' },
        { key: 'fromDept', label: 'Phòng gửi' },
        { key: 'toDept', label: 'Phòng nhận' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
        { key: 'createdAt', label: 'Ngày tạo', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.code && f.title && f.fromDept && f.toDept))}
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
            <TextField fullWidth label="Phòng gửi" value={crud.formValues.fromDept}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, fromDept: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Phòng nhận" value={crud.formValues.toDept}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, toDept: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Soạn thảo">Soạn thảo</MenuItem>
              <MenuItem value="Đang duyệt">Đang duyệt</MenuItem>
              <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
