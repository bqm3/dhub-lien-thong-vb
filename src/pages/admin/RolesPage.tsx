import { useMemo, useState } from 'react';
import {
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
import { DataTable, GridRow, MetricCard, PageShell, SectionCard, StatusChip } from '../../sections/interoperability/components';

type RoleRecord = {
  code: string;
  name: string;
  scope: 'Hệ thống' | 'Đơn vị';
  status: 'Active' | 'Inactive';
  permissions: string[];
  updatedAt: string;
};

const initialRoles: RoleRecord[] = [
  {
    code: 'ADMIN',
    name: 'Quản trị hệ thống',
    scope: 'Hệ thống',
    status: 'Active',
    permissions: ['ADMIN_MANAGE', 'DOC_MANAGE', 'WF_MANAGE', 'EXCHANGE_MANAGE'],
    updatedAt: '25/06/2026 08:00',
  },
  {
    code: 'AGENCY',
    name: 'Đơn vị',
    scope: 'Đơn vị',
    status: 'Active',
    permissions: ['DOC_MANAGE', 'WF_MANAGE', 'EXCHANGE_MANAGE'],
    updatedAt: '28/06/2026 10:15',
  },
];

const emptyForm: RoleRecord = {
  code: '',
  name: '',
  scope: 'Đơn vị',
  status: 'Active',
  permissions: [],
  updatedAt: '',
};

const permissionCatalog = [
  'ADMIN_MANAGE',
  'DOC_MANAGE',
  'WF_MANAGE',
  'EXCHANGE_MANAGE',
];

export default function RolesPage() {
  const [rows, setRows] = useState<RoleRecord[]>(initialRoles);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<RoleRecord>(emptyForm);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (role) =>
        role.code.toLowerCase().includes(q) ||
        role.name.toLowerCase().includes(q) ||
        role.scope.toLowerCase().includes(q) ||
        role.permissions.join(',').toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  const tableRows = filtered.map((role) => ({
    code: role.code,
    name: role.name,
    scope: role.scope,
    permissions: (
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
        {role.permissions.slice(0, 3).map((perm) => (
          <Chip key={perm} label={perm} size="small" variant="outlined" />
        ))}
        {role.permissions.length > 3 && (
          <Chip label={`+${role.permissions.length - 3}`} size="small" />
        )}
      </Stack>
    ),
    status: <StatusChip status={role.status} />,
    updatedAt: role.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(role)}>
          Sửa
        </Button>
        <Button size="small" color="error" onClick={() => setDeletingCode(role.code)}>
          Xóa
        </Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyForm,
      code: `ROLE_${String(Date.now()).slice(-6)}`,
      updatedAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenEditor(true);
  }

  function handleEdit(role: RoleRecord) {
    setEditingCode(role.code);
    setFormValues(role);
    setOpenEditor(true);
  }

  function togglePermission(permission: string) {
    setFormValues((prev) => {
      const exists = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter((p) => p !== permission) : [...prev.permissions, permission],
      };
    });
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name) return;
    const payload: RoleRecord = { ...formValues, updatedAt: new Date().toLocaleString('vi-VN') };

    if (editingCode) {
      setRows((prev) => prev.map((item) => (item.code === editingCode ? payload : item)));
    } else {
      setRows((prev) => [payload, ...prev]);
    }

    setOpenEditor(false);
  }

  function handleConfirmDelete() {
    if (!deletingCode) return;
    setRows((prev) => prev.filter((item) => item.code !== deletingCode));
    setDeletingCode(null);
  }

  return (
    <PageShell
      title="Vai trò / Phân quyền"
      subtitle="Quản lý 2 vai trò: Admin (hệ thống) và Đơn vị. CRUD bằng popup modal."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng vai trò"
          value={rows.length}
          helper="Dữ liệu demo (local state)"
          icon="solar:user-id-bold"
        />
        <MetricCard
          label="Đang active"
          value={rows.filter((r) => r.status === 'Active').length}
          helper="Gán cho người dùng/đơn vị"
          icon="solar:shield-check-bold"
        />
        <MetricCard
          label="Quyền (catalog)"
          value={permissionCatalog.length}
          helper="Danh sách permission mẫu"
          icon="solar:list-check-bold"
        />
        <MetricCard
          label="Scope"
          value={new Set(rows.map((r) => r.scope)).size}
          helper="Hệ thống / Đơn vị"
          icon="solar:hierarchy-2-bold"
        />
      </GridRow>

      <SectionCard
            title="Danh sách vai trò"
            subtitle="Tách riêng giao diện role/permission; thêm/sửa/xóa bằng modal."
            action={
              <Button variant="contained" onClick={handleOpenCreate}>
                Thêm vai trò
              </Button>
            }
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Tìm kiếm"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Mã, tên, scope, permission"
              />

              <Box sx={{ overflowX: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'code', label: 'Mã' },
                    { key: 'name', label: 'Tên vai trò' },
                    { key: 'scope', label: 'Scope', align: 'center' },
                    { key: 'permissions', label: 'Permissions' },
                    { key: 'status', label: 'Trạng thái', align: 'center' },
                    { key: 'updatedAt', label: 'Cập nhật', align: 'center' },
                    { key: 'actions', label: 'Thao tác', align: 'right' },
                  ]}
                  rows={tableRows}
                />
              </Box>
            </Stack>
          </SectionCard>

      <Dialog open={openEditor} onClose={() => setOpenEditor(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingCode ? 'Cập nhật vai trò' : 'Tạo mới vai trò'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mã"
                disabled={Boolean(editingCode)}
                value={formValues.code}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, code: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Tên vai trò"
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Scope"
                value={formValues.scope}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, scope: event.target.value as RoleRecord['scope'] }))
                }
                select
              >
                <MenuItem value="Hệ thống">Hệ thống</MenuItem>
                <MenuItem value="Đơn vị">Đơn vị</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value as RoleRecord['status'] }))
                }
                select
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Thời điểm cập nhật" value={formValues.updatedAt} disabled />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Permissions
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {permissionCatalog.map((permission) => {
                  const selected = formValues.permissions.includes(permission);
                  return (
                    <Chip
                      key={permission}
                      label={permission}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      size="small"
                      onClick={() => togglePermission(permission)}
                      sx={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditor(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deletingCode)} onClose={() => setDeletingCode(null)} fullWidth maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa vai trò <strong>{deletingCode}</strong> không?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCode(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}

