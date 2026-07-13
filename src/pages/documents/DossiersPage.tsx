import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { dossiers, Dossier } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: Dossier = {
  code: '',
  name: '',
  docCount: 0,
  owner: '',
  status: 'Đang mở',
  updatedAt: '',
};

export default function DossiersPage() {
  const crud = useCrudList(dossiers, emptyForm, 'code', {
    generateId: () => `HS-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    code: item.code,
    name: item.name,
    docCount: item.docCount,
    owner: item.owner,
    status: <StatusChip status={item.status} />,
    updatedAt: item.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.code)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Hồ sơ văn bản"
      subtitle="Gom nhiều văn bản, phụ lục, tài liệu liên quan thành một hồ sơ."
      metrics={[
        { label: 'Tổng hồ sơ', value: crud.rows.length, helper: 'Dữ liệu demo', icon: 'solar:folder-with-files-bold' },
        { label: 'Đang mở', value: crud.rows.filter((d) => d.status === 'Đang mở').length, helper: 'Đang cập nhật', icon: 'solar:folder-open-bold' },
        { label: 'Đã đóng', value: crud.rows.filter((d) => d.status === 'Đã đóng').length, helper: 'Hoàn tất', icon: 'solar:archive-bold' },
        { label: 'Tổng văn bản', value: crud.rows.reduce((s, d) => s + d.docCount, 0), helper: 'Trong các hồ sơ', icon: 'solar:documents-bold' },
      ]}
      listTitle="Danh sách hồ sơ"
      listSubtitle="CRUD hồ sơ văn bản qua popup modal."
      addLabel="Tạo hồ sơ"
      searchPlaceholder="Mã hồ sơ, tên, chủ quản"
      deleteEntityLabel="hồ sơ"
      editorCreateTitle="Tạo hồ sơ mới"
      editorEditTitle="Cập nhật hồ sơ"
      columns={[
        { key: 'code', label: 'Mã hồ sơ' },
        { key: 'name', label: 'Tên hồ sơ' },
        { key: 'docCount', label: 'Số VB', align: 'center' },
        { key: 'owner', label: 'Chủ quản' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
        { key: 'updatedAt', label: 'Cập nhật', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.code && f.name && f.owner))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Mã hồ sơ" disabled={Boolean(crud.editingId)} value={crud.formValues.code}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, code: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Tên hồ sơ" value={crud.formValues.name}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" type="number" value={crud.formValues.docCount}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, docCount: Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Chủ quản" value={crud.formValues.owner}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, owner: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Đang mở">Đang mở</MenuItem>
              <MenuItem value="Đã đóng">Đã đóng</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
