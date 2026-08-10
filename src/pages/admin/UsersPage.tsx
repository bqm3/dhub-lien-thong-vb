import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Autocomplete,
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
  Chip,
} from '@mui/material';
import { DataTable, GridRow, MetricCard, PageShell, SectionCard, StatusChip } from '../../sections/interoperability/components';
import { usersApi, UserItem } from '../../services/usersApi';
import { dmCategoryApi } from '../../services/dmCategoryApi';
import { useAuthContext } from '../../auth/useAuthContext';
import { getDefaultDateRange } from '../../services/getDefaultDateRange';
import Iconify from '../../components/iconify';

type UserRecord = {
  id: string;
  numericId?: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  unit: string;
  unitCode: string;
  role: string;
  roleCode: string;
  position: string;
  status: 'Active' | 'Locked';
  updatedAt: string;
};

const emptyForm: UserRecord = {
  id: '',
  fullName: '',
  username: '',
  email: '',
  phone: '',
  unit: '',
  unitCode: '',
  role: 'Đơn vị',
  roleCode: 'AGENCY',
  position: '',
  status: 'Active',
  updatedAt: '',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useAuthContext();
  const defaultDates = useMemo(() => getDefaultDateRange(), []);

  // Fetch danh sách Đơn vị từ DM_CATEGORY (Lọc PARENT_CODE = DON_VI hoặc đơn vị con)
  const { data: unitOptions = [] } = useQuery<{ code: string; name: string; label: string }[]>({
    queryKey: ['userPageUnitOptions'],
    queryFn: async () => {
      const res = await dmCategoryApi.getList({ pageIndex: 1, pageSize: 500 });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);

      // Lọc các đơn vị có PARENT_CODE = DON_VI hoặc là đơn vị con của PARENT_CODE = DON_VI
      const validUnitCodes = new Set<string>();
      let addedNew = true;
      while (addedNew) {
        addedNew = false;
        rawList.forEach((item: any) => {
          const code = String(item.CODE || item.code || '').trim();
          const parentCode = String(item.PARENT_CODE || item.parentCode || '').trim();
          if (code && !validUnitCodes.has(code)) {
            if (parentCode.toUpperCase() === 'DON_VI' || validUnitCodes.has(parentCode)) {
              validUnitCodes.add(code);
              addedNew = true;
            }
          }
        });
      }

      const options: { code: string; name: string; label: string }[] = [];
      const seen = new Set<string>();
      rawList.forEach((item: any) => {
        const code = String(item.CODE || item.code || '').trim();
        const name = String(item.NAME || item.name || '').trim();
        if (code && validUnitCodes.has(code) && !seen.has(code)) {
          seen.add(code);
          options.push({
            code,
            name: name || code,
            label: name ? `${code} - ${name}` : code,
          });
        }
      });
      return options;
    },
  });

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<UserRecord>(emptyForm);
  const [deletingUser, setDeletingUser] = useState<{ id: number; name: string } | null>(null);

  // 1. Fetch Users from Database API via React Query
  const { data, isFetching, refetch } = useQuery<{ rows: UserRecord[]; total: number }>({
    queryKey: ['usersList', pageIndex, pageSize, defaultDates.cdateStart, defaultDates.cdateEnd],
    queryFn: async () => {
      const res = await usersApi.getList({
        pageIndex,
        pageSize,
        cdateStart: defaultDates.cdateStart,
        cdateEnd: defaultDates.cdateEnd,
      });

      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      const total = res?.TotalRecords ?? res?.totalRecords ?? (rawList ? rawList.length : 0);

      if (!rawList) return { rows: [], total: 0 };

      const mapped: UserRecord[] = rawList.map((item: any) => ({
        id: item.ID || item.id ? `U-${item.ID || item.id}` : (item.USERNAME || item.username),
        numericId: item.ID || item.id,
        username: item.USERNAME || item.username || '',
        fullName: item.FULL_NAME || item.fullName || item.NAME || item.name || '',
        email: item.EMAIL || item.email || '',
        phone: item.PHONE || item.phone || '',
        unit: item.UNIT_NAME || item.unitName || item.UNIT_CODE || item.unitCode || 'Chưa phân đơn vị',
        unitCode: item.UNIT_CODE || item.unitCode || '',
        role: item.ROLE_NAME || item.roleName || item.ROLE_CODE || item.roleCode || 'Người dùng',
        roleCode: item.ROLE_CODE || item.roleCode || 'USER',
        position: item.POSITION || item.position || '',
        status: (item.IS_ACTIVE !== undefined ? item.IS_ACTIVE : item.isActive) === 1 ? 'Active' : 'Locked',
        updatedAt: item.LDATE || item.ldate || item.CDATE || item.cdate || 'Chưa cập nhật',
      }));

      return { rows: mapped, total };
    },
  });

  const rows = data?.rows || [];
  const totalCount = data?.total || 0;

  // 2. Client-side Search filter
  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (user) =>
        user.id.toLowerCase().includes(q) ||
        user.fullName.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.unit.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  // 3. Save Mutation (Create & Update)
  const saveMutation = useMutation({
    mutationFn: async (payload: UserItem) => {
      const res = await usersApi.createOrUpdate(payload);
      if (res?.ResultCode && res.ResultCode !== 200 && res.ResultCode !== 0) {
        throw new Error(res.Message || 'Lưu thông tin người dùng thất bại.');
      }
      return res;
    },
    onSuccess: () => {
      enqueueSnackbar(editingId ? 'Cập nhật người dùng thành công!' : 'Tạo mới người dùng thành công!', {
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      setOpenEditor(false);
    },
    onError: (err: any) => {
      console.error('Save user error:', err);
      enqueueSnackbar(err?.message || 'Lưu thông tin người dùng thất bại', { variant: 'error' });
    },
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await usersApi.delete(id);
      if (res?.ResultCode && res.ResultCode !== 200 && res.ResultCode !== 0) {
        throw new Error(res.Message || 'Xóa người dùng thất bại.');
      }
      return res;
    },
    onSuccess: () => {
      enqueueSnackbar('Đã xóa người dùng thành công!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      setDeletingUser(null);
    },
    onError: (err: any) => {
      console.error('Delete user error:', err);
      enqueueSnackbar(err?.message || 'Xóa người dùng thất bại', { variant: 'error' });
    },
  });

  const tableRows = filteredRows.map((user) => ({
    id: user.id,
    fullName: (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {user.fullName || '—'}
        </Typography>
        {user.email && (
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        )}
      </Box>
    ),
    username: (
      <Chip
        label={user.username}
        size="small"
        variant="outlined"
        color={user.username === currentUser?.username ? 'primary' : 'default'}
        sx={{ fontWeight: 600 }}
      />
    ),
    unit: user.unit,
    role: <Chip label={user.role} size="small" color={user.roleCode === 'ADMIN' ? 'error' : 'info'} variant="soft" />,
    status: <StatusChip status={user.status} />,
    updatedAt: user.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" startIcon={<Iconify icon="solar:pen-bold" />} onClick={() => handleEdit(user)}>
          Sửa
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          onClick={() => user.numericId && setDeletingUser({ id: user.numericId, name: user.fullName || user.username })}
        >
          Xóa
        </Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingId(null);
    setFormValues({
      ...emptyForm,
      id: `U-NEW`,
      updatedAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenEditor(true);
  }

  function handleEdit(user: UserRecord) {
    setEditingId(user.numericId || null);
    setFormValues(user);
    setOpenEditor(true);
  }

  function handleSubmit() {
    if (!formValues.username || !formValues.fullName) {
      enqueueSnackbar('Vui lòng điền Username và Họ tên', { variant: 'warning' });
      return;
    }

    saveMutation.mutate({
      id: editingId || undefined,
      username: formValues.username,
      fullName: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      unitCode: formValues.unitCode || formValues.unit,
      unitName: formValues.unit,
      roleCode: formValues.roleCode,
      roleName: formValues.role,
      position: formValues.position,
      isActive: formValues.status === 'Active' ? 1 : 0,
    });
  }

  function handleConfirmDelete() {
    if (!deletingUser) return;
    deleteMutation.mutate(deletingUser.id);
  }

  return (
    <PageShell
      title="Quản lý Người dùng"
      subtitle="Danh sách tài khoản cán bộ kết nối Keycloak và Cơ sở dữ liệu tập trung. Hỗ trợ tìm kiếm, thêm, sửa, xóa trực tiếp."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng người dùng DB"
          value={totalCount}
          helper="Bản ghi người dùng trong CSDL"
          icon="solar:users-group-rounded-bold"
          backgroundColor="#01AD65"
        />
        <MetricCard
          label="Đang hoạt động"
          value={rows.filter((u) => u.status === 'Active').length}
          helper="Tài khoản kích hoạt"
          icon="solar:shield-check-bold"
          backgroundColor="#028EDD"
        />
        <MetricCard
          label="Tài khoản Keycloak"
          value={currentUser?.username || 'Chưa đăng nhập'}
          helper={`Domain: ${currentUser?.realm || 'Keycloak'}`}
          icon="solar:user-id-bold"
          backgroundColor="#9E50FE"
        />
        <MetricCard
          label="Vai trò hệ thống"
          value={new Set(rows.map((u) => u.role)).size || 1}
          helper="Nhóm phân quyền khả dụng"
          icon="solar:lock-password-bold"
          backgroundColor="#FF8551"
        />
      </GridRow>

      <SectionCard
        title="Danh sách người dùng"
        subtitle="Quản lý thông tin tài khoản người dùng."
        action={
          <Button variant="contained" startIcon={<Iconify icon="solar:user-plus-bold" />} onClick={handleOpenCreate}>
            Thêm người dùng
          </Button>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
            <TextField
              size="small"
              label="Tìm kiếm nhanh"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Mã, họ tên, username, email, đơn vị..."
              sx={{ width: { xs: '100%', sm: 360 } }}
            />
            <Button variant="outlined" color="inherit" startIcon={<Iconify icon="solar:restart-bold" />} onClick={() => refetch()}>
              Làm mới
            </Button>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <DataTable
              columns={[
                { key: 'id', label: 'Mã' },
                { key: 'fullName', label: 'Họ tên / Email' },
                { key: 'username', label: 'Username Keycloak' },
                { key: 'unit', label: 'Đơn vị công tác' },
                { key: 'role', label: 'Vai trò' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'updatedAt', label: 'Cập nhật', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={tableRows}
              loading={isFetching}
              pageIndex={pageIndex}
              rowsPerPage={pageSize}
              totalCount={totalCount}
              onPageChange={(newPage) => setPageIndex(newPage)}
              onRowsPerPageChange={(newSize) => {
                setPageSize(newSize);
                setPageIndex(1);
              }}
            />
          </Box>
        </Stack>
      </SectionCard>

      {/* Dialog Tạo mới / Cập nhật người dùng */}
      <Dialog open={openEditor} onClose={() => setOpenEditor(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Cập nhật thông tin người dùng' : 'Thêm mới người dùng'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Tài khoản / Username Keycloak"
                value={formValues.username}
                onChange={(event) => setFormValues((prev) => ({ ...prev, username: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Họ và tên"
                value={formValues.fullName}
                onChange={(event) => setFormValues((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formValues.email}
                onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formValues.phone}
                onChange={(event) => setFormValues((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={unitOptions}
                getOptionLabel={(option: any) => option.label || option.name || option.code || ''}
                value={
                  unitOptions.find(
                    (u: any) =>
                      u.code === formValues.unitCode ||
                      u.code === formValues.unit ||
                      u.name === formValues.unit ||
                      u.label === formValues.unit
                  ) || (formValues.unit ? { code: formValues.unitCode || formValues.unit, name: formValues.unit, label: formValues.unit } : null)
                }
                onChange={(_, newValue: any) => {
                  const code = newValue ? newValue.code : '';
                  const name = newValue ? newValue.name || newValue.label : '';
                  setFormValues((prev) => ({
                    ...prev,
                    unitCode: code,
                    unit: name || code,
                  }));
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Đơn vị công tác"
                    placeholder="Chọn đơn vị công tác..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vai trò hệ thống"
                select
                value={formValues.roleCode}
                onChange={(event) => {
                  const code = event.target.value;
                  const name = code === 'ADMIN' ? 'Admin' : code === 'AGENCY' ? 'Đơn vị' : 'Người dùng';
                  setFormValues((prev) => ({ ...prev, roleCode: code, role: name }));
                }}
              >
                <MenuItem value="ADMIN">Quản trị hệ thống (Admin)</MenuItem>
                <MenuItem value="AGENCY">Cán bộ Đơn vị (Agency)</MenuItem>
                <MenuItem value="USER">Người dùng thông thường (User)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chức vụ"
                value={formValues.position}
                onChange={(event) => setFormValues((prev) => ({ ...prev, position: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value as UserRecord['status'] }))
                }
              >
                <MenuItem value="Active">Hoạt động (Active)</MenuItem>
                <MenuItem value="Locked">Tạm khóa (Locked)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditor(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Xác nhận Xóa */}
      <Dialog open={Boolean(deletingUser)} onClose={() => setDeletingUser(null)} fullWidth maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa người dùng <strong>{deletingUser?.name}</strong> không?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingUser(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa người dùng'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
