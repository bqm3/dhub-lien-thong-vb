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

type UnitRecord = {
  code: string;
  numericId?: number;
  name: string;
  level: 'Bộ/Ngành' | 'Tỉnh/Thành phố' | 'Sở/Ban/Ngành' | 'Quận/Huyện' | 'Phòng/Ban';
  parent: string;
  identifier: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
};

const DEFAULT_PARENT_CODE = 'DON_VI';

const emptyForm: UnitRecord = {
  code: '',
  name: '',
  level: 'Sở/Ban/Ngành',
  parent: DEFAULT_PARENT_CODE,
  identifier: '',
  status: 'Active',
  updatedAt: '',
};

export default function UnitsPage() {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);
  const [parentCodeFilter, setParentCodeFilter] = useState(DEFAULT_PARENT_CODE);

  const [rows, setRows] = useState<UnitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<UnitRecord>(emptyForm);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  useEffect(() => {
    fetchUnits();
  }, [cdateStart, cdateEnd, parentCodeFilter]);

  async function fetchUnits() {
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
        const mapped: UnitRecord[] = res.data.map((item) => ({
          code: item.code,
          numericId: item.id,
          name: item.name,
          level: 'Sở/Ban/Ngành',
          parent: item.parentCode || parentCodeFilter,
          identifier: `VN-ORG-${item.code}`,
          status: item.isActive === 1 ? 'Active' : 'Inactive',
          updatedAt: item.cdate || new Date().toLocaleDateString('vi-VN'),
        }));
        setRows(mapped);
      }
    } catch (err) {
      console.warn('API error fetching units', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (unit) =>
        unit.code.toLowerCase().includes(q) ||
        unit.name.toLowerCase().includes(q) ||
        unit.level.toLowerCase().includes(q) ||
        unit.parent.toLowerCase().includes(q) ||
        unit.identifier.toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  const tableRows = filtered.map((unit) => ({
    code: unit.code,
    name: unit.name,
    level: unit.level,
    parent: unit.parent,
    identifier: unit.identifier,
    status: <StatusChip status={unit.status} />,
    updatedAt: unit.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(unit)}>
          Sửa
        </Button>
        <Button size="small" color="error" onClick={() => setDeletingCode(unit.code)}>
          Xóa
        </Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyForm,
      code: `UNIT_${String(Date.now()).slice(-6)}`,
      parent: parentCodeFilter || DEFAULT_PARENT_CODE,
      updatedAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenEditor(true);
  }

  function handleEdit(unit: UnitRecord) {
    setEditingCode(unit.code);
    setFormValues(unit);
    setOpenEditor(true);
  }

  async function handleSubmit() {
    if (!formValues.code || !formValues.name || !formValues.identifier) return;

    const apiItem: DMCategoryItem = {
      id: formValues.numericId,
      code: formValues.code,
      name: formValues.name,
      parentCode: formValues.parent || parentCodeFilter || DEFAULT_PARENT_CODE,
      description: formValues.level,
      isActive: formValues.status === 'Active' ? 1 : 0,
      status: 1,
    };

    const res = await dmCategoryApi.createOrUpdate(apiItem);
    if (res.success) {
      await fetchUnits();
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
      title="Đơn vị"
      subtitle="Quản lý tổ chức/đơn vị: cơ quan gửi/nhận, mã định danh đơn vị, sơ đồ tổ chức. Lọc và lưu mặc định PARENT_CODE = DON_VI."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng đơn vị"
          value={rows.length}
          helper={`Filter PARENT_CODE: ${parentCodeFilter}`}
          icon="solar:buildings-2-bold"
        />
        <MetricCard
          label="Đang hoạt động"
          value={rows.filter((u) => u.status === 'Active').length}
          helper="Quản lý đơn vị kết nối theo đơn vị"
          icon="solar:shield-check-bold"
        />
        <MetricCard
          label="Ngưng hoạt động"
          value={rows.filter((u) => u.status === 'Inactive').length}
          helper="Khóa trao đổi/đồng bộ"
          icon="solar:shield-warning-bold"
        />
        <MetricCard
          label="Cấp tổ chức"
          value={new Set(rows.map((u) => u.level)).size}
          helper="Bộ/Tỉnh/Sở/..."
          icon="solar:hierarchy-2-bold"
        />
      </GridRow>

      <SectionCard
        title="Danh sách đơn vị"
        subtitle="Danh sách được kết nối API; thêm/sửa/xóa bằng modal."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={fetchUnits} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới (API)'}
            </Button>
            <Button variant="contained" onClick={handleOpenCreate}>
              Thêm đơn vị
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
              placeholder="Mã, tên, cấp, đơn vị cha, mã định danh"
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Mã nhóm (PARENT_CODE)"
              value={parentCodeFilter}
              onChange={(e) => setParentCodeFilter(e.target.value)}
              placeholder="Mặc định DON_VI"
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
                { key: 'name', label: 'Tên đơn vị' },
                { key: 'level', label: 'Cấp' },
                { key: 'parent', label: 'Mã nhóm (PARENT_CODE)' },
                { key: 'identifier', label: 'Mã định danh' },
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
        <DialogTitle>{editingCode ? 'Cập nhật đơn vị' : 'Tạo mới đơn vị'}</DialogTitle>
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
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Tên đơn vị"
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cấp"
                select
                value={formValues.level}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, level: event.target.value as UnitRecord['level'] }))
                }
              >
                <MenuItem value="Bộ/Ngành">Bộ/Ngành</MenuItem>
                <MenuItem value="Tỉnh/Thành phố">Tỉnh/Thành phố</MenuItem>
                <MenuItem value="Sở/Ban/Ngành">Sở/Ban/Ngành</MenuItem>
                <MenuItem value="Quận/Huyện">Quận/Huyện</MenuItem>
                <MenuItem value="Phòng/Ban">Phòng/Ban</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="PARENT_CODE (Đơn vị cha)"
                value={formValues.parent}
                onChange={(event) => setFormValues((prev) => ({ ...prev, parent: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value as UnitRecord['status'] }))
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Mã định danh đơn vị"
                value={formValues.identifier}
                onChange={(event) => setFormValues((prev) => ({ ...prev, identifier: event.target.value }))}
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

      <Dialog open={Boolean(deletingCode)} onClose={() => setDeletingCode(null)} fullWidth maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa đơn vị <strong>{deletingCode}</strong> không?
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
