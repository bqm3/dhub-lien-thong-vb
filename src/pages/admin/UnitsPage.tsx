import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Grid
} from '@mui/material';
import Iconify from '../../components/iconify';
import { DataTable, GridRow, MetricCard, PageShell, SectionCard } from '../../sections/interoperability/components';
import { dmCategoryApi, DMCategoryItem } from '../../services/dmCategoryApi';
import { getDefaultDateRange } from '../../services/getDefaultDateRange';
import { formatTime } from '../../utils/formatTime';
import { isApiSuccess } from '../../utils/axios';
import useLoading from '../../hooks/useLoading';

type UnitRecord = {
  code: string;
  numericId?: number;
  name: string;
  level: 'Bộ/Ngành' | 'Tỉnh/Thành phố' | 'Sở/Ban/Ngành' | 'Quận/Huyện' | 'Phòng/Ban';
  parent: string;
  description: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
};

const DEFAULT_PARENT_CODE = 'DON_VI';

const emptyForm: UnitRecord = {
  code: '',
  name: '',
  level: 'Sở/Ban/Ngành',
  parent: DEFAULT_PARENT_CODE,
  description: '',
  status: 'Active',
  updatedAt: '',
};

export default function UnitsPage() {
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);
  const [parentCodeFilter, setParentCodeFilter] = useState(DEFAULT_PARENT_CODE);

  // Pagination states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [keyword, setKeyword] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<UnitRecord>(emptyForm);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  // TanStack Query: Fetch Units with Server-side API Pagination and keepPreviousData
  const { data, isFetching, refetch } = useQuery<{ rows: UnitRecord[]; total: number }>({
    queryKey: ['units', pageIndex, pageSize, cdateStart, cdateEnd, parentCodeFilter],
    queryFn: async () => {
      const res = await dmCategoryApi.getList({
        pageIndex,
        pageSize,
        cdateStart,
        cdateEnd,
        searchField: parentCodeFilter ? { PARENT_CODE: parentCodeFilter } : {},
      });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      const total = res?.TotalRecords ?? res?.totalRecords ?? res?.TotalCount ?? res?.totalCount ?? (rawList ? rawList.length : 0);
      if (!rawList) return { rows: [], total: 0 };
      const mapped: UnitRecord[] = rawList.map((item: any) => ({
        code: item.CODE || item.code || '',
        numericId: item.ID || item.id,
        name: item.NAME || item.name || '',
        level: 'Sở/Ban/Ngành',
        parent: item.PARENT_CODE || item.parentCode || parentCodeFilter,
        description: item.DESCRIPTION || item.description || '',
        status: (item.IS_ACTIVE !== undefined ? item.IS_ACTIVE : item.isActive) === 1 ? 'Active' : 'Inactive',
        updatedAt: formatTime(item.CDATE || item.cdate || item.createdDate || item.CREATED_DATE),
      }));
      return { rows: mapped, total };
    },
    placeholderData: keepPreviousData,
  });

  const rows = data?.rows || [];
  const totalCount = data?.total || 0;

  // TanStack Mutation: Save Unit
  const saveMutation = useMutation({
    mutationFn: (apiItem: DMCategoryItem) => dmCategoryApi.createOrUpdate(apiItem),
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['units'] });
        refetch();
        setOpenEditor(false);
      }
    },
  });

  // TanStack Mutation: Delete Unit
  const deleteMutation = useMutation({
    mutationFn: (numericId: number) => dmCategoryApi.delete(numericId),
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['units'] });
        refetch();
      }
      setDeletingCode(null);
    },
  });

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (unit: UnitRecord) =>
        unit.description.toLowerCase().includes(q) ||
        unit.code.toLowerCase().includes(q) ||
        unit.name.toLowerCase().includes(q) ||
        unit.level.toLowerCase().includes(q) ||
        unit.parent.toLowerCase().includes(q) ||
        unit.status.toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  const tableRows = filtered.map((unit: UnitRecord) => ({
    description: unit.description,
    code: unit.code,
    name: unit.name,
    level: unit.level,
    parent: unit.parent,
    status: unit.status === 'Active' ? 'Hoạt động' : 'Ngưng dùng',
    updatedAt: formatTime(unit.updatedAt),
    actions: (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <Tooltip title="Sửa">
          <IconButton size="small" color="primary" onClick={() => handleEdit(unit)}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa">
          <IconButton size="small" color="error" onClick={() => setDeletingCode(unit.code)}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyForm,
      code: `${DEFAULT_PARENT_CODE}_${String(Date.now()).slice(-6)}`,
      parent: parentCodeFilter || DEFAULT_PARENT_CODE,
      updatedAt: formatTime(new Date()),
    });
    setOpenEditor(true);
  }

  function handleEdit(unit: UnitRecord) {
    setEditingCode(unit.code);
    setFormValues(unit);
    setOpenEditor(true);
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name) return;

    const apiItem: DMCategoryItem = {
      id: formValues.numericId,
      code: formValues.code,
      name: formValues.name,
      parentCode: formValues.parent || parentCodeFilter || DEFAULT_PARENT_CODE,
      description: formValues.description,
      isActive: formValues.status === 'Active' ? 1 : 0,
      status: 1,
    };

    saveMutation.mutate(apiItem);
  }

  function handleConfirmDelete() {
    if (!deletingCode) return;
    const target = rows.find((r: UnitRecord) => r.code === deletingCode);

    if (target?.numericId) {
      deleteMutation.mutate(target.numericId);
    } else {
      setDeletingCode(null);
    }
  }

  return (
    <PageShell
      title="Đơn vị"
      subtitle="Quản lý danh sách các đơn vị, cơ quan, tổ chức liên thông văn bản."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng đơn vị"
          value={totalCount}
          helper="Tất cả đơn vị hệ thống"
          icon="solar:buildings-2-bold"
        />
        <MetricCard
          label="Đang hoạt động"
          value={rows.filter((u: UnitRecord) => u.status === 'Active').length}
          helper="Đang sử dụng"
          icon="solar:shield-check-bold"
        />
        <MetricCard
          label="Ngưng hoạt động"
          value={rows.filter((u: UnitRecord) => u.status === 'Inactive').length}
          helper="Ngưng sử dụng"
          icon="solar:shield-warning-bold"
        />
        <MetricCard
          label="Cấp tổ chức"
          value={new Set(rows.map((u: UnitRecord) => u.level)).size}
          helper="Phân cấp đơn vị"
          icon="solar:hierarchy-2-bold"
        />
      </GridRow>

      <SectionCard
        title="Danh sách đơn vị"
        subtitle="Danh sách các đơn vị kết nối trong hệ thống."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Đang tải...' : 'Làm mới'}
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
              placeholder="Nội dung, mã, tên, cấp, đơn vị cha"
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Mã nhóm cha"
              value={parentCodeFilter}
              onChange={(e) => {
                setParentCodeFilter(e.target.value);
                setPageIndex(1);
              }}
              placeholder="Nhập mã nhóm cha"
              sx={{ minWidth: 200 }}
            />
            <TextField
              size="small"
              type="date"
              label="Từ ngày"
              InputLabelProps={{ shrink: true }}
              value={cdateStart}
              onChange={(e) => {
                setCdateStart(e.target.value);
                setPageIndex(1);
              }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              type="date"
              label="Đến ngày"
              InputLabelProps={{ shrink: true }}
              value={cdateEnd}
              onChange={(e) => {
                setCdateEnd(e.target.value);
                setPageIndex(1);
              }}
              sx={{ minWidth: 160 }}
            />
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <DataTable
              columns={[
                { key: 'description', label: 'Nội dung' },
                { key: 'code', label: 'Mã' },
                { key: 'name', label: 'Tên đơn vị' },
                { key: 'level', label: 'Cấp' },
                { key: 'parent', label: 'Mã nhóm cha' },
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

      <Dialog open={openEditor} onClose={() => setOpenEditor(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingCode ? 'Cập nhật đơn vị' : 'Tạo mới đơn vị'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                label="Nội dung"
                value={formValues.description}
                onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Nhập nội dung mô tả đơn vị"
              />
            </Grid>
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
                label="Mã nhóm cha"
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
                <MenuItem value="Active">Hoạt động</MenuItem>
                <MenuItem value="Inactive">Ngưng dùng</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Thời điểm cập nhật" value={formValues.updatedAt} disabled />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditor(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saveMutation.isPending}>
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
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
