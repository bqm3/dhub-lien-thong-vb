import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { outgoingDocs, OutgoingDoc } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: OutgoingDoc = {
  code: '',
  title: '',
  type: 'Công văn',
  receiver: '',
  urgency: 'Thường',
  status: 'Soạn thảo',
  createdAt: '',
};

export default function OutgoingDocumentsPage() {
  const crud = useCrudList(outgoingDocs, emptyForm, 'code', {
    generateId: () => `VB-DI-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((doc) => ({
    code: doc.code,
    title: doc.title,
    type: doc.type,
    receiver: doc.receiver,
    urgency: doc.urgency,
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
      title="Văn bản đi"
      subtitle="Soạn/thêm văn bản, đính kèm file, trình duyệt, ký số, phát hành. CRUD tách riêng giao diện với modal."
      metrics={[
        { label: 'Tổng văn bản đi', value: crud.rows.length, helper: 'Dữ liệu demo', icon: 'solar:document-add-bold' },
        { label: 'Chờ ký', value: crud.rows.filter((d) => d.status === 'Chờ ký').length, helper: 'Cần ký số', icon: 'solar:pen-new-square-bold' },
        { label: 'Đã phát hành', value: crud.rows.filter((d) => d.status === 'Đã phát hành').length, helper: 'Sẵn sàng gửi', icon: 'solar:check-circle-bold' },
        { label: 'Khẩn', value: crud.rows.filter((d) => d.urgency === 'Khẩn').length, helper: 'Ưu tiên xử lý', icon: 'solar:alarm-bold' },
      ]}
      listTitle="Danh sách văn bản đi"
      listSubtitle="Thêm, sửa, xóa văn bản đi qua popup modal."
      addLabel="Thêm văn bản đi"
      searchPlaceholder="Số ký hiệu, trích yếu, nơi nhận, trạng thái"
      deleteEntityLabel="văn bản đi"
      editorCreateTitle="Tạo mới văn bản đi"
      editorEditTitle="Cập nhật văn bản đi"
      columns={[
        { key: 'code', label: 'Số ký hiệu' },
        { key: 'title', label: 'Trích yếu' },
        { key: 'type', label: 'Loại' },
        { key: 'receiver', label: 'Nơi nhận' },
        { key: 'urgency', label: 'Độ khẩn', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.code && f.title && f.receiver))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số ký hiệu" disabled={Boolean(crud.editingId)} value={crud.formValues.code}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, code: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Loại văn bản" select value={crud.formValues.type}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, type: e.target.value }))}>
              <MenuItem value="Công văn">Công văn</MenuItem>
              <MenuItem value="Quyết định">Quyết định</MenuItem>
              <MenuItem value="Báo cáo">Báo cáo</MenuItem>
              <MenuItem value="Thông báo">Thông báo</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Độ khẩn" select value={crud.formValues.urgency}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, urgency: e.target.value }))}>
              <MenuItem value="Thường">Thường</MenuItem>
              <MenuItem value="Khẩn">Khẩn</MenuItem>
              <MenuItem value="Hỏa tốc">Hỏa tốc</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Trích yếu" value={crud.formValues.title}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, title: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nơi nhận" value={crud.formValues.receiver}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, receiver: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Soạn thảo">Soạn thảo</MenuItem>
              <MenuItem value="Chờ ký">Chờ ký</MenuItem>
              <MenuItem value="Đã phát hành">Đã phát hành</MenuItem>
              <MenuItem value="Đã gửi">Đã gửi</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
