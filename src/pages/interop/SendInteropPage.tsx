import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { sendInterops, SendInterop } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: SendInterop = {
  id: '',
  documentCode: '',
  receiver: '',
  route: '',
  status: 'Đang gửi',
  sentAt: '',
};

export default function SendInteropPage() {
  const crud = useCrudList(sendInterops, emptyForm, 'id', {
    generateId: () => `LT-G-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    receiver: item.receiver,
    route: item.route,
    status: <StatusChip status={item.status} />,
    sentAt: item.sentAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Gửi văn bản liên thông"
      subtitle="Gửi văn bản sang cơ quan khác kèm metadata và file."
      metrics={[
        { label: 'Tổng gửi', value: crud.rows.length, helper: 'Liên thông', icon: 'solar:upload-bold' },
        { label: 'Đã gửi', value: crud.rows.filter((d) => d.status === 'Đã gửi').length, helper: 'Thành công', icon: 'solar:check-circle-bold' },
        { label: 'Đang gửi', value: crud.rows.filter((d) => d.status === 'Đang gửi').length, helper: 'Đang xử lý', icon: 'solar:clock-circle-bold' },
        { label: 'Lỗi', value: crud.rows.filter((d) => d.status === 'Lỗi').length, helper: 'Cần retry', icon: 'solar:close-circle-bold' },
      ]}
      listTitle="Danh sách gửi liên thông"
      listSubtitle="CRUD gửi văn bản qua popup modal."
      addLabel="Gửi văn bản"
      searchPlaceholder="Số văn bản, nơi nhận, route"
      deleteEntityLabel="giao dịch gửi"
      editorCreateTitle="Gửi văn bản mới"
      editorEditTitle="Cập nhật giao dịch gửi"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'receiver', label: 'Nơi nhận' },
        { key: 'route', label: 'Route' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
        { key: 'sentAt', label: 'Thời gian gửi', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.receiver))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Nơi nhận" value={crud.formValues.receiver}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, receiver: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Đang gửi">Đang gửi</MenuItem>
              <MenuItem value="Đã gửi">Đã gửi</MenuItem>
              <MenuItem value="Lỗi">Lỗi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Route" value={crud.formValues.route}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, route: e.target.value }))} />
          </Grid>
        </Grid>
      }
    />
  );
}
