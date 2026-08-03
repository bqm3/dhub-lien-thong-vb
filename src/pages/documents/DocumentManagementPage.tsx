import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Autocomplete,
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  DocumentRecord,
  documentLifecycle,
  documents,
} from '../../sections/interoperability/mockData';
import {
  DataTable,
  GridRow,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';
import Iconify from '../../components/iconify';
import SignatureStudio from '../../sections/workflow/components/SignatureStudio';
import { documentsApi } from '../../services/documentsApi';
import { dmCategoryApi, getDefaultDateRange } from '../../services/dmCategoryApi';
import { dipHubApi } from '../../services/dipHubApi';
import { getApiMessage, isApiSuccess } from '../../utils/axios';

type ManagedDocumentRecord = DocumentRecord & {
  attachments: string[];
  signProvider: string;
  signStatus: string;
  signedPositions: number;
};

interface UnitOption {
  code: string;
  name: string;
}

const defaultUnits: UnitOption[] = [
  { code: 'BXD', name: 'Bộ Xây dựng' },
  { code: 'BCT', name: 'Bộ Công Thương' },
  { code: 'BTC', name: 'Bộ Tài chính' },
  { code: 'BNV', name: 'Bộ Nội vụ' },
  { code: 'UBND_HN', name: 'UBND Thành phố Hà Nội' },
  { code: 'UBND_HCM', name: 'UBND Thành phố Hồ Chí Minh' },
];

function DocumentActionsMenu({
  onDetail,
  onEdit,
  onDelete,
}: {
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" width={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            onDetail();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:eye-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Chi tiết" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Sửa" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete();
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Iconify icon="solar:trash-bin-trash-bold" width={18} sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary="Xóa" />
        </MenuItem>
      </Menu>
    </>
  );
}

const emptyDocumentForm: ManagedDocumentRecord = {
  code: '',
  title: '',
  type: 'CONG_VAN',
  sender: 'BXD',
  receiver: 'UBND_HN',
  version: 'v1',
  classification: 'Thường',
  status: 'Đang xử lý',
  createdAt: '',
  attachments: [],
  signProvider: 'USB Token / HSM',
  signStatus: 'Chưa ký',
  signedPositions: 0,
};

const DOC_TYPES = ['', 'CONG_VAN', 'QUYET_DINH', 'BAO_CAO', 'THONG_BAO', 'KE_HOACH', 'BIEN_NHAN'];

function pad2(value: number) {
  return value < 10 ? `0${value}` : String(value);
}

function formatDocumentDate(input: Date | number | string) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);

  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())} ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function parseDocumentDate(value: string) {
  const trimmed = value.trim();
  const isoTime = Date.parse(trimmed);
  if (!Number.isNaN(isoTime)) return isoTime;

  const match = trimmed.match(
    /^(?:(\d{1,2}):(\d{2})(?::(\d{2}))?[,\s]+)?(\d{1,2})\/(\d{1,2})\/(\d{4})$|^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (!match) return 0;

  if (match[1] || match[4]) {
    const [, hh = '0', min = '0', ss = '0', dd = '1', mm = '1', yyyy = '1970'] = match;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss)).getTime();
  }

  const [, , , , , , dd = '1', mm = '1', yyyy = '1970', hh = '0', min = '0', ss = '0'] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss)).getTime();
}

function fakeVersions(doc: ManagedDocumentRecord) {
  const n = parseInt(doc.version.replace('v', ''), 10);
  return Array.from({ length: n || 1 }, (_, i) => ({
    version: `v${i + 1}`,
    changedBy: i === 0 ? doc.sender : 'Hệ thống',
    changedAt: doc.createdAt,
    note: i === 0 ? 'Tạo mới' : `Cập nhật lần ${i}`,
  }));
}

function fakeAudit(doc: ManagedDocumentRecord) {
  return [
    { action: 'Tạo mới', actor: doc.sender, time: doc.createdAt, detail: `Khởi tạo văn bản ${doc.code}` },
    { action: 'Tải tệp', actor: doc.sender, time: doc.createdAt, detail: `${doc.attachments.length} tệp đính kèm đã được thêm vào hồ sơ` },
    {
      action: 'Ký số',
      actor: doc.sender,
      time: doc.createdAt,
      detail: `${doc.signStatus} qua ${doc.signProvider}`,
    },
    { action: 'Phát hành', actor: doc.sender, time: doc.createdAt, detail: `Chuyển trạng thái sang ${doc.status}` },
    { action: 'Gửi liên thông', actor: 'Hệ thống', time: doc.createdAt, detail: `Điểm đến ${doc.receiver}` },
  ];
}

