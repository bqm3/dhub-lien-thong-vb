import { useEffect, useMemo, useState } from 'react';
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
import { DataTable, GridRow, MetricCard, PageShell, SectionCard, StatusChip } from '../../sections/interoperability/components';
import { dmCategoryApi, DMCategoryItem, getDefaultDateRange } from '../../services/dmCategoryApi';

type CategoryRecord = {
  id: string;
  numericId?: number;
  group:
    | 'Loại văn bản'
    | 'Độ khẩn'
    | 'Độ mật'
    | 'Lĩnh vực'
    | 'Trạng thái'
    | 'Hình thức gửi/nhận';
  code: string;
  name: string;
  parentCode: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
};

const DEFAULT_PARENT_CODE = 'DANH_MUC';

const emptyForm: CategoryRecord = {
  id: '',
  group: 'Loại văn bản',
  code: '',
  name: '',
  parentCode: DEFAULT_PARENT_CODE,
  status: 'Active',
  updatedAt: '',
};

export default function CategoriesPage() {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);
  const [parentCodeFilter, setParentCodeFilter] = useState(DEFAULT_PARENT_CODE);

  const [rows, setRows] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CategoryRecord>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch API DM_CATEGORY với filter PARENT_CODE = DANH_MUC
  useEffect(() => {
    fetchCategories();
  }, [cdateStart, cdateEnd, parentCodeFilter]);

  async function fetchCategories() {
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
        const mapped: CategoryRecord[] = res.data.map((item) => ({
          id: item.id ? `CAT-${item.id}` : item.code,
          numericId: item.id,
          group: (item.description as any) || 'Loại văn bản',
          code: item.code,
          name: item.name,
          parentCode: item.parentCode || parentCodeFilter,
          status: item.isActive === 1 ? 'Active' : 'Inactive',
          updatedAt: item.cdate || new Date().toLocaleDateString('vi-VN'),
        }));
        setRows(mapped);
      }
    } catch (err) {
      console.warn('Backend API DM_CATEGORY unavailable', err);
    } finally {
      setLoading(false);
    }
  }

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
      parentCode: parentCodeFilter || DEFAULT_PARENT_CODE,
      updatedAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenEditor(true);
  }

  function handleEdit(item: CategoryRecord) {
    setEditingId(item.id);
    setFormValues(item);
    setOpenEditor(true);
  }

  async function handleSubmit() {
    if (!formValues.code || !formValues.name) return;

    const apiItem: DMCategoryItem = {
      id: formValues.numericId,
      code: formValues.code,
      name: formValues.name,
      parentCode: formValues.parentCode || parentCodeFilter || DEFAULT_PARENT_CODE,
      description: formValues.group,
      isActive: formValues.status === 'Active' ? 1 : 0,
      status: 1,
    };

    const res = await dmCategoryApi.createOrUpdate(apiItem);
    if (res.success) {
      await fetchCategories();
      setOpenEditor(false);
    } else {
      alert(`Lỗi API /DM_CATEGORY/Create: ${res.message}`);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    const target = rows.find((r) => r.id === deletingId);

    if (target?.numericId) {
      const res = await dmCategoryApi.delete(target.numericId);
      if (!res.success) {
        alert(`Lỗi xóa API: ${res.message}`);
        return;
      }
    }

    setRows((prev) => prev.filter((item) => item.id !== deletingId));
    setDeletingId(null);
  }

  return (
    <PageShell
      title="Danh mục dùng chung"
      subtitle="Quản lý danh mục: loại văn bản, độ khẩn/mật, lĩnh vực, trạng thái, hình thức gửi/nhận. Lọc và lưu mặc định PARENT_CODE = DANH_MUC."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng mục"
          value={rows.length}
          helper={`Filter PARENT_CODE: ${parentCodeFilter}`}
          icon="solar:widget-2-bold"
        />
        <MetricCard
          label="Nhóm danh mục"
          value={new Set(rows.map((r) => r.group)).size}
          helper="Group theo nghiệp vụ"
          icon="solar:category-bold"
        />
        <MetricCard
          label="Đang active"
          value={rows.filter((r) => r.status === 'Active').length}
          helper="Dùng cho dropdown/filter"
          icon="solar:checklist-bold"
        />
        <MetricCard
          label="Ngưng dùng"
          value={rows.filter((r) => r.status === 'Inactive').length}
          helper="Ẩn khỏi lựa chọn"
          icon="solar:eye-closed-bold"
        />
      </GridRow>

      <SectionCard
        title="Danh sách danh mục"
        subtitle="Màn hình danh mục kết nối API DM_CATEGORY."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={fetchCategories} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới (API)'}
            </Button>
            <Button variant="contained" onClick={handleOpenCreate}>
              Thêm danh mục
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
              placeholder="Nhóm, mã, tên, trạng thái"
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Mã nhóm (PARENT_CODE)"
              value={parentCodeFilter}
              onChange={(e) => setParentCodeFilter(e.target.value)}
              placeholder="Mặc định DANH_MUC"
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
                label="PARENT_CODE (Nhóm cha)"
                value={formValues.parentCode}
                onChange={(event) => setFormValues((prev) => ({ ...prev, parentCode: event.target.value }))}
              />
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
