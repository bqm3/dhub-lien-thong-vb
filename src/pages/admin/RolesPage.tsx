import { useEffect, useMemo, useState } from 'react';
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
import { dmCategoryApi, DMCategoryItem } from '../../services/dmCategoryApi';
import { getDefaultDateRange } from '../../services/getDefaultDateRange';

type RoleRecord = {
  code: string;
  numericId?: number;
  name: string;
  parentCode: string;
  scope: 'Hệ thống' | 'Đơn vị';
  status: 'Active' | 'Inactive';
  permissions: string[];
  updatedAt: string;
};

const DEFAULT_PARENT_CODE = 'VAI_TRO';

const emptyForm: RoleRecord = {
  code: '',
  name: '',
  parentCode: DEFAULT_PARENT_CODE,
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
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);
  const [parentCodeFilter, setParentCodeFilter] = useState(DEFAULT_PARENT_CODE);

  const [rows, setRows] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<RoleRecord>(emptyForm);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, [cdateStart, cdateEnd, parentCodeFilter]);

  async function fetchRoles() {
    setLoading(true);
    try {
      const res = await dmCategoryApi.getList({
        pageIndex: 1,
        pageSize: 200,
        cdateStart,
        cdateEnd,
        searchField: parentCodeFilter ? { PARENT_CODE: parentCodeFilter } : {},
      });
      if (res.data) {
        const mapped: RoleRecord[] = res.data.map((item: any) => ({
          code: item.code,
          numericId: item.id,
          name: item.name,
          parentCode: item.parentCode || parentCodeFilter,
          scope: 'Đơn vị',
          status: item.isActive === 1 ? 'Active' : 'Inactive',
          permissions: ['DOC_MANAGE', 'EXCHANGE_MANAGE'],
          updatedAt: item.cdate || new Date().toLocaleDateString('vi-VN'),
        }));
        setRows(mapped);
      }
    } catch (err) {
      console.warn('API error fetching roles', err);
    } finally {
      setLoading(false);
    }
  }

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
      parentCode: parentCodeFilter || DEFAULT_PARENT_CODE,
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

  async function handleSubmit() {
    if (!formValues.code || !formValues.name) return;

    const apiItem: DMCategoryItem = {
      id: formValues.numericId,
      code: formValues.code,
      name: formValues.name,
      parentCode: formValues.parentCode || parentCodeFilter || DEFAULT_PARENT_CODE,
      description: formValues.scope,
      isActive: formValues.status === 'Active' ? 1 : 0,
      status: 1,
    };

    const res = await dmCategoryApi.createOrUpdate(apiItem);
    if (res.success) {
      await fetchRoles();
      setOpenEditor(false);
    } else {
      alert(`Lỗi API /DM_CATEGORY/Create: ${res.message}`);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingCode) return;
    const target = rows.find((r) => r.code === deletingCode);

    if (target?.numericId) {
      const res = await dmCategoryApi.delete(target.numericId);
      if (!res.success) {
        alert(`Lỗi xóa API: ${res.message}`);
        return;
      }
    }

    setRows((prev) => prev.filter((item) => item.code !== deletingCode));
    setDeletingCode(null);
  }

  return (
    <PageShell
      title="Vai trò / Phân quyền"
      subtitle="Quản lý vai trò, phân quyền truy cập. Lọc và lưu mặc định PARENT_CODE = VAI_TRO."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng vai trò"
          value={rows.length}
          helper={`Filter PARENT_CODE: ${parentCodeFilter}`}
          icon="solar:user-id-bold"
        />
        <MetricCard
          label="Đang active"
          value={rows.filter((r) => r.status === 'Active').length}
          helper="Gán cho người dùng"
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
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={fetchRoles} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới (API)'}
            </Button>
            <Button variant="contained" onClick={handleOpenCreate}>
              Thêm vai trò
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Tìm kiếm"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Mã, tên, scope, permission"
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Mã nhóm (PARENT_CODE)"
              value={parentCodeFilter}
              onChange={(e) => setParentCodeFilter(e.target.value)}
              placeholder="Mặc định VAI_TRO"
              sx={{ minWidth: 200 }}
            />
            <TextField
              size="small"
              type="date"
              label="Từ ngày (CDATE_START)"
              InputLabelProps={{ shrink: true }}
              value={cdateStart}
              onChange={(e) => setCdateStart(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              type="date"
              label="Đến ngày (CDATE_END)"
              InputLabelProps={{ shrink: true }}
              value={cdateEnd}
              onChange={(e) => setCdateEnd(e.target.value)}
              sx={{ minWidth: 160 }}
            />
          </Stack>

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
                onChange={(event) => setFormValues((prev) => ({ ...prev, code: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="PARENT_CODE (Nhóm vai trò)"
                value={formValues.parentCode}
                onChange={(event) => setFormValues((prev) => ({ ...prev, parentCode: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
