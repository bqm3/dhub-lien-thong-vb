import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { syncStatuses, SyncStatus } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: SyncStatus = {
  id: '',
  transactionId: '',
  documentCode: '',
  syncStatus: 'Đang đồng bộ',
  lastSyncAt: '',
};

export default function SyncStatusPage() {
  const crud = useCrudList(syncStatuses, emptyForm, 'id', {
    generateId: () => `DB-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    transactionId: item.transactionId,
    documentCode: item.documentCode,
    syncStatus: <StatusChip status={item.syncStatus} />,
    lastSyncAt: item.lastSyncAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Đồng bộ trạng thái"
      subtitle="Đã gửi, đã nhận, đã đọc, đã xử lý, bị lỗi."
      metrics={[
        { label: 'Tổng đồng bộ', value: crud.rows.length, helper: 'Trạng thái', icon: 'solar:refresh-circle-bold' },
        { label: 'Đã đồng bộ', value: crud.rows.filter((d) => d.syncStatus === 'Đã đồng bộ').length, helper: 'OK', icon: 'solar:check-circle-bold' },
        { label: 'Đang đồng bộ', value: crud.rows.filter((d) => d.syncStatus === 'Đang đồng bộ').length, helper: 'Đang xử lý', icon: 'solar:clock-circle-bold' },
        { label: 'Lỗi', value: crud.rows.filter((d) => d.syncStatus === 'Lỗi').length, helper: 'Cần xử lý', icon: 'solar:close-circle-bold' },
      ]}
      listTitle="Danh sách đồng bộ trạng thái"
      listSubtitle="CRUD đồng bộ qua popup modal."
      addLabel="Thêm bản ghi"
      searchPlaceholder="Mã giao dịch, số văn bản, trạng thái"
      deleteEntityLabel="bản ghi đồng bộ"
      editorCreateTitle="Thêm đồng bộ"
      editorEditTitle="Cập nhật đồng bộ"
      columns={[
        { key: 'transactionId', label: 'Mã giao dịch' },
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'syncStatus', label: 'Trạng thái', align: 'center' },
        { key: 'lastSyncAt', label: 'Lần cuối', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.transactionId && f.documentCode))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Mã giao dịch" value={crud.formValues.transactionId}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, transactionId: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.syncStatus}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, syncStatus: e.target.value }))}>
              <MenuItem value="Đang đồng bộ">Đang đồng bộ</MenuItem>
              <MenuItem value="Đã đồng bộ">Đã đồng bộ</MenuItem>
              <MenuItem value="Lỗi">Lỗi</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
