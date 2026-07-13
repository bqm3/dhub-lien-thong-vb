import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { personalSigns, PersonalSign } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: PersonalSign = {
  id: '',
  documentCode: '',
  signer: '',
  signType: 'Ký chính',
  status: 'Chờ ký',
  signedAt: '',
};

export default function PersonalSignPage() {
  const crud = useCrudList(personalSigns, emptyForm, 'id', {
    generateId: () => `KS-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    signer: item.signer,
    signType: item.signType,
    status: <StatusChip status={item.status} />,
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
      title="Ký số cá nhân"
      subtitle="Cán bộ/lãnh đạo ký trên file PDF/XML."
      metrics={[
        { label: 'Tổng lượt ký', value: crud.rows.length, helper: 'Ký cá nhân', icon: 'solar:pen-new-square-bold' },
        { label: 'Thành công', value: crud.rows.filter((d) => d.status === 'Thành công').length, helper: 'Đã ký', icon: 'solar:check-circle-bold' },
        { label: 'Chờ ký', value: crud.rows.filter((d) => d.status === 'Chờ ký').length, helper: 'Đang chờ', icon: 'solar:clock-circle-bold' },
        { label: 'Thất bại', value: crud.rows.filter((d) => d.status === 'Thất bại').length, helper: 'Lỗi ký', icon: 'solar:close-circle-bold' },
      ]}
      listTitle="Danh sách ký cá nhân"
      listSubtitle="CRUD ký số cá nhân qua popup modal."
      addLabel="Thêm yêu cầu ký"
      searchPlaceholder="Số văn bản, người ký, loại ký"
      deleteEntityLabel="bản ghi ký"
      editorCreateTitle="Thêm yêu cầu ký cá nhân"
      editorEditTitle="Cập nhật ký cá nhân"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'signer', label: 'Người ký' },
        { key: 'signType', label: 'Loại ký', align: 'center' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
        { key: 'signedAt', label: 'Thời gian ký', align: 'center' },
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
              <MenuItem value="Ký chính">Ký chính</MenuItem>
              <MenuItem value="Ký nháy">Ký nháy</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Chờ ký">Chờ ký</MenuItem>
              <MenuItem value="Thành công">Thành công</MenuItem>
              <MenuItem value="Thất bại">Thất bại</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
