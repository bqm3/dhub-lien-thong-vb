import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { signHistories, SignHistory } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: SignHistory = {
  id: '',
  documentCode: '',
  signer: '',
  signType: 'Ký cá nhân',
  result: 'Thành công',
  signedAt: '',
};

export default function SignHistoryPage() {
  const crud = useCrudList(signHistories, emptyForm, 'id', {
    generateId: () => `LH-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    signer: item.signer,
    signType: item.signType,
    result: <StatusChip status={item.result} />,
    signedAt: item.signedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Lịch sử ký"
      subtitle="Ai ký, ký lúc nào, trạng thái ký thành công/thất bại."
      metrics={[
        { label: 'Tổng lượt ký', value: crud.rows.length, helper: 'Lịch sử', icon: 'solar:history-bold' },
        { label: 'Thành công', value: crud.rows.filter((d) => d.result === 'Thành công').length, helper: 'Ký OK', icon: 'solar:check-circle-bold' },
        { label: 'Thất bại', value: crud.rows.filter((d) => d.result === 'Thất bại').length, helper: 'Lỗi ký', icon: 'solar:close-circle-bold' },
        { label: 'Ký cá nhân', value: crud.rows.filter((d) => d.signType === 'Ký cá nhân').length, helper: 'Loại ký', icon: 'solar:pen-bold' },
      ]}
      listTitle="Lịch sử ký số"
      listSubtitle="CRUD lịch sử ký qua popup modal."
      addLabel="Thêm bản ghi"
      searchPlaceholder="Số văn bản, người ký, loại ký, kết quả"
      deleteEntityLabel="bản ghi lịch sử"
      editorCreateTitle="Thêm lịch sử ký"
      editorEditTitle="Cập nhật lịch sử ký"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'signer', label: 'Người ký' },
        { key: 'signType', label: 'Loại ký', align: 'center' },
        { key: 'result', label: 'Kết quả', align: 'center' },
        { key: 'signedAt', label: 'Thời gian', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.signer))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người ký" value={crud.formValues.signer}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, signer: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Loại ký" select value={crud.formValues.signType}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, signType: e.target.value }))}>
              <MenuItem value="Ký cá nhân">Ký cá nhân</MenuItem>
              <MenuItem value="Ký tổ chức">Ký tổ chức</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Kết quả" select value={crud.formValues.result}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, result: e.target.value }))}>
              <MenuItem value="Thành công">Thành công</MenuItem>
              <MenuItem value="Thất bại">Thất bại</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
