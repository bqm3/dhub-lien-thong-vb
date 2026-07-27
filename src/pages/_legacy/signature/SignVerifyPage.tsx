import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { signVerifications, SignVerification } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: SignVerification = {
  id: '',
  documentCode: '',
  fileName: '',
  signer: '',
  certificate: '',
  signTime: '',
  verifyResult: 'Hợp lệ',
  verifiedAt: '',
};

export default function SignVerifyPage() {
  const crud = useCrudList(signVerifications, emptyForm, 'id', {
    generateId: () => `XT-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    fileName: item.fileName,
    signer: item.signer,
    certificate: item.certificate,
    signTime: item.signTime,
    verifyResult: <StatusChip status={item.verifyResult} />,
    verifiedAt: item.verifiedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Xác thực chữ ký"
      subtitle="Kiểm tra chữ ký hợp lệ, chứng thư số, thời điểm ký trên file PDF/XML."
      metrics={[
        { label: 'Tổng xác thực', value: crud.rows.length, helper: 'Lượt kiểm tra', icon: 'solar:shield-check-bold' },
        { label: 'Hợp lệ', value: crud.rows.filter((d) => d.verifyResult === 'Hợp lệ').length, helper: 'Chữ ký OK', icon: 'solar:check-circle-bold' },
        { label: 'Không hợp lệ', value: crud.rows.filter((d) => d.verifyResult === 'Không hợp lệ').length, helper: 'Cần xử lý', icon: 'solar:close-circle-bold' },
        { label: 'File đã kiểm tra', value: new Set(crud.rows.map((d) => d.fileName)).size, helper: 'Số file', icon: 'solar:file-check-bold' },
      ]}
      listTitle="Danh sách xác thực chữ ký"
      listSubtitle="CRUD xác thực chữ ký qua popup modal."
      addLabel="Thêm bản ghi xác thực"
      searchPlaceholder="Số văn bản, tên file, người ký, chứng thư"
      deleteEntityLabel="bản ghi xác thực"
      editorCreateTitle="Thêm xác thực chữ ký"
      editorEditTitle="Cập nhật xác thực chữ ký"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'fileName', label: 'Tên file' },
        { key: 'signer', label: 'Người ký' },
        { key: 'certificate', label: 'Chứng thư số' },
        { key: 'signTime', label: 'Thời điểm ký', align: 'center' },
        { key: 'verifyResult', label: 'Kết quả', align: 'center' },
        { key: 'verifiedAt', label: 'Xác thực lúc', align: 'center' },
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
      onSubmit={() =>
        crud.handleSubmit((f) => Boolean(f.documentCode && f.fileName && f.signer && f.certificate))
      }
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Số văn bản"
              value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tên file"
              value={crud.formValues.fileName}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, fileName: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Người ký"
              value={crud.formValues.signer}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, signer: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Chứng thư số"
              value={crud.formValues.certificate}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, certificate: e.target.value }))}
              placeholder="CN=..., O=..., C=VN"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Thời điểm ký"
              value={crud.formValues.signTime}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, signTime: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Kết quả xác thực"
              select
              value={crud.formValues.verifyResult}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, verifyResult: e.target.value }))}
            >
              <MenuItem value="Hợp lệ">Hợp lệ</MenuItem>
              <MenuItem value="Không hợp lệ">Không hợp lệ</MenuItem>
              <MenuItem value="Chờ xác thực">Chờ xác thực</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
