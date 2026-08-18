import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Iconify from '../../../components/iconify';
import { DataTable, GridRow, MetricCard, SectionCard } from '../../../sections/interoperability/components';
import { dmCategoryApi, DMCategoryItem } from '../../../services/dmCategoryApi';
import { sysShareCorpTokenApi, sysShareServicesApi, SysShareCorpTokenItem, SysShareServiceItem } from '../../../services/sysShareApi';
import { getDefaultDateRange } from '../../../services/getDefaultDateRange';
import { formatTime } from '../../../utils/formatTime';
import { isApiSuccess } from '../../../utils/axios';
import useLoading from '../../../hooks/useLoading';
import UnitApiModal from './UnitApiModal';
import { exportUnitIntegrationDocx } from '../../../utils/exportUnitDocx';

const DEFAULT_PARENT_CODE = 'DON_VI';

const emptyForm: DMCategoryItem = {
  code: '',
  name: '',
  parentCode: DEFAULT_PARENT_CODE,
  description: '',
  isActive: 1,
  status: 1,
};

interface UnitListTabProps {
  onOpenCertForUnit?: (unitCode: string, unitName: string) => void;
}

export default function UnitListTab({ onOpenCertForUnit }: UnitListTabProps) {
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.startDateStr);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.endDateStr);
  const [parentCodeFilter, setParentCodeFilter] = useState(DEFAULT_PARENT_CODE);

  // Pagination states - Units
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  // Modals state
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<DMCategoryItem>(emptyForm);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  // API Modal State
  const [apiModalUnit, setApiModalUnit] = useState<DMCategoryItem | null>(null);



  // TanStack Query: Fetch Units
  const { data, isFetching, refetch } = useQuery<{ rows: DMCategoryItem[]; total: number }>({
    queryKey: ['units', pageIndex, pageSize, cdateStart, cdateEnd, parentCodeFilter],
    queryFn: async () => {
      const res = await dmCategoryApi.getUnitList({
        pageIndex,
        pageSize,
        cdateStart: cdateStart ? (cdateStart.includes(':') ? cdateStart : `${cdateStart} 00:00:00`) : '',
        cdateEnd: cdateEnd ? (cdateEnd.includes(':') ? cdateEnd : `${cdateEnd} 23:59:59`) : '',
      });
      const rows: DMCategoryItem[] = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      const total: number = res?.TotalRecords ?? res?.totalRecords ?? rows.length;
      return { rows, total };
    },
    placeholderData: keepPreviousData,
  });

  const rows = data?.rows || [];
  const totalCount = data?.total || 0;

  // Save Unit Mutation
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

  // Delete Unit Mutation
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
      (unit: DMCategoryItem) =>
        (unit.description || '').toLowerCase().includes(q) ||
        (unit.code || '').toLowerCase().includes(q) ||
        (unit.name || '').toLowerCase().includes(q) ||
        (unit.parentCode || (unit as any).parent || '').toLowerCase().includes(q)
    );
  }, [keyword, rows]);

  const handleOpenApiModal = (unit: DMCategoryItem) => {
    setApiModalUnit(unit);
  };

  const tableRows = filtered.map((unit: DMCategoryItem) => {
    const parentCode = unit.parentCode || (unit as any).parent;
    const parentDisplay = parentCode && parentCode !== '0' ? parentCode : '—';
    const isAct = unit.isActive === 1 || unit.status === 1 || (unit as any).status === 'Active';

    return {
      code: <Typography variant="body2" sx={{ fontWeight: 700 }}>{unit.code}</Typography>,
      name: unit.name,
      parent: parentCode && parentCode !== '0' ? (
        <Chip label={parentDisplay} size="small" variant="soft" color="info" />
      ) : (
        <Typography variant="body2" color="text.disabled">—</Typography>
      ),
      description: unit.description || '—',
      status: isAct ? 'Hoạt động' : 'Ngưng dùng',
      updatedAt: formatTime(unit.cdate || (unit as any).updatedAt || new Date()),
      actions: (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Cấp bộ thông tin kết nối API & Tải DOCX hướng dẫn">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleOpenApiModal(unit)}
            >
              <Iconify icon="solar:key-minimalistic-bold" />
            </IconButton>
          </Tooltip>
          {onOpenCertForUnit && (
            <Tooltip title="Quản lý Chữ ký số / PKI">
              <IconButton
                size="small"
                color="info"
                onClick={() => onOpenCertForUnit(unit.code, unit.name)}
              >
                <Iconify icon="solar:shield-keyhole-bold" />
              </IconButton>
            </Tooltip>
          )}
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
    };
  });

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyForm,
      code: `${DEFAULT_PARENT_CODE}_${String(Date.now()).slice(-6)}`,
      parentCode: parentCodeFilter || DEFAULT_PARENT_CODE,
    });
    setOpenEditor(true);
  }

  function handleEdit(unit: DMCategoryItem) {
    setEditingCode(unit.code);
    setFormValues(unit);
    setOpenEditor(true);
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name) return;

    const apiItem: DMCategoryItem = {
      id: formValues.id || (formValues as any).numericId,
      code: formValues.code,
      name: formValues.name,
      parentCode: formValues.parentCode || (formValues as any).parent || parentCodeFilter || DEFAULT_PARENT_CODE,
      description: formValues.description || '',
      isActive: (formValues.isActive !== undefined ? formValues.isActive : (formValues as any).status === 'Active') ? 1 : 0,
      status: 1,
    };

    saveMutation.mutate(apiItem);
  }

  function handleConfirmDelete() {
    if (!deletingCode) return;
    const target = rows.find((r: DMCategoryItem) => r.code === deletingCode);

    if (target?.id || (target as any)?.numericId) {
      deleteMutation.mutate((target?.id || (target as any)?.numericId)!);
    } else {
      setDeletingCode(null);
    }
  }

  return (
    <Stack spacing={3}>
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng đơn vị"
          value={totalCount}
          helper="Tất cả đơn vị hệ thống"
          icon="solar:buildings-2-bold"
          backgroundColor="#01AD65"
        />
        <MetricCard
          label="Đang hoạt động"
          value={rows.filter((u: DMCategoryItem) => u.isActive === 1 || u.status === 1 || (u as any).status === 'Active').length}
          helper="Đang kết nối liên thông"
          icon="solar:shield-check-bold"
          backgroundColor="#028EDD"
        />
        <MetricCard
          label="Ngưng hoạt động"
          value={rows.filter((u: DMCategoryItem) => (u.isActive !== undefined ? u.isActive === 0 : (u as any).status === 'Inactive')).length}
          helper="Ngưng kết nối"
          icon="solar:shield-warning-bold"
          backgroundColor="#9E50FE"
        />
        <MetricCard
          label="Nhóm đơn vị"
          value={new Set(rows.map((u: DMCategoryItem) => u.parentCode || (u as any).parent)).size}
          helper="Phân nhóm theo đơn vị cha"
          icon="solar:category-bold"
          backgroundColor="#FF8551"
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
              placeholder="Nội dung, mã, tên, đơn vị cha"
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
              <MenuItem value="DON_VI">DON_VI - Danh mục Đơn vị</MenuItem>
              {rows.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.code} - {opt.name}
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
                { key: 'name', label: 'Tên đơn vị' },
                { key: 'parent', label: 'Mã nhóm cha' },
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

      {/* Editor Modal - Unit */}
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
            <Grid item xs={12} md={4}>
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
                label="Mã nhóm cha"
                select
                InputLabelProps={{ shrink: true }}
                value={formValues.parentCode || ''}
                onChange={(event) => setFormValues((prev) => ({ ...prev, parentCode: event.target.value }))}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="DON_VI">DON_VI - Danh mục Đơn vị</MenuItem>
                {rows.map((opt) => (
                  <MenuItem key={opt.code} value={opt.code}>
                    {opt.code} - {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Nội dung / Mô tả"
                value={formValues.description}
                onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.isActive !== undefined ? formValues.isActive : 1}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, isActive: Number(event.target.value) }))
                }
              >
                <MenuItem value={1}>Hoạt động</MenuItem>
                <MenuItem value={0}>Ngưng hoạt động</MenuItem>
              </TextField>
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

      {/* Delete Unit Confirmation */}
      <Dialog open={Boolean(deletingCode)} onClose={() => setDeletingCode(null)}>
        <DialogTitle>Xác nhận xóa đơn vị</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Bạn có chắc chắn muốn xóa đơn vị <strong>{deletingCode}</strong> khỏi hệ thống?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCode(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* API Connection & DOCX Export Dialog */}
      <UnitApiModal
        unit={apiModalUnit}
        onClose={() => setApiModalUnit(null)}
        cdateStart={cdateStart}
        cdateEnd={cdateEnd}
      />
    </Stack>
  );
}

