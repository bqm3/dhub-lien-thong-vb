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
import { DataTable, GridRow, MetricCard, PageShell, SectionCard, StatusChip } from '../../sections/interoperability/components';

type UnitRecord = {
  code: string;
  name: string;
  level: 'Bộ/Ngành' | 'Tỉnh/Thành phố' | 'Sở/Ban/Ngành' | 'Quận/Huyện' | 'Phòng/Ban';
  parent: string;
  identifier: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
};

const initialUnits: UnitRecord[] = [
  {
    code: 'UBND_HANOI',
    name: 'UBND Hà Nội',
    level: 'Tỉnh/Thành phố',
    parent: '-',
    identifier: 'VN-HN-UBND',
    status: 'Active',
    updatedAt: '25/06/2026 08:10',
  },
  {
    code: 'SO_TTTT',
    name: 'Sở Thông tin và Truyền thông',
    level: 'Sở/Ban/Ngành',
    parent: 'UBND_HANOI',
    identifier: 'VN-HN-STTTT',
    status: 'Active',
    updatedAt: '26/06/2026 09:30',
  },
  {
    code: 'SO_NOI_VU',
    name: 'Sở Nội Vụ',
    level: 'Sở/Ban/Ngành',
    parent: 'UBND_HANOI',
    identifier: 'VN-HN-SNV',
    status: 'Inactive',
    updatedAt: '01/07/2026 11:02',
  },
];

const emptyForm: UnitRecord = {
  code: '',
  name: '',
  level: 'Sở/Ban/Ngành',
  parent: '',
  identifier: '',
  status: 'Active',
  updatedAt: '',
};

export default function UnitsPage() {
  const [rows, setRows] = useState<UnitRecord[]>(initialUnits);
  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<UnitRecord>(emptyForm);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

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
      updatedAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenEditor(true);
  }

  function handleEdit(unit: UnitRecord) {
    setEditingCode(unit.code);
    setFormValues(unit);
    setOpenEditor(true);
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name || !formValues.identifier) return;
    const payload: UnitRecord = { ...formValues, updatedAt: new Date().toLocaleString('vi-VN') };

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
      title="Đơn vị"
      subtitle="Quản lý tổ chức/đơn vị: cơ quan gửi/nhận, mã định danh đơn vị, sơ đồ tổ chức. CRUD rõ ràng với popup modal."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng đơn vị"
          value={rows.length}
          helper="Dữ liệu demo (local state)"
          icon="solar:buildings-2-bold"
        />
        <MetricCard
          label="Đang hoạt động"
          value={rows.filter((u) => u.status === 'Active').length}
          helper="Kết nối liên thông theo đơn vị"
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
            subtitle="Danh sách được tách riêng theo giao diện; thêm/sửa/xóa bằng modal."
            action={
              <Button variant="contained" onClick={handleOpenCreate}>
                Thêm đơn vị
              </Button>
            }
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Tìm kiếm"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Mã, tên, cấp, đơn vị cha, mã định danh"
              />

              <Box sx={{ overflowX: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'code', label: 'Mã' },
                    { key: 'name', label: 'Tên đơn vị' },
                    { key: 'level', label: 'Cấp' },
                    { key: 'parent', label: 'Đơn vị cha' },
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
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, code: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Tên đơn vị"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
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
                label="Đơn vị cha"
                value={formValues.parent}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, parent: event.target.value }))
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
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, identifier: event.target.value }))
                }
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

