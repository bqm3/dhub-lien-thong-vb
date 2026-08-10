import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
    alpha,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { ExchangeTransaction } from '../../sections/interoperability/mockData';

const emptyForm: ExchangeTransaction = {
  id: '',
  documentId: '',
  documentNo: '',
  documentCode: '',
  documentType: 'CONG_VAN',
  subject: '',
  documentTitle: '',
  senderCode: '',
  sender: '',
  receiverCode: [],
  receiver: '',
  priority: 'NORMAL',
  sendTime: '',
  issueDate: '',
  route: '',
  senderPerson: '',
  senderTitle: '',
  status: 'sent',
  ack: 'WAITING',
  retries: 0,
  sentAt: '',
  receivedAt: '',
  updatedAt: '',
  errorReason: '',
  errorDetail: '',
};

interface DocumentExchangeCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ExchangeTransaction) => Promise<void>;
  documentOptions: any[];
  unitOptions: any[];
}

export default function DocumentExchangeCreateDialog({
  open,
  onClose,
  onSubmit,
  documentOptions,
  unitOptions,
}: DocumentExchangeCreateDialogProps) {
  const [formValues, setFormValues] = useState<ExchangeTransaction>(emptyForm);
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  useEffect(() => {
    if (open) {
      setFormValues({
        ...emptyForm,
        id: `TX-${String(Date.now()).slice(-10)}`,
        sentAt:
          new Date().toLocaleDateString('vi-VN').replace(/\//g, '/') +
          ' ' +
          new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleDateString('vi-VN'),
      });
      setSelectedDocId('');
    }
  }, [open]);

  function handleSelectDocument(docNoOrCode: string) {
    setSelectedDocId(docNoOrCode);
    const selectedDoc = documentOptions.find(
      (d: any) => d.code === docNoOrCode || d.documentNo === docNoOrCode || d.documentCode === docNoOrCode
    );

    if (selectedDoc) {
      setFormValues((prev) => ({
        ...prev,
        documentId: selectedDoc.id || selectedDoc.ID || selectedDoc.code || '',
        documentNo: selectedDoc.documentNo || selectedDoc.DOCUMENT_NO || selectedDoc.code || '',
        documentCode: selectedDoc.documentNo || selectedDoc.DOCUMENT_NO || selectedDoc.code || '',
        documentType: selectedDoc.documentType || selectedDoc.DOCUMENT_TYPE || 'CONG_VAN',
        subject: selectedDoc.subject || selectedDoc.SUBJECT || '',
        documentTitle: selectedDoc.subject || selectedDoc.SUBJECT || '',
        senderCode: selectedDoc.senderCode || selectedDoc.SENDER_CODE || prev.senderCode,
        sender: selectedDoc.senderCode || selectedDoc.SENDER_CODE || prev.sender,
      }));
    }
  }

  const handleFormSubmit = async () => {
    await onSubmit(formValues);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          color: '#fff',
          position: 'relative',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
              sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center',
                  }}
          >
            <Iconify icon="solar:plain-3-bold" width={28} sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h6" >
              Khởi tạo giao dịch liên thông mới
            </Typography>
               <Typography variant="caption" color="text.secondary">
              Gửi trực tiếp văn bản tới các đơn vị nhận trên Trục liên thông văn bản quốc gia (DIP Hub)
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 3, pt: 3.5 }}>
        <Grid container spacing={3}>
          {/* 1. Chọn văn bản từ danh sách */}
          <Grid item xs={12}>
            <Autocomplete
              options={documentOptions}
              getOptionLabel={(option: any) =>
                `${option.documentNo} - ${option.subject || 'Không có trích yếu'}`
              }
              value={
                documentOptions.find(
                  (d: any) => d.code === selectedDocId || d.documentNo === selectedDocId
                ) || null
              }
              onChange={(_, newValue: any) => {
                if (newValue) {
                  handleSelectDocument(newValue.code || newValue.documentNo);
                } else {
                  setSelectedDocId('');
                  setFormValues(emptyForm);
                }
              }}
              renderOption={(props: any, option: any) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key || option.id || option.code} {...otherProps}>
                    <Stack spacing={0.5} sx={{ py: 0.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={option.documentType || 'VĂN BẢN'}
                          size="small"
                          color="primary"
                          variant="soft"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {option.documentNo}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 500 }}>
                        {option.subject || 'Chưa có trích yếu nội dung'}
                      </Typography>
                    </Stack>
                  </Box>
                );
              }}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  label="Chọn văn bản cần gửi liên thông"
                  placeholder="Tìm theo số ký hiệu, trích yếu văn bản..."
                  InputLabelProps={{ shrink: true }}
                  helperText="Chọn một văn bản đã có sẵn từ kho văn bản điện tử để thực hiện giao nhận"
                />
              )}
            />
          </Grid>

          {/* Thông tin thẻ Preview văn bản đã chọn */}
          {(formValues.documentCode || formValues.documentNo) && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(59, 130, 246, 0.04)',
                  borderColor: 'primary.lighter',
                  borderStyle: 'dashed',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      color: '#fff',
                      display: 'flex',
                    }}
                  >
                    <Iconify icon="solar:document-text-bold" width={28} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {formValues.documentNo || formValues.documentCode}
                      </Typography>
                      <Chip
                        label={formValues.documentType || 'CÔNG VĂN'}
                        size="small"
                        color="info"
                        sx={{ fontWeight: 600, height: 22 }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                      {formValues.subject || formValues.documentTitle || 'Chưa có trích yếu văn bản'}
                    </Typography>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        📌 Đơn vị phát hành: <strong>{formValues.senderCode || formValues.sender || 'Chưa xác định'}</strong>
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </Grid>

          {/* 2. Nơi gửi */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={unitOptions}
              getOptionLabel={(option: any) => option.label || ''}
              value={unitOptions.find((u: any) => u.code === (formValues.senderCode || formValues.sender)) || null}
              onChange={(_, newValue: any) => {
                const code = newValue ? newValue.code : '';
                setFormValues((prev) => ({ ...prev, senderCode: code, sender: code }));
              }}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  label="Nơi gửi (Đơn vị phát hành)"
                  placeholder="Chọn đơn vị gửi..."
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          {/* 3. Nơi nhận (Cho phép chọn nhiều đơn vị) */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={unitOptions}
              getOptionLabel={(option: any) => option.label || ''}
              value={unitOptions.filter((u: any) => {
                const current = formValues.receiverCode;
                if (Array.isArray(current)) return current.includes(u.code);
                if (typeof current === 'string' && current)
                  return current.split(',').map((s) => s.trim()).includes(u.code);
                return false;
              })}
              onChange={(_, newValue: any[]) => {
                const codes = newValue.map((item) => item.code);
                setFormValues((prev) => ({
                  ...prev,
                  receiverCode: codes,
                  receiver: codes.join(', '),
                }));
              }}
              renderTags={(value: any[], getTagProps: any) =>
                value.map((option: any, index: number) => {
                  const tagProps = getTagProps({ index });
                  const { key, ...otherTagProps } = tagProps;
                  return (
                    <Chip
                      key={key || option.code}
                      label={option.code}
                      size="small"
                      color="primary"
                      variant="soft"
                      {...otherTagProps}
                    />
                  );
                })
              }
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  label="Nơi nhận (Đơn vị tiếp nhận liên thông)"
                  placeholder="Chọn một hoặc nhiều đơn vị..."
                  InputLabelProps={{ shrink: true }}
                  helperText="Cho phép chọn đồng thời nhiều đơn vị tiếp nhận"
                />
              )}
            />
          </Grid>

          {/* 4. Tùy chọn Độ khẩn & Ngày gửi */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Độ khẩn văn bản"
              select
              InputLabelProps={{ shrink: true }}
              value={formValues.priority || 'NORMAL'}
              onChange={(e) => setFormValues((prev) => ({ ...prev, priority: e.target.value }))}
            >
              <MenuItem value="NORMAL">Bình thường (NORMAL)</MenuItem>
              <MenuItem value="HIGH">Khẩn (HIGH)</MenuItem>
              <MenuItem value="URGENT">Hỏa tốc (URGENT)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Thời gian phát hành / gửi (sendTime)"
              InputLabelProps={{ shrink: true }}
              value={formValues.sendTime || formValues.issueDate || new Date().toISOString().split('T')[0]}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, sendTime: e.target.value, issueDate: e.target.value }))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5, px: 3, bgcolor: 'background.neutral' }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Iconify icon="solar:plain-3-bold" />}
          onClick={handleFormSubmit}
          sx={{
            px: 3,
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.24)',
          }}
        >
          Gửi văn bản liên thông
        </Button>
      </DialogActions>
    </Dialog>
  );
}
