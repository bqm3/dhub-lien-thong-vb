import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { workflowApproves, WorkflowApprove } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: WorkflowApprove = {
  id: '',
  documentCode: '',
  title: '',
  approver: '',
  decision: 'Duyệt',
  comment: '',
  updatedAt: '',
};

export default function WorkflowApprovePage() {
  const crud = useCrudList(workflowApproves, emptyForm, 'id', {
    generateId: () => `AP-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    title: item.title,
    approver: item.approver,
    decision: <StatusChip status={item.decision} />,
    comment: item.comment,
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
      title="Phê duyệt / Từ chối"
      subtitle="Duyệt, từ chối, yêu cầu chỉnh sửa, ghi ý kiến xử lý."
      metrics={[
        { label: 'Tổng quyết định', value: crud.rows.length, helper: 'Phê duyệt', icon: 'solar:clipboard-check-bold' },
        { label: 'Duyệt', value: crud.rows.filter((d) => d.decision === 'Duyệt').length, helper: 'Đồng ý', icon: 'solar:check-circle-bold' },
        { label: 'Từ chối', value: crud.rows.filter((d) => d.decision === 'Từ chối').length, helper: 'Không đồng ý', icon: 'solar:close-circle-bold' },
        { label: 'Yêu cầu sửa', value: crud.rows.filter((d) => d.decision === 'Yêu cầu sửa').length, helper: 'Trả lại', icon: 'solar:pen-2-bold' },
      ]}
      listTitle="Danh sách phê duyệt"
      listSubtitle="CRUD phê duyệt qua popup modal."
      addLabel="Thêm quyết định"
      searchPlaceholder="Số văn bản, người duyệt, quyết định"
      deleteEntityLabel="quyết định"
      editorCreateTitle="Thêm quyết định phê duyệt"
      editorEditTitle="Cập nhật quyết định"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'title', label: 'Trích yếu' },
        { key: 'approver', label: 'Người duyệt' },
        { key: 'decision', label: 'Quyết định', align: 'center' },
        { key: 'comment', label: 'Ý kiến' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.approver))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Trích yếu" value={crud.formValues.title}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, title: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Người duyệt" value={crud.formValues.approver}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, approver: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Quyết định" select value={crud.formValues.decision}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, decision: e.target.value }))}>
              <MenuItem value="Duyệt">Duyệt</MenuItem>
              <MenuItem value="Từ chối">Từ chối</MenuItem>
              <MenuItem value="Yêu cầu sửa">Yêu cầu sửa</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="Ý kiến xử lý" value={crud.formValues.comment}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, comment: e.target.value }))} />
          </Grid>
        </Grid>
      }
    />
  );
}
