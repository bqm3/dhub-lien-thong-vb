import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { receiveInterops, ReceiveInterop } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: ReceiveInterop = {
  id: '',
  documentCode: '',
  sender: '',
  receivedAt: '',
  status: 'Đã nhận',
};

export default function ReceiveInteropPage() {
  const crud = useCrudList(receiveInterops, emptyForm, 'id', {
    generateId: () => `LT-N-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    sender: item.sender,
    receivedAt: item.receivedAt,
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
      title="Nhận văn bản liên thông"
      subtitle="Nhận văn bản từ cơ quan khác, kiểm tra dữ liệu, lưu vào văn bản đến."
      metrics={[
        { label: 'Tổng nhận', value: crud.rows.length, helper: 'Liên thông', icon: 'solar:download-bold' },
        { label: 'Đã nhận', value: crud.rows.filter((d) => d.status === 'Đã nhận').length, helper: 'Tiếp nhận OK', icon: 'solar:check-circle-bold' },
        { label: 'Đang xử lý', value: crud.rows.filter((d) => d.status === 'Đang xử lý').length, helper: 'Kiểm tra dữ liệu', icon: 'solar:clock-circle-bold' },
        { label: 'Lỗi', value: crud.rows.filter((d) => d.status === 'Lỗi').length, helper: 'Dữ liệu không hợp lệ', icon: 'solar:close-circle-bold' },
      ]}
      listTitle="Danh sách nhận liên thông"
      listSubtitle="CRUD nhận văn bản qua popup modal."
      addLabel="Nhận văn bản"
      searchPlaceholder="Số văn bản, nơi gửi, trạng thái"
      deleteEntityLabel="bản ghi nhận"
      editorCreateTitle="Nhận văn bản mới"
      editorEditTitle="Cập nhật bản ghi nhận"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'sender', label: 'Nơi gửi' },
        { key: 'receivedAt', label: 'Thời gian nhận', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.sender))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Nơi gửi" value={crud.formValues.sender}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, sender: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Đã nhận">Đã nhận</MenuItem>
              <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
              <MenuItem value="Lỗi">Lỗi</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
