import { ChangeEvent, useMemo } from 'react';
import { Alert, Button, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { incomingDocs, IncomingDoc } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: IncomingDoc = {
  code: '',
  title: '',
  sender: '',
  assignedTo: '',
  deadline: '',
  status: 'Cho phan luong',
  attachments: [],
};

export default function IncomingDocumentsPage() {
  const crud = useCrudList(incomingDocs, emptyForm, 'code', {
    generateId: () => `VB-DEN-${String(Date.now()).slice(-6)}`,
  });

  const attachments = useMemo(() => crud.formValues.attachments ?? [], [crud.formValues.attachments]);

  const handleOpenCreate = () => {
    crud.setEditingId(null);
    crud.setFormValues({
      ...emptyForm,
      code: `VB-DEN-${String(Date.now()).slice(-6)}`,
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

  const tableRows = crud.filtered.map((doc) => ({
    code: doc.code,
    title: doc.title,
    sender: doc.sender,
    assignedTo: doc.assignedTo,
    deadline: doc.deadline,
    status: <StatusChip status={doc.status} />,
    attachments: (doc.attachments ?? []).length,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(doc)}>Sua</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(doc.code)}>Xoa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Van ban đen"
      subtitle="Tiep nhan van ban tu đon vi khac, gan file đinh kem, phan luong xu ly va giao viec."
      metrics={[
        { label: 'Tong van ban đen', value: crud.rows.length, helper: 'Du lieu demo', icon: 'solar:inbox-in-bold' },
        { label: 'Đang xu ly', value: crud.rows.filter((d) => d.status === 'Đang xu ly').length, helper: 'Can theo doi', icon: 'solar:clock-circle-bold' },
        { label: 'Cho phan luong', value: crud.rows.filter((d) => d.status === 'Cho phan luong').length, helper: 'Chua giao viec', icon: 'solar:sort-horizontal-bold' },
        { label: 'Co tep', value: crud.rows.filter((d) => (d.attachments?.length ?? 0) > 0).length, helper: 'Đa gan file nhan vao', icon: 'solar:paperclip-bold' },
      ]}
      listTitle="Danh sach van ban đen"
      listSubtitle="CRUD van ban đen co upload file ngay trong popup modal."
      addLabel="Tiep nhan van ban"
      searchPlaceholder="So ky hieu, trich yeu, noi gui, nguoi xu ly"
      deleteEntityLabel="van ban đen"
      editorCreateTitle="Tiep nhan van ban moi"
      editorEditTitle="Cap nhat van ban đen"
      columns={[
        { key: 'code', label: 'So ky hieu' },
        { key: 'title', label: 'Trich yeu' },
        { key: 'sender', label: 'Noi gui' },
        { key: 'assignedTo', label: 'Nguoi xu ly' },
        { key: 'deadline', label: 'Han xu ly', align: 'center' },
        { key: 'status', label: 'Trang thai', align: 'center' },
        { key: 'attachments', label: 'Tep', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((form) => Boolean(form.code && form.title && form.sender && (form.attachments?.length ?? 0) > 0))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="So ky hieu" disabled={Boolean(crud.editingId)} value={crud.formValues.code} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, code: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Trich yeu" value={crud.formValues.title} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, title: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Noi gui" value={crud.formValues.sender} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, sender: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Nguoi xu ly" value={crud.formValues.assignedTo} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, assignedTo: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Han xu ly" value={crud.formValues.deadline} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, deadline: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trang thai" select value={crud.formValues.status} onChange={(e) => crud.setFormValues((prev) => ({ ...prev, status: e.target.value }))}>
              <MenuItem value="Cho phan luong">Cho phan luong</MenuItem>
              <MenuItem value="Đang xu ly">Đang xu ly</MenuItem>
              <MenuItem value="Hoan thanh">Hoan thanh</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1.5}>
              <Button variant="outlined" component="label">
                Upload file van ban đen
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
            <Alert severity="info">Luong van ban đen: tiep nhan, upload file, phan luong, giao viec, theo doi ket qua xu ly.</Alert>
          </Grid>
        </Grid>
      }
    />
  );
}
