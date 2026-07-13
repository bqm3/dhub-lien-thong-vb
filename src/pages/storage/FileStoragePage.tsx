import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { fileStorages, FileStorage } from '../../sections/workflow/mockData';

const emptyForm: FileStorage = {
  id: '',
  fileName: '',
  path: '',
  size: '',
  type: 'PDF',
  uploadedAt: '',
};

export default function FileStoragePage() {
  const crud = useCrudList(fileStorages, emptyForm, 'id', {
    generateId: () => `FS-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    fileName: item.fileName,
    path: item.path,
    size: item.size,
    type: item.type,
    uploadedAt: item.uploadedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Kho tài liệu điện tử"
      subtitle="Lưu PDF, DOCX, XML, phụ lục, file scan."
      metrics={[
        { label: 'Tổng file', value: crud.rows.length, helper: 'Kho lưu trữ', icon: 'solar:server-bold' },
        { label: 'PDF', value: crud.rows.filter((d) => d.type === 'PDF').length, helper: 'Định dạng', icon: 'solar:file-text-bold' },
        { label: 'DOCX', value: crud.rows.filter((d) => d.type === 'DOCX').length, helper: 'Định dạng', icon: 'solar:document-bold' },
        { label: 'XML', value: crud.rows.filter((d) => d.type === 'XML').length, helper: 'Liên thông', icon: 'solar:code-file-bold' },
      ]}
      listTitle="Danh sách file trong kho"
      listSubtitle="CRUD kho file qua popup modal."
      addLabel="Upload file"
      searchPlaceholder="Tên file, đường dẫn, loại"
      deleteEntityLabel="file"
      editorCreateTitle="Thêm file vào kho"
      editorEditTitle="Cập nhật file"
      columns={[
        { key: 'fileName', label: 'Tên file' },
        { key: 'path', label: 'Đường dẫn' },
        { key: 'size', label: 'Dung lượng', align: 'center' },
        { key: 'type', label: 'Loại', align: 'center' },
        { key: 'uploadedAt', label: 'Upload', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.fileName && f.path))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Tên file" value={crud.formValues.fileName}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, fileName: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Đường dẫn" value={crud.formValues.path}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, path: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Dung lượng" value={crud.formValues.size}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, size: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Loại" select value={crud.formValues.type}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, type: e.target.value }))}>
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="DOCX">DOCX</MenuItem>
              <MenuItem value="XML">XML</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
