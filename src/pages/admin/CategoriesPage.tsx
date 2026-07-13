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

type CategoryRecord = {
  id: string;
  group:
    | 'Loại văn bản'
    | 'Độ khẩn'
    | 'Độ mật'
    | 'Lĩnh vực'
    | 'Trạng thái'
    | 'Hình thức gửi/nhận';
  code: string;
  name: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
};

const initialCategories: CategoryRecord[] = [
  {
    id: 'CAT-0001',
    group: 'Loại văn bản',
    code: 'CONG_VAN',
    name: 'Công văn',
    status: 'Active',
    updatedAt: '25/06/2026 08:12',
  },
  {
    id: 'CAT-0002',
    group: 'Độ khẩn',
    code: 'KHAN',
    name: 'Khẩn',
    status: 'Active',
    updatedAt: '25/06/2026 08:12',
  },
  {
    id: 'CAT-0003',
    group: 'Độ mật',
    code: 'MAT',
    name: 'Mật',
    status: 'Active',
    updatedAt: '25/06/2026 08:12',
  },
  {
    id: 'CAT-0004',
    group: 'Trạng thái',
    code: 'DA_PHAT_HANH',
    name: 'Đã phát hành',
    status: 'Active',
    updatedAt: '25/06/2026 08:12',
  },
];

const emptyForm: CategoryRecord = {
  id: '',
  group: 'Loại văn bản',
  code: '',
  name: '',
  status: 'Active',
  updatedAt: '',
};

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRecord[]>(initialCategories);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CategoryRecord>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  const tableRows = filtered.map((item) => ({
    group: item.group,
    code: item.code,
    name: item.name,
    status: <StatusChip status={item.status} />,
    updatedAt: item.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(item)}>
          Sửa
        </Button>
        <Button size="small" color="error" onClick={() => setDeletingId(item.id)}>
          Xóa
        </Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingId(null);
    setFormValues({
      ...emptyForm,
      id: `CAT-${String(Date.now()).slice(-6)}`,
      updatedAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenEditor(true);
  }

  function handleEdit(item: CategoryRecord) {
    setEditingId(item.id);
    setFormValues(item);
    setOpenEditor(true);
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name) return;
    const payload: CategoryRecord = { ...formValues, updatedAt: new Date().toLocaleString('vi-VN') };

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
      title="Danh mục dùng chung"
      subtitle="Quản lý danh mục: loại văn bản, độ khẩn/mật, lĩnh vực, trạng thái, hình thức gửi/nhận. CRUD tách riêng và thao tác bằng modal."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Tổng mục"
            value={rows.length}
            helper="Dữ liệu demo (local state)"
            icon="solar:widget-2-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Nhóm danh mục"
            value={new Set(rows.map((r) => r.group)).size}
            helper="Group theo nghiệp vụ"
            icon="solar:category-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Đang active"
            value={rows.filter((r) => r.status === 'Active').length}
            helper="Dùng cho dropdown/filter"
            icon="solar:checklist-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Ngưng dùng"
            value={rows.filter((r) => r.status === 'Inactive').length}
            helper="Ẩn khỏi lựa chọn"
            icon="solar:eye-closed-bold"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard
            title="Danh sách danh mục"
            subtitle="Màn hình danh mục tách riêng; thêm/sửa/xóa bằng modal."
            action={
              <Button variant="contained" onClick={handleOpenCreate}>
                Thêm danh mục
              </Button>
            }
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Tìm kiếm"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nhóm, mã, tên, trạng thái"
              />

              <Box sx={{ overflowX: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'group', label: 'Nhóm' },
                    { key: 'code', label: 'Mã' },
                    { key: 'name', label: 'Tên' },
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
        <DialogTitle>{editingId ? 'Cập nhật danh mục' : 'Tạo mới danh mục'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Mã nội bộ" disabled value={formValues.id} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nhóm"
                select
                value={formValues.group}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, group: event.target.value as CategoryRecord['group'] }))
                }
              >
                <MenuItem value="Loại văn bản">Loại văn bản</MenuItem>
                <MenuItem value="Độ khẩn">Độ khẩn</MenuItem>
                <MenuItem value="Độ mật">Độ mật</MenuItem>
                <MenuItem value="Lĩnh vực">Lĩnh vực</MenuItem>
                <MenuItem value="Trạng thái">Trạng thái</MenuItem>
                <MenuItem value="Hình thức gửi/nhận">Hình thức gửi/nhận</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value as CategoryRecord['status'] }))
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Code"
                value={formValues.code}
                onChange={(event) => setFormValues((prev) => ({ ...prev, code: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Tên"
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Thời điểm cập nhật" value={formValues.updatedAt} disabled />
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
          Bạn có chắc muốn xóa danh mục <strong>{deletingId}</strong> không?
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

