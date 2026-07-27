import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { notifications, Notification } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: Notification = {
  id: '',
  title: '',
  type: 'Cần duyệt',
  recipient: '',
  read: 'Chưa đọc',
  createdAt: '',
};

export default function NotificationsPage() {
  const crud = useCrudList(notifications, emptyForm, 'id', {
    generateId: () => `NT-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    title: item.title,
    type: item.type,
    recipient: item.recipient,
    read: <StatusChip status={item.read} />,
    createdAt: item.createdAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Thông báo nội bộ"
      subtitle="Có văn bản mới, cần duyệt, cần ký, bị trả lại, cảnh báo quá hạn."
      metrics={[
        { label: 'Tổng thông báo', value: crud.rows.length, helper: 'Hệ thống', icon: 'solar:bell-bold' },
        { label: 'Chưa đọc', value: crud.rows.filter((d) => d.read === 'Chưa đọc').length, helper: 'Cần xem', icon: 'solar:letter-unread-bold' },
        { label: 'Cảnh báo', value: crud.rows.filter((d) => d.type === 'Cảnh báo').length, helper: 'Quá hạn', icon: 'solar:alarm-bold' },
        { label: 'Cần duyệt', value: crud.rows.filter((d) => d.type === 'Cần duyệt').length, helper: 'Chờ xử lý', icon: 'solar:clipboard-check-bold' },
      ]}
      listTitle="Danh sách thông báo"
      listSubtitle="CRUD thông báo qua popup modal."
      addLabel="Tạo thông báo"
      searchPlaceholder="Tiêu đề, loại, người nhận"
      deleteEntityLabel="thông báo"
      editorCreateTitle="Tạo thông báo mới"
      editorEditTitle="Cập nhật thông báo"
      columns={[
        { key: 'title', label: 'Tiêu đề' },
        { key: 'type', label: 'Loại', align: 'center' },
        { key: 'recipient', label: 'Người nhận' },
        { key: 'read', label: 'Đã đọc', align: 'center' },
        { key: 'createdAt', label: 'Thời gian', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.title && f.recipient))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Tiêu đề" value={crud.formValues.title}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, title: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Loại" select value={crud.formValues.type}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, type: e.target.value }))}>
              <MenuItem value="Cần duyệt">Cần duyệt</MenuItem>
              <MenuItem value="Cần ký">Cần ký</MenuItem>
              <MenuItem value="Cảnh báo">Cảnh báo</MenuItem>
              <MenuItem value="Văn bản mới">Văn bản mới</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người nhận" value={crud.formValues.recipient}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, recipient: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái đọc" select value={crud.formValues.read}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, read: e.target.value }))}>
              <MenuItem value="Chưa đọc">Chưa đọc</MenuItem>
              <MenuItem value="Đã đọc">Đã đọc</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
