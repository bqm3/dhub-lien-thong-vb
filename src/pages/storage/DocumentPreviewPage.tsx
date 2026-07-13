import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { documentPreviews, DocumentPreview } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: DocumentPreview = {
  id: '',
  fileName: '',
  documentCode: '',
  fileType: 'PDF',
  previewStatus: 'Sẵn sàng',
  pageCount: 1,
  lastViewedAt: '',
};

export default function DocumentPreviewPage() {
  const crud = useCrudList(documentPreviews, emptyForm, 'id', {
    generateId: () => `PV-${String(Date.now()).slice(-6)}`,
  });
  const [previewItem, setPreviewItem] = useState<DocumentPreview | null>(null);

  const tableRows = crud.filtered.map((item) => ({
    fileName: item.fileName,
    documentCode: item.documentCode,
    fileType: item.fileType,
    pageCount: item.pageCount,
    previewStatus: <StatusChip status={item.previewStatus} />,
    lastViewedAt: item.lastViewedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          size="small"
          color="info"
          disabled={item.previewStatus !== 'Sẵn sàng'}
          onClick={() => setPreviewItem(item)}
        >
          Xem trước
        </Button>
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <>
      <CrudListLayout
        title="Xem trước tài liệu"
        subtitle="Preview PDF/DOCX ngay trên web, quản lý danh sách file có thể xem trước."
        metrics={[
          { label: 'Tổng file', value: crud.rows.length, helper: 'Có thể preview', icon: 'solar:eye-bold' },
          { label: 'Sẵn sàng', value: crud.rows.filter((d) => d.previewStatus === 'Sẵn sàng').length, helper: 'Xem được ngay', icon: 'solar:check-circle-bold' },
          { label: 'Đang xử lý', value: crud.rows.filter((d) => d.previewStatus === 'Đang xử lý').length, helper: 'Đang render', icon: 'solar:clock-circle-bold' },
          { label: 'PDF', value: crud.rows.filter((d) => d.fileType === 'PDF').length, helper: 'Định dạng', icon: 'solar:file-text-bold' },
        ]}
        listTitle="Danh sách tài liệu preview"
        listSubtitle="CRUD quản lý preview; nhấn Xem trước để mở popup xem nhanh."
        addLabel="Thêm tài liệu"
        searchPlaceholder="Tên file, số văn bản, loại file"
        deleteEntityLabel="tài liệu preview"
        editorCreateTitle="Thêm tài liệu preview"
        editorEditTitle="Cập nhật tài liệu preview"
        columns={[
          { key: 'fileName', label: 'Tên file' },
          { key: 'documentCode', label: 'Số văn bản' },
          { key: 'fileType', label: 'Loại', align: 'center' },
          { key: 'pageCount', label: 'Số trang', align: 'center' },
          { key: 'previewStatus', label: 'Trạng thái', align: 'center' },
          { key: 'lastViewedAt', label: 'Xem lần cuối', align: 'center' },
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
              <TextField
                fullWidth
                label="Tên file"
                value={crud.formValues.fileName}
                onChange={(e) => crud.setFormValues((p) => ({ ...p, fileName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
                label="Loại file"
                select
                value={crud.formValues.fileType}
                onChange={(e) => crud.setFormValues((p) => ({ ...p, fileType: e.target.value }))}
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="DOCX">DOCX</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Số trang"
                type="number"
                value={crud.formValues.pageCount}
                onChange={(e) => crud.setFormValues((p) => ({ ...p, pageCount: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái preview"
                select
                value={crud.formValues.previewStatus}
                onChange={(e) => crud.setFormValues((p) => ({ ...p, previewStatus: e.target.value }))}
              >
                <MenuItem value="Sẵn sàng">Sẵn sàng</MenuItem>
                <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
                <MenuItem value="Lỗi">Lỗi</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        }
      />

      <Dialog open={Boolean(previewItem)} onClose={() => setPreviewItem(null)} fullWidth maxWidth="md">
        <DialogTitle>Xem trước: {previewItem?.fileName}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 1,
              p: 4,
              borderRadius: 2,
              bgcolor: 'grey.100',
              minHeight: 360,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Iconify
              icon={previewItem?.fileType === 'PDF' ? 'solar:file-text-bold' : 'solar:document-bold'}
              width={64}
              sx={{ color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {previewItem?.fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Văn bản: {previewItem?.documentCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Loại: {previewItem?.fileType} · {previewItem?.pageCount} trang
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 2 }}>
              Demo preview — tích hợp PDF.js / Office viewer khi kết nối backend
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewItem(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