export default function DocumentManagementPage() {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);

  const [unitOptions, setUnitOptions] = useState<UnitOption[]>(defaultUnits);
  const [selectedReceivers, setSelectedReceivers] = useState<UnitOption[]>([defaultUnits[4]]);

  const [documentList, setDocumentList] = useState<ManagedDocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ManagedDocumentRecord>(emptyDocumentForm);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [detailDoc, setDetailDoc] = useState<ManagedDocumentRecord | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [lifecycleExpanded, setLifecycleExpanded] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch Units catalog (PARENT_CODE = DON_VI)
  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await dmCategoryApi.getList({ searchField: { PARENT_CODE: 'DON_VI' } });
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((u) => ({ code: u.code, name: u.name }));
          setUnitOptions(mapped);
          if (mapped.length > 1) {
            setSelectedReceivers([mapped[1]]);
            setFormValues((p) => ({ ...p, sender: mapped[0].code, receiver: mapped[1].code }));
          }
        }
      } catch (e) {
        console.warn('Unable to load units from API, using defaults', e);
      }
    }
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchApiDocuments();
  }, [cdateStart, cdateEnd]);

  async function fetchApiDocuments() {
    setLoading(true);
    try {
      const res = await documentsApi.getList({
        pageIndex: 1,
        pageSize: 200,
        cdateStart,
        cdateEnd,
      });
      if (res.data) {
        const mapped: ManagedDocumentRecord[] = res.data.map((doc) => ({
          code: doc.documentNo || doc.code || `VB-${doc.id}`,
          title: doc.subject || 'Văn bản điện tử',
          type: doc.documentType || 'CONG_VAN',
          sender: doc.senderName || doc.senderCode || 'Cơ quan gửi',
          receiver: 'Đơn vị liên thông',
          version: 'v1',
          classification: 'Thường',
          status: doc.status || 'Đang xử lý',
          createdAt: doc.cdate || new Date().toLocaleDateString('vi-VN'),
          attachments: [`${(doc.documentNo || 'vb').replace(/\//g, '_')}.pdf`],
          signProvider: 'USB Token / HSM',
          signStatus: doc.status === 'Đã phát hành' ? 'Đã ký số' : 'Chưa ký',
          signedPositions: doc.status === 'Đã phát hành' ? 1 : 0,
        }));
        setDocumentList(mapped);
      }
    } catch (err) {
      console.warn('API DOCUMENTS/GetList error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!detailDoc) return;
    const latest = documentList.find((doc) => doc.code === detailDoc.code);
    if (!latest) {
      setDetailDoc(null);
      return;
    }
    if (latest !== detailDoc) {
      setDetailDoc(latest);
    }
  }, [detailDoc, documentList]);

  const filteredDocuments = useMemo(
    () =>
      [...documentList]
        .filter(
          (d) =>
            (typeFilter === '' || d.type === typeFilter) &&
            (d.code.toLowerCase().includes(keyword.toLowerCase()) ||
              d.title.toLowerCase().includes(keyword.toLowerCase()) ||
              d.sender.toLowerCase().includes(keyword.toLowerCase()) ||
              d.receiver.toLowerCase().includes(keyword.toLowerCase()))
        )
        .sort((a, b) => parseDocumentDate(b.createdAt) - parseDocumentDate(a.createdAt)),
    [documentList, keyword, typeFilter]
  );

  const documentRows = filteredDocuments.map((d) => ({
    code: d.code,
    title: (
      <Typography variant="body2" sx={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {d.title}
      </Typography>
    ),
    type: <Chip label={d.type} size="small" variant="outlined" />,
    sender: d.sender,
    receiver: d.receiver,
    version: d.version,
    attachments: <Chip label={`${d.attachments.length} tệp`} size="small" color="default" variant="outlined" />,
    signStatus: <StatusChip status={d.signStatus} />,
    classification: <StatusChip status={d.classification} />,
    status: <StatusChip status={d.status} />,
    createdAt: d.createdAt,
    actions: (
      <DocumentActionsMenu
        onDetail={() => handleOpenDetail(d.code)}
        onEdit={() => handleEdit(d)}
        onDelete={() => handleDelete(d.code)}
      />
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setAttachmentFiles([]);
    const defaultSender = unitOptions.length > 0 ? unitOptions[0].code : 'BXD';
    const defaultRecs = unitOptions.length > 1 ? [unitOptions[1]] : [defaultUnits[0]];
    setSelectedReceivers(defaultRecs);
    setFormValues({
      ...emptyDocumentForm,
      code: `VB-2026-${String(Date.now()).slice(-6)}`,
      sender: defaultSender,
      receiver: defaultRecs.map((r) => r.code).join(', '),
      createdAt: formatDocumentDate(new Date()),
    });
    setOpenForm(true);
  }

  function handleEdit(d: ManagedDocumentRecord) {
    setEditingCode(d.code);
    setFormValues(d);
    setAttachmentFiles([]);
    setOpenForm(true);
  }

  function handleDelete(code: string) {
    setDocumentList((prev) => prev.filter((d) => d.code !== code));
  }

  function handleOpenDetail(code: string) {
    const doc = documentList.find((item) => item.code === code);
    if (!doc) return;
    setDetailDoc(doc);
    setDetailTab(0);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(event.target.files ?? []);
    if (newFiles.length === 0) return;

    setAttachmentFiles((prev) => [...prev, ...newFiles]);
    setFormValues((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles.map((f) => f.name)],
    }));
  }

  async function handleSubmit() {
    if (!formValues.code || !formValues.title || !formValues.sender || selectedReceivers.length === 0) {
      enqueueSnackbar('Vui lòng điền đầy đủ Số ký hiệu, Trích yếu, chọn Nơi gửi và ít nhất 1 Nơi nhận!', { variant: 'warning' });
      return;
    }

    try {
      const senderUnit = unitOptions.find((u) => u.code === formValues.sender);
      const senderName = senderUnit ? senderUnit.name : formValues.sender;
      const receiverCodes = selectedReceivers.map((r) => r.code);

      // 1. Gọi API DOCUMENTS/Create
      const createRes = await documentsApi.createOrUpdate({
        code: formValues.code,
        documentNo: formValues.code,
        documentType: formValues.type,
        subject: formValues.title,
        senderCode: formValues.sender,
        senderName: senderName,
        status: formValues.status || 'Active',
      });

      if (!createRes.success) {
        enqueueSnackbar(`Lỗi API /DOCUMENTS/Create: ${createRes.message}`, { variant: 'error' });
        return;
      }

      // 2. Gọi API DIP_Hub/Send
      const sendRes = await dipHubApi.sendDocument({
        header: {
          document_No: formValues.code,
          document_Type: formValues.type,
          subject: formValues.title,
          sender_Code: formValues.sender,
          receiver_Code: receiverCodes,
          priority: formValues.classification === 'Mật' || formValues.classification === 'Tối mật' ? 'HIGH' : 'NORMAL',
          issue_Date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        },
        body: attachmentFiles.map((f) => ({
          file_Name: f.name,
          data_Type: f.type || 'application/pdf',
          content_Type: 'base64',
        })),
      });

      if (isApiSuccess(sendRes)) {
        enqueueSnackbar('Tạo mới văn bản và gửi qua Trục liên thông thành công!', { variant: 'success' });
        await fetchApiDocuments();
        setOpenForm(false);
        setAttachmentFiles([]);
      } else {
        enqueueSnackbar(`Lỗi API /DIP_Hub/Send [ResultCode: ${sendRes.resultCode || sendRes.ResultCode}]: ${getApiMessage(sendRes)}`, { variant: 'error' });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Lỗi không xác định';
      enqueueSnackbar(`Tạo văn bản thất bại: ${message}`, { variant: 'error' });
    }
  }

  return (
    <PageShell
      title="Document Management"
      subtitle="Quản lý toàn bộ vòng đời văn bản điện tử: tạo mới, metadata, file đính kèm, ký số, gửi nhận và kết nối API /DOCUMENTS/Create."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng văn bản"
          value={documentList.length}
          helper={`${documentList.filter((d) => d.status === 'Đã phát hành').length} đã phát hành`}
          icon="solar:documents-bold"
        />
        <MetricCard
          label="Có đính kèm"
          value={documentList.filter((d) => d.attachments.length > 0).length}
          helper="Có tối thiểu 1 tệp"
          icon="solar:paperclip-2-bold"
        />
        <MetricCard
          label="Đã ký số"
          value={documentList.filter((d) => d.signStatus === 'Đã ký số').length}
          helper="Hoàn tất bước ký"
          icon="solar:shield-check-bold"
        />
        <MetricCard
          label="Đang xử lý"
          value={documentList.filter((d) => d.status === 'Đang xử lý').length}
          helper="Chờ xử lý hoặc phát hành"
          icon="solar:refresh-circle-bold"
        />
      </GridRow>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={lifecycleExpanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} />}
          onClick={() => setLifecycleExpanded((prev) => !prev)}
        >
          {lifecycleExpanded ? 'Thu gọn' : 'Mở rộng'}
        </Button>
      </Stack>

      <SectionCard
        title="Danh sách văn bản"
        subtitle="Kết nối trực tiếp API DOCUMENTS/Create & GetList; hỗ trợ chọn nơi gửi và nhiều nơi nhận."
        action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleOpenCreate}>
            Thêm văn bản
          </Button>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Tìm kiếm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Số ký hiệu, trích yếu, nơi gửi, nơi nhận..."
              sx={{ flex: 1 }}
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
            <TextField
              size="small"
              label="Lọc loại văn bản"
              select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {DOC_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t === '' ? 'Tất cả' : t}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <DataTable
            columns={[
              { key: 'code', label: 'Số ký hiệu' },
              { key: 'title', label: 'Trích yếu' },
              { key: 'type', label: 'Loại', align: 'center' },
              { key: 'sender', label: 'Nơi gửi' },
              { key: 'receiver', label: 'Nơi nhận' },
              { key: 'version', label: 'Phiên bản', align: 'center' },
              { key: 'attachments', label: 'Tệp', align: 'center' },
              { key: 'signStatus', label: 'Ký số', align: 'center' },
              { key: 'classification', label: 'Phân loại', align: 'center' },
              { key: 'status', label: 'Trạng thái', align: 'center' },
              { key: 'createdAt', label: 'Ngày tạo' },
              { key: 'actions', label: 'Thao tác', align: 'right' },
            ]}
            rows={documentRows}
          />
        </Stack>
      </SectionCard>

      {/* Dialog tạo mới văn bản */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingCode ? 'Cập nhật văn bản' : 'Tạo mới văn bản'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số ký hiệu"
                disabled={Boolean(editingCode)}
                value={formValues.code}
                onChange={(e) => setFormValues((p) => ({ ...p, code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loại văn bản"
                select
                value={formValues.type}
                onChange={(e) => setFormValues((p) => ({ ...p, type: e.target.value }))}
              >
                {DOC_TYPES.filter((t) => t !== '').map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trích yếu"
                value={formValues.title}
                onChange={(e) => setFormValues((p) => ({ ...p, title: e.target.value }))}
              />
            </Grid>

            {/* Nơi gửi: Select Option từ danh mục đơn vị */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Nơi gửi (Cơ quan gửi)"
                value={formValues.sender}
                onChange={(e) => setFormValues((p) => ({ ...p, sender: e.target.value }))}
              >
                {unitOptions.map((unit) => (
                  <MenuItem key={unit.code} value={unit.code}>
                    {unit.code} - {unit.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Nơi nhận: Multi Select Option (Cho phép > 1 nơi nhận) */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={unitOptions}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                value={selectedReceivers}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                onChange={(_, newValue) => {
                  setSelectedReceivers(newValue);
                  setFormValues((p) => ({
                    ...p,
                    receiver: newValue.map((item) => item.code).join(', '),
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nơi nhận (Chọn 1 hoặc nhiều đơn vị)"
                    placeholder="Chọn các đơn vị nhận"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.code}
                      label={`${option.code}`}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phiên bản"
                value={formValues.version}
                onChange={(e) => setFormValues((p) => ({ ...p, version: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phân loại"
                select
                value={formValues.classification}
                onChange={(e) => setFormValues((p) => ({ ...p, classification: e.target.value }))}
              >
                {['Thường', 'Nội bộ', 'Mật', 'Tối mật'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.status}
                onChange={(e) => setFormValues((p) => ({ ...p, status: e.target.value }))}
              >
                {['Active', 'Đang xử lý', 'Chờ ký số', 'Đã phát hành'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2">Tệp đính kèm văn bản</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tải file PDF, DOCX hoặc phụ lục.
                      </Typography>
                    </Box>
                    <Button variant="outlined" component="label" startIcon={<Iconify icon="solar:upload-bold" />}>
                      Upload file
                      <input hidden multiple type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} />
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {attachmentFiles.map((f) => (
                      <Chip key={f.name} label={f.name} size="small" color="primary" variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Tạo &amp; Gửi API
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
