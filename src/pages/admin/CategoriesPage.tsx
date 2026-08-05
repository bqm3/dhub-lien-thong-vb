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
  Grid,
  Chip,
  Typography
} from '@mui/material';
import Iconify from '../../components/iconify';
import { DataTable, GridRow, MetricCard, PageShell, SectionCard } from '../../sections/interoperability/components';
import { dmCategoryApi, DMCategoryItem } from '../../services/dmCategoryApi';
import { getDefaultDateRange } from '../../services/getDefaultDateRange';
import { formatTime } from '../../utils/formatTime';
import { isApiSuccess } from '../../utils/axios';
import useLoading from '../../hooks/useLoading';

type CategoryRecord = {
  id: string;
  numericId?: number;
  description: string;
  code: string;
  name: string;
  parentCode: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
};

const DEFAULT_PARENT_CODE = '';

const emptyForm: CategoryRecord = {
  id: '',
  description: '',
  code: '',
  name: '',
  parentCode: DEFAULT_PARENT_CODE,
  status: 'Active',
  updatedAt: '',
};

export default function CategoriesPage() {
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CategoryRecord>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Query danh sách danh mục để làm options cho Select Mã nhóm cha
  const { data: parentCategories = [] } = useQuery<{ code: string; label: string }[]>({
    queryKey: ['parentCategoryOptions'],
    queryFn: async () => {
      const res = await dmCategoryApi.getList({ pageIndex: 1, pageSize: 500 });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      if (!rawList) return [];
      const options: { code: string; label: string }[] = [];
      const seen = new Set<string>();
      rawList.forEach((item: any) => {
        const code = item.CODE || item.code;
        const name = item.NAME || item.name;
        if (code && !seen.has(code)) {
          seen.add(code);
          options.push({ code, label: name ? `${code} - ${name}` : code });
        }
      });
      return options;
    },
  });

  // TanStack Query: Fetch Categories with Server-side API Pagination and keepPreviousData to prevent flicker
  const { data, isFetching, refetch } = useQuery<{ rows: CategoryRecord[]; total: number }>({
    queryKey: ['categories', pageIndex, pageSize, cdateStart, cdateEnd, parentCodeFilter],
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
      const mapped: CategoryRecord[] = rawList.map((item: any) => ({
        id: item.ID || item.id ? `CAT-${item.ID || item.id}` : (item.CODE || item.code),
        numericId: item.ID || item.id,
        description: item.DESCRIPTION || item.description || '',
        code: item.CODE || item.code || '',
        name: item.NAME || item.name || '',
        parentCode: item.PARENT_CODE || item.parentCode || parentCodeFilter,
        status: (item.IS_ACTIVE !== undefined ? item.IS_ACTIVE : item.isActive) === 1 ? 'Active' : 'Inactive',
        updatedAt: formatTime(item.CDATE || item.cdate || item.createdDate || item.CREATED_DATE),
      }));
      return { rows: mapped, total };
    },
    placeholderData: keepPreviousData,
  });

  const rows = data?.rows || [];
  const totalCount = data?.total || 0;

  // TanStack Mutation: Save Category
  const saveMutation = useMutation({
    mutationFn: (apiItem: DMCategoryItem) => dmCategoryApi.createOrUpdate(apiItem),
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        refetch();
        setOpenEditor(false);
      }
    },
  });

  // TanStack Mutation: Delete Category
  const deleteMutation = useMutation({
    mutationFn: (numericId: number) => dmCategoryApi.delete(numericId),
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        refetch();
      }
      setDeletingId(null);
    },
  });

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item: CategoryRecord) =>
        item.id.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  const tableRows = filtered.map((item: CategoryRecord) => {
    const parentOpt = parentCategories.find((p) => p.code === item.parentCode);
    const parentDisplay = item.parentCode && item.parentCode !== '0'
      ? (parentOpt ? parentOpt.label : item.parentCode)
      : '—';

    return {
      code: <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.code}</Typography>,
      name: item.name,
      parentCode: item.parentCode && item.parentCode !== '0' ? (
        <Chip label={parentDisplay} size="small" variant="soft" color="info" />
      ) : (
        <Typography variant="body2" color="text.disabled">—</Typography>
      ),
      description: item.description || '—',
      status: item.status === 'Active' ? 'Hoạt động' : 'Ngưng dùng',
      updatedAt: formatTime(item.updatedAt),
      actions: (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Sửa">
            <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" color="error" onClick={() => setDeletingId(item.id)}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    };
  });

  function handleOpenCreate() {
    setEditingId(null);
    setFormValues({
      ...emptyForm,
      parentCode: parentCodeFilter || DEFAULT_PARENT_CODE,
      updatedAt: formatTime(new Date()),
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

    const apiItem: DMCategoryItem = {
      id: formValues.numericId,
      code: formValues.code,
      name: formValues.name,
      parentCode: formValues.parentCode || parentCodeFilter || DEFAULT_PARENT_CODE,
      description: formValues.description,
      isActive: formValues.status === 'Active' ? 1 : 0,
      status: 1,
    };

    saveMutation.mutate(apiItem);
  }

  function handleConfirmDelete() {
    if (!deletingId) return;
    const target = rows.find((r: CategoryRecord) => r.id === deletingId);

    if (target?.numericId) {
      deleteMutation.mutate(target.numericId);
    } else {
      setDeletingId(null);
    }
  }

  return (
    <PageShell
      title="Danh mục dùng chung"
      subtitle="Quản lý danh mục: loại văn bản, độ khẩn, độ mật, lĩnh vực, trạng thái và hình thức gửi/nhận."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng mục"
          value={totalCount}
          helper="Tất cả danh mục hệ thống"
          icon="solar:widget-2-bold"
        />
        <MetricCard
          label="Nhóm danh mục"
          value={new Set(rows.map((r: CategoryRecord) => r.parentCode)).size}
          helper="Phân nhóm theo nhóm cha"
          icon="solar:category-bold"
        />
        <MetricCard
          label="Đang dùng"
          value={rows.filter((r: CategoryRecord) => r.status === 'Active').length}
          helper="Sử dụng cho hệ thống"
          icon="solar:checklist-bold"
        />
        <MetricCard
          label="Ngưng dùng"
          value={rows.filter((r: CategoryRecord) => r.status === 'Inactive').length}
          helper="Ẩn khỏi lựa chọn"
          icon="solar:eye-closed-bold"
        />
      </GridRow>

      <SectionCard
        title="Danh sách danh mục"
        subtitle="Danh sách các danh mục dùng chung của hệ thống."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Đang tải...' : 'Làm mới'}
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
              placeholder="Nội dung, mã, tên, trạng thái"
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Mã nhóm cha"
              select
              InputLabelProps={{ shrink: true }}
              value={parentCodeFilter}
              onChange={(e) => {
                setParentCodeFilter(e.target.value);
                setPageIndex(1);
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Tất cả nhóm cha</MenuItem>
              {parentCategories.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
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
                { key: 'code', label: 'Mã' },
                { key: 'name', label: 'Tên danh mục' },
                { key: 'parentCode', label: 'Danh mục cha' },
                { key: 'description', label: 'Nội dung' },
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
        <DialogTitle>{editingId ? 'Cập nhật danh mục' : 'Tạo mới danh mục'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mã danh mục"
                required
                value={formValues.code}
                onChange={(event) => setFormValues((prev) => ({ ...prev, code: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tên danh mục"
                required
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mã nhóm cha"
                select
                InputLabelProps={{ shrink: true }}
                value={formValues.parentCode || ''}
                onChange={(event) => setFormValues((prev) => ({ ...prev, parentCode: event.target.value }))}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>-- Không chọn (Mặc định) --</em>
                </MenuItem>
                {parentCategories.map((opt) => (
                  <MenuItem key={opt.code} value={opt.code}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Nội dung"
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, description: event.target.value }))
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
                  setFormValues((prev) => ({ ...prev, status: event.target.value as CategoryRecord['status'] }))
                }
              >
                <MenuItem value="Active">Hoạt động</MenuItem>
                <MenuItem value="Inactive">Ngưng dùng</MenuItem>
              </TextField>
            </Grid>
            {editingId && (
              <Grid item xs={12}>
                <TextField fullWidth label="Thời điểm cập nhật" value={formValues.updatedAt} disabled />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditor(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saveMutation.isPending}>
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
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
