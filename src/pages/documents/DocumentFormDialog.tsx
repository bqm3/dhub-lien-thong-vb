import { ChangeEvent, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { CLASSIFICATIONS, DOC_TYPES, DOCUMENT_STATUSES, emptyDocumentForm, ManagedDocumentRecord } from './types';

type Props = {
  open: boolean;
  editingCode: string | null;
  initialValues: ManagedDocumentRecord;
  onClose: () => void;
  onSubmit: (values: ManagedDocumentRecord, files: File[]) => void;
  onOpenSignStudio: (values: ManagedDocumentRecord, files: File[]) => void;
};

export default function DocumentFormDialog({
  open,
  editingCode,
  initialValues,
  onClose,
  onSubmit,
  onOpenSignStudio,
}: Props) {
  const [values, setValues] = useState<ManagedDocumentRecord>(emptyDocumentForm);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setAttachmentFiles([]);
    setLinkInput('');
    setLinkError('');
  }, [open, editingCode]);

  // Đồng bộ kết quả ký số từ dialog ký (parent cập nhật initialValues)
  useEffect(() => {
    if (!open) return;
    setValues((prev) => ({
      ...prev,
      signStatus: initialValues.signStatus,
      signedPositions: initialValues.signedPositions,
      status: initialValues.status,
      signProvider: initialValues.signProvider,
    }));
  }, [open, initialValues.signStatus, initialValues.signedPositions, initialValues.status, initialValues.signProvider]);

  function patch(partial: Partial<ManagedDocumentRecord>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(event.target.files ?? []);
    if (newFiles.length === 0) return;

    setAttachmentFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const toAdd = newFiles.filter((f) => !existing.has(f.name));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });

    setValues((prev) => {
      const existing = new Set(prev.attachments);
      const toAddNames = newFiles.map((f) => f.name).filter((n) => !existing.has(n));
      return toAddNames.length > 0 ? { ...prev, attachments: [...prev.attachments, ...toAddNames] } : prev;
    });

    event.target.value = '';
  }

  function handleAddLink() {
    const link = linkInput.trim();
    if (!link) {
      setLinkError('Nhập link file');
      return;
    }

    const lower = link.toLowerCase();
    if (lower.indexOf('http://') !== 0 && lower.indexOf('https://') !== 0) {
      setLinkError('Link phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    try {
      // Validate URL format
      // eslint-disable-next-line no-new
      new URL(link);
    } catch {
      setLinkError('Link không hợp lệ');
      return;
    }

    if (values.attachments.indexOf(link) !== -1) {
      setLinkError('Link đã được thêm');
      return;
    }

    setValues((prev) => ({ ...prev, attachments: [...prev.attachments, link] }));
    setLinkInput('');
    setLinkError('');
  }

  function handleRemoveAttachment(fileName: string) {
    setValues((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((item) => item !== fileName),
    }));
    setAttachmentFiles((prev) => prev.filter((f) => f.name !== fileName));
  }

  function handleOpenSignStudio() {
    if (!values.title || !values.sender || !values.receiver || values.attachments.length === 0) return;
    onOpenSignStudio(values, attachmentFiles);
  }

  function isLinkAttachment(value: string) {
    const lower = value.trim().toLowerCase();
    return lower.indexOf('http://') === 0 || lower.indexOf('https://') === 0;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{editingCode ? 'Cập nhật văn bản' : 'Tạo mới văn bản'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số ký hiệu"
              disabled={Boolean(editingCode)}
              value={values.code}
              onChange={(e) => patch({ code: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Loại văn bản"
              select
              value={values.type}
              onChange={(e) => patch({ type: e.target.value })}
            >
              {DOC_TYPES.filter((t) => t !== '').map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Trích yếu"
              value={values.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nơi gửi"
              value={values.sender}
              onChange={(e) => patch({ sender: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nơi nhận"
              value={values.receiver}
              onChange={(e) => patch({ receiver: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Phiên bản"
              value={values.version}
              onChange={(e) => patch({ version: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Phân loại"
              select
              value={values.classification}
              onChange={(e) => patch({ classification: e.target.value })}
            >
              {CLASSIFICATIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Trạng thái"
              select
              value={values.status}
              onChange={(e) => patch({ status: e.target.value })}
            >
              {DOCUMENT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle2">Tệp đính kèm văn bản</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload file hoặc dán link công khai (PDF/DOCX/XLSX...) để xem và ký số.
                    </Typography>
                  </Box>
                  <Button variant="outlined" component="label" startIcon={<Iconify icon="solar:upload-bold" />}>
                    Upload file
                    <input hidden multiple type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx" onChange={handleFileChange} />
                  </Button>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Thêm bằng link"
                    placeholder="https://.../file.pdf"
                    value={linkInput}
                    error={Boolean(linkError)}
                    helperText={linkError || 'Dùng link public để xem được trên viewer'}
                    onChange={(e) => {
                      setLinkInput(e.target.value);
                      if (linkError) setLinkError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="inherit"
                    startIcon={<Iconify icon="solar:link-bold" />}
                    onClick={handleAddLink}
                    sx={{ flexShrink: 0, height: 40 }}
                  >
                    Thêm link
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {values.attachments.length > 0 ? (
                    values.attachments.map((file) => (
                      <Chip
                        key={file}
                        label={file}
                        title={file}
                        onDelete={() => handleRemoveAttachment(file)}
                        variant="outlined"
                        color={isLinkAttachment(file) ? 'info' : 'default'}
                        icon={<Iconify icon={isLinkAttachment(file) ? 'solar:link-bold' : 'solar:file-bold'} width={16} />}
                        sx={{ maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có tệp đính kèm.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              Có thể upload file local hoặc thêm link public. Link public sẽ mở được trên viewer (Office Online / PDF).
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2">Popup giao diện ký số</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhà cung cấp: {values.signProvider} | Trạng thái: {values.signStatus} | Vị trí ký: {values.signedPositions}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleOpenSignStudio}
                  disabled={!values.title || !values.sender || !values.receiver || values.attachments.length === 0}
                >
                  Mở giao diện ký số
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSubmit(values, attachmentFiles)}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
