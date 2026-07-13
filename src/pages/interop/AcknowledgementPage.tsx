import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { acknowledgements, Acknowledgement } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: Acknowledgement = {
  id: '',
  transactionId: '',
  documentCode: '',
  ackCode: '',
  status: 'ACK',
  ackAt: '',
};

export default function AcknowledgementPage() {
  const crud = useCrudList(acknowledgements, emptyForm, 'id', {
    generateId: () => `BN-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    transactionId: item.transactionId,
    documentCode: item.documentCode,
    ackCode: item.ackCode,
    status: <StatusChip status={item.status} />,
    ackAt: item.ackAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Biên nhận điện tử"
      subtitle="Xác nhận đã nhận văn bản, trả mã giao dịch/liên thông."
      metrics={[
        { label: 'Tổng biên nhận', value: crud.rows.length, helper: 'ACK/NACK', icon: 'solar:document-medicine-bold' },
        { label: 'ACK', value: crud.rows.filter((d) => d.status === 'ACK').length, helper: 'Xác nhận OK', icon: 'solar:check-circle-bold' },
        { label: 'NACK', value: crud.rows.filter((d) => d.status === 'NACK').length, helper: 'Từ chối', icon: 'solar:close-circle-bold' },
        { label: 'Chờ', value: crud.rows.filter((d) => d.status === 'WAITING').length, helper: 'Đang chờ', icon: 'solar:clock-circle-bold' },
      ]}
      listTitle="Danh sách biên nhận"
      listSubtitle="CRUD biên nhận qua popup modal."
      addLabel="Thêm biên nhận"
      searchPlaceholder="Mã giao dịch, số văn bản, mã ACK"
      deleteEntityLabel="biên nhận"
      editorCreateTitle="Thêm biên nhận"
      editorEditTitle="Cập nhật biên nhận"
      columns={[
        { key: 'transactionId', label: 'Mã giao dịch' },
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'ackCode', label: 'Mã ACK' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
        { key: 'ackAt', label: 'Thời gian', align: 'center' },
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
            <TextField fullWidth label="Mã ACK" value={crud.formValues.ackCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, ackCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="ACK">ACK</MenuItem>
              <MenuItem value="NACK">NACK</MenuItem>
              <MenuItem value="WAITING">WAITING</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
