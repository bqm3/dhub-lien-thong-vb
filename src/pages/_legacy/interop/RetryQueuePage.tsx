import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { retryQueues, RetryQueue } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: RetryQueue = {
  id: '',
  transactionId: '',
  documentCode: '',
  errorType: 'API Timeout',
  retries: 0,
  status: 'Đang retry',
};

export default function RetryQueuePage() {
  const crud = useCrudList(retryQueues, emptyForm, 'id', {
    generateId: () => `RT-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    transactionId: item.transactionId,
    documentCode: item.documentCode,
    errorType: item.errorType,
    retries: item.retries,
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
      title="Retry lỗi"
      subtitle="Gửi lại khi mất mạng, timeout, lỗi hệ thống nhận."
      metrics={[
        { label: 'Tổng retry', value: crud.rows.length, helper: 'Hàng đợi', icon: 'solar:restart-bold' },
        { label: 'Đang retry', value: crud.rows.filter((d) => d.status === 'Đang retry').length, helper: 'Đang thử lại', icon: 'solar:clock-circle-bold' },
        { label: 'Thành công', value: crud.rows.filter((d) => d.status === 'Thành công').length, helper: 'Đã gửi lại OK', icon: 'solar:check-circle-bold' },
        { label: 'Thất bại', value: crud.rows.filter((d) => d.status === 'Thất bại').length, helper: 'Hết lần retry', icon: 'solar:close-circle-bold' },
      ]}
      listTitle="Hàng đợi retry"
      listSubtitle="CRUD retry qua popup modal."
      addLabel="Thêm vào hàng đợi"
      searchPlaceholder="Mã giao dịch, số văn bản, loại lỗi"
      deleteEntityLabel="bản ghi retry"
      editorCreateTitle="Thêm retry"
      editorEditTitle="Cập nhật retry"
      columns={[
        { key: 'transactionId', label: 'Mã giao dịch' },
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'errorType', label: 'Loại lỗi' },
        { key: 'retries', label: 'Lần thử', align: 'center' },
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
            <TextField fullWidth label="Loại lỗi" select value={crud.formValues.errorType}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, errorType: e.target.value }))}>
              <MenuItem value="API Timeout">API Timeout</MenuItem>
              <MenuItem value="Signature Error">Signature Error</MenuItem>
              <MenuItem value="Routing Error">Routing Error</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số lần thử" type="number" value={crud.formValues.retries}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, retries: Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Đang retry">Đang retry</MenuItem>
              <MenuItem value="Thành công">Thành công</MenuItem>
              <MenuItem value="Thất bại">Thất bại</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
