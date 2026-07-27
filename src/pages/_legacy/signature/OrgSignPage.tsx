import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import CrudListLayout from '../../components/crud/CrudListLayout';
import { useCrudList } from '../../hooks/useCrudList';
import { orgSigns, OrgSign } from '../../sections/workflow/mockData';
import { StatusChip } from '../../sections/interoperability/components';

const emptyForm: OrgSign = {
  id: '',
  documentCode: '',
  orgName: '',
  stampType: 'Đóng dấu điện tử',
  status: 'Chờ ký',
  signedAt: '',
};

export default function OrgSignPage() {
  const crud = useCrudList(orgSigns, emptyForm, 'id', {
    generateId: () => `KT-${String(Date.now()).slice(-6)}`,
  });

  const tableRows = crud.filtered.map((item) => ({
    documentCode: item.documentCode,
    orgName: item.orgName,
    stampType: item.stampType,
    status: <StatusChip status={item.status} />,
    signedAt: item.signedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => crud.handleEdit(item)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => crud.setDeletingId(item.id)}>Xóa</Button>
      </Stack>
    ),
  }));

  return (
    <CrudListLayout
      title="Ký tổ chức / Đóng dấu"
      subtitle="Đóng dấu cơ quan sau khi lãnh đạo ký."
      metrics={[
        { label: 'Tổng lượt ký', value: crud.rows.length, helper: 'Ký tổ chức', icon: 'solar:stamp-bold' },
        { label: 'Thành công', value: crud.rows.filter((d) => d.status === 'Thành công').length, helper: 'Đã đóng dấu', icon: 'solar:check-circle-bold' },
        { label: 'Chờ ký', value: crud.rows.filter((d) => d.status === 'Chờ ký').length, helper: 'Đang chờ', icon: 'solar:clock-circle-bold' },
        { label: 'Thất bại', value: crud.rows.filter((d) => d.status === 'Thất bại').length, helper: 'Lỗi ký', icon: 'solar:close-circle-bold' },
      ]}
      listTitle="Danh sách ký tổ chức"
      listSubtitle="CRUD ký tổ chức qua popup modal."
      addLabel="Thêm yêu cầu đóng dấu"
      searchPlaceholder="Số văn bản, tổ chức, loại dấu"
      deleteEntityLabel="bản ghi ký tổ chức"
      editorCreateTitle="Thêm yêu cầu ký tổ chức"
      editorEditTitle="Cập nhật ký tổ chức"
      columns={[
        { key: 'documentCode', label: 'Số văn bản' },
        { key: 'orgName', label: 'Tổ chức' },
        { key: 'stampType', label: 'Loại dấu', align: 'center' },
        { key: 'status', label: 'Trạng thái', align: 'center' },
        { key: 'signedAt', label: 'Thời gian', align: 'center' },
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
      onSubmit={() => crud.handleSubmit((f) => Boolean(f.documentCode && f.orgName))}
      onCloseDelete={() => crud.setDeletingId(null)}
      onConfirmDelete={crud.handleConfirmDelete}
      formContent={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số văn bản" value={crud.formValues.documentCode}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Tổ chức" value={crud.formValues.orgName}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, orgName: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Loại dấu" select value={crud.formValues.stampType}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, stampType: e.target.value }))}>
              <MenuItem value="Đóng dấu điện tử">Đóng dấu điện tử</MenuItem>
              <MenuItem value="Dấu mộc">Dấu mộc</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Trạng thái" select value={crud.formValues.status}
              onChange={(e) => crud.setFormValues((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Chờ ký">Chờ ký</MenuItem>
              <MenuItem value="Thành công">Thành công</MenuItem>
              <MenuItem value="Thất bại">Thất bại</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      }
    />
  );
}
