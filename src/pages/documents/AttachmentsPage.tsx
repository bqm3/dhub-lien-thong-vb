import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { attachments, Attachment } from '../../sections/workflow/mockData';

const emptyForm: Attachment = {
  id: '',
  fileName: '',
  documentCode: '',
  fileType: 'PDF',
  size: '',
  version: 'v1',
};

export default function AttachmentsPage() {
  const crud = useCrudList(attachments, emptyForm, 'id', {
    generateId: () => `ATT-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    fileName: item.fileName,
    documentCode: item.documentCode,
    fileType: item.fileType,
    size: item.size,
    version: item.version,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Tài liệu đính kèm"
      subtitle="Upload, lưu trữ, tải xuống, xem trước, quản lý phiên bản file."
      metrics={[
        { label: 'Tổng file', value: crud.rows.length, helper: 'Đính kèm văn bản', icon: 'solar:paperclip-2-bold' },
        { label: 'PDF', value: crud.rows.filter((d) => d.fileType === 'PDF').length, helper: 'Định dạng phổ biến', icon: 'solar:file-text-bold' },
        { label: 'DOCX', value: crud.rows.filter((d) => d.fileType === 'DOCX').length, helper: 'Văn bản soạn thảo', icon: 'solar:document-bold' },
        { label: 'Có version', value: crud.rows.filter((d) => d.version !== 'v1').length, helper: 'Nhiều phiên bản', icon: 'solar:history-bold' },
      ]}
      listTitle="Danh sách tài liệu đính kèm"
      listSubtitle="CRUD file đính kèm qua popup modal."
      addLabel="Thêm tài liệu"
      searchPlaceholder="Tên file, số văn bản, loại file"
      deleteEntityLabel="tài liệu"
      editorCreateTitle="Thêm tài liệu đính kèm"
      editorEditTitle="Cập nhật tài liệu"
      columns={[
        { key: 'fileName', label: 'Tên file' },
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'fileType', label: 'Loại', align: 'center' },
        { key: 'size', label: 'Dung lượng', align: 'center' },
        { key: 'version', label: 'Version', align: 'center' },
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
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Tên file" value={crud.formValues.fileName}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, fileName: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Loại file" select value={crud.formValues.fileType}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, fileType: e.target.value }))}>
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="DOCX">DOCX</MenuItem>
              <MenuItem value="XML">XML</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Dung lượng" value={crud.formValues.size}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, size: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Version" value={crud.formValues.version}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, version: e.target.value }))} />
          </Grid>
        </Grid>
      }
    />
  );
}
