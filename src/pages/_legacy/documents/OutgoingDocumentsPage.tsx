import { ChangeEvent, useMemo, useState } from 'react';
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
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { outgoingDocs, OutgoingDoc } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: OutgoingDoc = {
  code: '',
  title: '',
  type: 'Cong van',
  receiver: '',
  urgency: 'Thuong',
  status: 'Soan thao',
  createdAt: '',
  attachments: [],
  signProvider: 'VNPT CA Server',
  signStatus: 'Chua ky',
};

export default function OutgoingDocumentsPage() {
  const crud = useCrudList(outgoingDocs, emptyForm, 'code', {
    generateId: () => `VB-DI-${String(Date.now()).slice(-6)}`,
  });
  const [signDialogOpen, setSignDialogOpen] = useState(false);

  const attachments = useMemo(() => crud.formValues.attachments ?? [], [crud.formValues.attachments]);

  const handleOpenCreate = () => {
    crud.setEditingId(null);
    crud.setFormValues({
      ...emptyForm,
      code: `VB-DI-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toLocaleString('vi-VN'),
    });
    crud.setOpenEditor(true);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => file.name);
    crud.setFormValues((prev) => ({
      ...prev,
      attachments: [...(prev.attachments ?? []), ...files],
    }));
    event.target.value = '';
  };

  const handleOpenSignDialog = () => {
    if (!crud.formValues.title || !crud.formValues.receiver || attachments.length === 0) return;
    setSignDialogOpen(true);
  };

  const handleConfirmServerSign = () => {
    crud.setFormValues((prev) => ({
      ...prev,
      status: prev.status === 'Soan thao' ? 'Cho ky' : prev.status,
      signStatus: 'Đa ky server',
    }));
    setSignDialogOpen(false);
  };

  const tableRows = crud.filtered.map((doc) => ({
    code: doc.code,
    title: doc.title,
    type: doc.type,
    receiver: doc.receiver,
    urgency: doc.urgency,
    status: <StatusChip status={doc.status} />,
    attachments: (doc.attachments ?? []).length,
    signStatus: <StatusChip status={doc.signStatus ?? 'Chua ky'} />,
    createdAt: doc.createdAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(doc)}>Sua</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(doc.code)}>Xoa</Button>
      </Stack>
    ),
  }));

  return (
    <>
      <CrudListLayout
        title="Van ban đi"
        subtitle="Soan/them van ban, upload file, ky so server, trinh duyet va phat hanh ngay trong popup CRUD."
        metrics={[
          { label: 'Tong van ban đi', value: crud.rows.length, helper: 'Du lieu demo', icon: 'solar:document-add-bold' },
          { label: 'Cho ky', value: crud.rows.filter((d) => d.status === 'Cho ky').length, helper: 'Can ky so', icon: 'solar:pen-new-square-bold' },
          { label: 'Đa phat hanh', value: crud.rows.filter((d) => d.status === 'Đa phat hanh').length, helper: 'San sang gui', icon: 'solar:check-circle-bold' },
          { label: 'Co tep', value: crud.rows.filter((d) => (d.attachments?.length ?? 0) > 0).length, helper: 'Đa upload đinh kem', icon: 'solar:paperclip-bold' },
        ]}
        listTitle="Danh sach van ban đi"
        listSubtitle="Them, sua, xoa van ban đi. Luong moi co upload file va popup ky so server."
        addLabel="Them van ban đi"
        searchPlaceholder="So ky hieu, trich yeu, noi nhan, trang thai"
        deleteEntityLabel="van ban đi"
        editorCreateTitle="Tao moi van ban đi"
        editorEditTitle="Cap nhat van ban đi"
        columns={[
          { key: 'code', label: 'So ky hieu' },
          { key: 'title', label: 'Trich yeu' },
          { key: 'type', label: 'Loai' },
          { key: 'receiver', label: 'Noi nhan' },
          { key: 'urgency', label: 'Đo khan', align: 'center' },
          { key: 'status', label: 'Trang thai', align: 'center' },
          { key: 'attachments', label: 'Tep', align: 'center' },
          { key: 'signStatus', label: 'Ky server', align: 'center' },
          { key: 'createdAt', label: 'Ngay tao', align: 'center' },
          { key: 'actions', label: 'Thao tac', align: 'right' },
        ]}
        tableRows={tableRows}
        keyword={crud.keyword}
        onKeywordChange={crud.setKeyword}
        openEditor={crud.openEditor}
        editingId={crud.editingId}
        deletingId={crud.deletingId}
        onOpenCreate={handleOpenCreate}
        onCloseEditor={() => crud.setOpenEditor(false)}
        onSubmit={() => crud.handleSubmit((form) => Boolean(form.code && form.title && form.receiver && (form.attachments?.length ?? 0) > 0))}
        onCloseDelete={() => crud.setDeletingId(null)}
        onConfirmDelete={crud.handleConfirmDelete}
        formContent={
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="So ky hieu" disabled={Boolean(crud.editingId)} value={crud.formValues.code} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, code: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Loai van ban" select value={crud.formValues.type} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, type: e.target.value }))}>
                <MenuItem value="Cong van">Cong van</MenuItem>
                <MenuItem value="Quyet đinh">Quyet đinh</MenuItem>
                <MenuItem value="Bao cao">Bao cao</MenuItem>
                <MenuItem value="Thong bao">Thong bao</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Đo khan" select value={crud.formValues.urgency} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, urgency: e.target.value }))}>
                <MenuItem value="Thuong">Thuong</MenuItem>
                <MenuItem value="Khan">Khan</MenuItem>
                <MenuItem value="Hoa toc">Hoa toc</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Trich yeu" value={crud.formValues.title} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Noi nhan" value={crud.formValues.receiver} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, receiver: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Trang thai" select value={crud.formValues.status} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, status: e.target.value }))}>
                <MenuItem value="Soan thao">Soan thao</MenuItem>
                <MenuItem value="Cho ky">Cho ky</MenuItem>
                <MenuItem value="Đa phat hanh">Đa phat hanh</MenuItem>
                <MenuItem value="Đa gui">Đa gui</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1.5}>
                <Button variant="outlined" component="label">
                  Upload file van ban
                  <input hidden multiple type="file" onChange={handleFileChange} />
                </Button>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {attachments.length > 0 ? attachments.map((file) => (
                    <Chip key={file} label={file} variant="outlined" onDelete={() => crud.setFormValues((prev) => ({ ...prev, attachments: (prev.attachments ?? []).filter((item) => item !== file) }))} />
                  )) : (
                    <Typography variant="body2" color="text.secondary">Chua co file đinh kem.</Typography>
                  )}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">Luong tao van ban đi: tao metadata, upload file, ky so server, trinh duyet/phat hanh, gui lien thong.</Alert>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2">Popup ky so server</Typography>
                    <Typography variant="body2" color="text.secondary">Nha cung cap: {crud.formValues.signProvider} | Trang thai: {crud.formValues.signStatus}</Typography>
                  </Box>
                  <Button variant="contained" onClick={handleOpenSignDialog} disabled={!crud.formValues.title || !crud.formValues.receiver || attachments.length === 0}>Mo popup ky so server</Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        }
      />

      <Dialog open={signDialogOpen} onClose={() => setSignDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Giao dien ky so server</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Ma van ban" value={crud.formValues.code} disabled />
            <TextField fullWidth label="Nha cung cap CA" value={crud.formValues.signProvider} disabled />
            <TextField fullWidth label="Tap tin ky" value={attachments.join(', ')} disabled multiline minRows={2} />
            <TextField fullWidth label="Chung thu so server" value="CN=GOVS Sign Server, O=UBND, C=VN" disabled />
            <Alert severity="success">Popup mo phong buoc ky server truoc khi trinh duyet va phat hanh.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignDialogOpen(false)}>Đong</Button>
          <Button variant="contained" onClick={handleConfirmServerSign}>Ky va gan trang thai</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
