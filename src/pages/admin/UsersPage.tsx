import { useMemo, useState } from 'react';
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
} from '@mui/material';
import { DataTable, MetricCard, PageShell, SectionCard, StatusChip } from '../../sections/interoperability/components';

type UserRecord = {
  id: string;
  fullName: string;
  username: string;
  unit: string;
  role: string;
  status: 'Active' | 'Locked';
  updatedAt: string;
};

const initialUsers: UserRecord[] = [
  {
    id: 'U-0001',
    fullName: 'Nguyễn Văn A',
    username: 'nva',
    unit: 'Văn phòng UBND',
    role: 'Văn thư',
    status: 'Active',
    updatedAt: '02/07/2026 09:10',
  },
  {
    id: 'U-0002',
    fullName: 'Trần Thị B',
    username: 'ttb',
    unit: 'Sở TTTT',
    role: 'Chuyên viên',
    status: 'Active',
    updatedAt: '03/07/2026 13:55',
  },
  {
    id: 'U-0003',
    fullName: 'Lê Văn C',
    username: 'lvc',
    unit: 'Sở Nội Vụ',
    role: 'Lãnh đạo',
    status: 'Locked',
    updatedAt: '04/07/2026 08:02',
  },
];

const emptyForm: UserRecord = {
  id: '',
  fullName: '',
  username: '',
  unit: '',
  role: 'Chuyên viên',
  status: 'Active',
  updatedAt: '',
};

export default function UsersPage() {
  const [rows, setRows] = useState<UserRecord[]>(initialUsers);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<UserRecord>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (user) =>
        user.id.toLowerCase().includes(q) ||
        user.fullName.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.unit.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  const tableRows = filtered.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    unit: user.unit,
    role: user.role,
    status: <StatusChip status={user.status} />,
    updatedAt: user.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(user)}>
          Sửa
        </Button>
        <Button size="small" color="error" onClick={() => setDeletingId(user.id)}>
          Xóa
        </Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingId(null);
    setFormValues({
      ...emptyForm,
      id: `U-${String(Date.now()).slice(-6)}`,
      updatedAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenEditor(true);
  }

  function handleEdit(user: UserRecord) {
    setEditingId(user.id);
    setFormValues(user);
    setOpenEditor(true);
  }

  function handleSubmit() {
    if (!formValues.id || !formValues.fullName || !formValues.username || !formValues.unit) return;

    const payload: UserRecord = {
      ...formValues,
      updatedAt: new Date().toLocaleString('vi-VN'),
    };

    if (editingId) {
      setRows((prev) => prev.map((item) => (item.id === editingId ? payload : item)));
    } else {
      setRows((prev) => [payload, ...prev]);
    }

    setOpenEditor(false);
  }

  function handleConfirmDelete() {
    if (!deletingId) return;
    setRows((prev) => prev.filter((item) => item.id !== deletingId));
    setDeletingId(null);
  }

  return (
    <PageShell
      title="Người dùng"
      subtitle="Danh sách tài khoản, thông tin cán bộ, đơn vị, vai trò. CRUD tách riêng theo màn hình; Create/Update/Delete đều thao tác bằng popup modal."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Tổng người dùng"
            value={rows.length}
            helper="Dữ liệu demo (local state)"
            icon="solar:users-group-rounded-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Đang hoạt động"
            value={rows.filter((u) => u.status === 'Active').length}
            helper="Có thể khóa/mở trong modal"
            icon="solar:shield-check-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Bị khóa"
            value={rows.filter((u) => u.status === 'Locked').length}
            helper="Khóa đăng nhập"
            icon="solar:lock-password-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Vai trò"
            value={new Set(rows.map((u) => u.role)).size}
            helper="Phân quyền theo vai trò"
            icon="solar:user-id-bold"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard
            title="Danh sách người dùng"
            subtitle="Tách riêng giao diện quản lý người dùng; có tìm kiếm, thêm/sửa/xóa bằng modal."
            action={
              <Button variant="contained" onClick={handleOpenCreate}>
                Thêm người dùng
              </Button>
            }
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Tìm kiếm"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Mã, họ tên, username, đơn vị, vai trò"
              />

              <Box sx={{ overflowX: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'id', label: 'Mã' },
                    { key: 'fullName', label: 'Họ tên' },
                    { key: 'username', label: 'Username' },
                    { key: 'unit', label: 'Đơn vị' },
                    { key: 'role', label: 'Vai trò' },
                    { key: 'status', label: 'Trạng thái', align: 'center' },
                    { key: 'updatedAt', label: 'Cập nhật', align: 'center' },
                    { key: 'actions', label: 'Thao tác', align: 'right' },
                  ]}
                  rows={tableRows}
                />
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={openEditor} onClose={() => setOpenEditor(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Cập nhật người dùng' : 'Tạo mới người dùng'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mã"
                disabled={Boolean(editingId)}
                value={formValues.id}
                onChange={(event) => setFormValues((prev) => ({ ...prev, id: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Username"
                value={formValues.username}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, username: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value as UserRecord['status'] }))
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Locked">Locked</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ tên"
                value={formValues.fullName}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Đơn vị"
                value={formValues.unit}
                onChange={(event) => setFormValues((prev) => ({ ...prev, unit: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vai trò"
                select
                value={formValues.role}
                onChange={(event) => setFormValues((prev) => ({ ...prev, role: event.target.value }))}
              >
                <MenuItem value="Văn thư">Văn thư</MenuItem>
                <MenuItem value="Chuyên viên">Chuyên viên</MenuItem>
                <MenuItem value="Trưởng phòng">Trưởng phòng</MenuItem>
                <MenuItem value="Lãnh đạo">Lãnh đạo</MenuItem>
                <MenuItem value="Quản trị">Quản trị</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thời điểm cập nhật"
                value={formValues.updatedAt}
                disabled
              />
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

      <Dialog open={Boolean(deletingId)} onClose={() => setDeletingId(null)} fullWidth maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa người dùng <strong>{deletingId}</strong> không? Thao tác này sẽ loại bản ghi khỏi danh sách demo.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingId(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}

