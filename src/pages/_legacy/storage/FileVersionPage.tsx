import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { fileVersions, FileVersion } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: FileVersion = {
  id: '',
  fileName: '',
  documentCode: '',
  version: 'v1',
  status: 'Dự thảo',
  updatedAt: '',
};

export default function FileVersionPage() {
  const crud = useCrudList(fileVersions, emptyForm, 'id', {
    generateId: () => `FV-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    fileName: item.fileName,
    documentCode: item.documentCode,
    version: item.version,
    status: <StatusChip status={item.status} />,
    updatedAt: item.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Quản lý phiên bản file"
      subtitle="Lưu các bản dự thảo, bản đã duyệt, bản đã ký."
      metrics={[
        { label: 'Tổng version', value: crud.rows.length, helper: 'Phiên bản file', icon: 'solar:history-bold' },
        { label: 'Đã ký', value: crud.rows.filter((d) => d.status === 'Đã ký').length, helper: 'Bản chính thức', icon: 'solar:pen-new-square-bold' },
        { label: 'Đã duyệt', value: crud.rows.filter((d) => d.status === 'Đã duyệt').length, helper: 'Chờ ký', icon: 'solar:check-circle-bold' },
        { label: 'Dự thảo', value: crud.rows.filter((d) => d.status === 'Dự thảo').length, helper: 'Đang soạn', icon: 'solar:document-add-bold' },
      ]}
      listTitle="Danh sách phiên bản"
      listSubtitle="CRUD version file qua popup modal."
      addLabel="Thêm phiên bản"
      searchPlaceholder="Tên file, số văn bản, version"
      deleteEntityLabel="phiên bản"
      editorCreateTitle="Thêm phiên bản mới"
      editorEditTitle="Cập nhật phiên bản"
      columns={[
        { key: 'fileName', label: 'Tên file' },
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'version', label: 'Version', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.fileName && f.documentCode))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Tên file" value={crud.formValues.fileName}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, fileName: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Version" value={crud.formValues.version}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, version: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Dự thảo">Dự thảo</MenuItem>
              <MenuItem value="Đã duyệt">Đã duyệt</MenuItem>
              <MenuItem value="Đã ký">Đã ký</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
