import { useEffect, useMemo, useState } from 'react';
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
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  ExchangeTransaction,
  exchangeTransactions,
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
import { dipHubApi } from '../../services/dipHubApi';
import { documentsApi } from '../../services/documentsApi';
import { dmCategoryApi, getDefaultDateRange } from '../../services/dmCategoryApi';
import { getApiMessage, isApiSuccess } from '../../utils/axios';

type AttachmentPreview = { fileName: string; type: string; size: string };

function AttachmentActionsMenu({
  file,
  onPreview,
}: {
  file: AttachmentPreview;
  onPreview: (file: AttachmentPreview) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" width={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            onPreview(file);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:eye-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Xem file" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:download-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Tải xuống" />
        </MenuItem>
      </Menu>
    </>
  );
}

function TransactionActionsMenu({
  tx,
  onDetail,
  onEdit,
  onReplay,
  onDelete,
}: {
  tx: ExchangeTransaction;
  onDetail: () => void;
  onEdit: () => void;
  onReplay: () => void;
  onDelete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const canReplay = tx.status === 'failed' || tx.status === 'retrying';

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
        {canReplay && (
          <MenuItem
            onClick={() => {
              onReplay();
              closeMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:refresh-bold" width={18} sx={{ color: 'warning.main' }} />
            </ListItemIcon>
            <ListItemText primary="Replay" />
          </MenuItem>
        )}
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

const emptyForm: ExchangeTransaction = {
  id: '',
  documentCode: '',
  documentTitle: '',
  documentType: 'CONG_VAN',
  route: '',
  sender: '',
  senderPerson: '',
  senderTitle: '',
  receiver: '',
  status: 'sent',
  ack: 'WAITING',
  retries: 0,
  sentAt: '',
  receivedAt: '',
  updatedAt: '',
  errorReason: '',
  errorDetail: '',
};

const DOC_TYPES = ['CONG_VAN', 'QUYET_DINH', 'BAO_CAO', 'THONG_BAO', 'KE_HOACH', 'BIEN_NHAN'];

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

export default function DocumentExchangePage() {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);

  const [unitOptions, setUnitOptions] = useState<UnitOption[]>(defaultUnits);
  const [selectedReceivers, setSelectedReceivers] = useState<UnitOption[]>([defaultUnits[4]]);

  const [list, setList] = useState<ExchangeTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ExchangeTransaction>(emptyForm);
  const [detailTx, setDetailTx] = useState<ExchangeTransaction | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [previewFile, setPreviewFile] = useState<AttachmentPreview | null>(null);

  // Notification state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await dmCategoryApi.getList({ searchField: { PARENT_CODE: 'DON_VI' } });
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((u) => ({ code: u.code, name: u.name }));
          setUnitOptions(mapped);
          if (mapped.length > 1) {
            setSelectedReceivers([mapped[1]]);
          }
        }
      } catch (e) {
        console.warn('API fetch units error in DocumentExchangePage', e);
      }
    }
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchDocumentsAndTransactions();
  }, [cdateStart, cdateEnd]);

  async function fetchDocumentsAndTransactions() {
    setLoading(true);
    try {
      const docsRes = await documentsApi.getList({
        pageIndex: 1,
        pageSize: 100,
        cdateStart,
        cdateEnd,
      });
      if (docsRes.data && docsRes.data.length > 0) {
        const mapped: ExchangeTransaction[] = docsRes.data.map((doc, idx) => ({
          id: doc.messageId || `TX-${String(1000 + idx)}`,
          documentCode: doc.documentNo || `DOC-${idx + 1}`,
          documentTitle: doc.subject || 'Văn bản liên thông',
          documentType: doc.documentType || 'CONG_VAN',
          route: `${doc.senderCode} -> TRUC_LT -> RECEIVER`,
          sender: doc.senderName || doc.senderCode || 'Cơ quan gửi',
          senderPerson: 'Cán bộ văn thư',
          senderTitle: 'Chuyên viên',
          receiver: 'Đơn vị liên thông',
          status: (doc.status?.toLowerCase() === 'received' ? 'received' : 'sent') as any,
          ack: 'ACK',
          retries: 0,
          sentAt: doc.cdate || new Date().toLocaleDateString('vi-VN'),
          receivedAt: new Date().toLocaleDateString('vi-VN'),
          updatedAt: doc.cdate || new Date().toLocaleDateString('vi-VN'),
        }));
        setList(mapped);
      }
    } catch (err) {
      console.warn('Unable to load documents from backend API, using initial mock transactions', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(
    () =>
      list.filter(
        (tx) =>
          (statusFilter === '' || tx.status === statusFilter) &&
          (tx.id.toLowerCase().includes(keyword.toLowerCase()) ||
            tx.documentCode.toLowerCase().includes(keyword.toLowerCase()) ||
            (tx.documentTitle ?? '').toLowerCase().includes(keyword.toLowerCase()) ||
            tx.sender.toLowerCase().includes(keyword.toLowerCase()) ||
            tx.receiver.toLowerCase().includes(keyword.toLowerCase()))
      ),
    [list, keyword, statusFilter]
  );

  const tableRows = filtered.map((tx) => ({
    id: (
      <Typography
        variant="body2"
        sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600 }}
        onClick={() => {
          setDetailTx(tx);
          setDetailTab(0);
        }}
      >
        {tx.id}
      </Typography>
    ),
    documentCode: (
      <Stack>
        <Typography variant="body2" fontWeight={600}>
          {tx.documentCode}
        </Typography>
        {tx.documentTitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {tx.documentTitle}
          </Typography>
        )}
      </Stack>
    ),
    sender: (
      <Stack>
        <Typography variant="body2">{tx.sender}</Typography>
        {tx.senderPerson && <Typography variant="caption" color="text.secondary">{tx.senderPerson}</Typography>}
      </Stack>
    ),
    receiver: <Typography variant="body2">{tx.receiver}</Typography>,
    sentAt: <Typography variant="caption">{tx.sentAt || tx.updatedAt}</Typography>,
    status: <StatusChip status={tx.status} />,
    ack: <StatusChip status={tx.ack} />,
    retries: tx.retries,
    actions: (
      <TransactionActionsMenu
        tx={tx}
        onDetail={() => {
          setDetailTx(tx);
          setDetailTab(0);
        }}
        onEdit={() => handleEdit(tx)}
        onReplay={() => handleReplay(tx.id)}
        onDelete={() => handleDelete(tx.id)}
      />
    ),
  }));

  function handleOpenCreate() {
    setEditingId(null);
    setFormValues({
      ...emptyForm,
      id: `TX-${String(Date.now()).slice(-10)}`,
      sentAt:
        new Date().toLocaleDateString('vi-VN').replace(/\//g, '/') +
        ' ' +
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleDateString('vi-VN'),
    });
    setOpenForm(true);
  }

  function handleEdit(tx: ExchangeTransaction) {
    setEditingId(tx.id);
    setFormValues(tx);
    setOpenForm(true);
  }

  function handleDelete(id: string) {
    setList((prev) => prev.filter((tx) => tx.id !== id));
  }

  function handleReplay(id: string) {
    setList((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, status: 'retrying', ack: 'WAITING', retries: tx.retries + 1, updatedAt: new Date().toLocaleDateString('vi-VN') } : tx
      )
    );
    setToast({ open: true, message: `Đã phát lại giao dịch ${id}`, severity: 'info' });
  }

  // Gọi API DIP_Hub/Send khi người dùng tạo/lưu giao dịch
  async function handleSubmit() {
    if (!formValues.id || !formValues.documentCode || !formValues.sender || !formValues.receiver) return;

    const receiverCodes = selectedReceivers.map((r) => r.code);

    // Call Backend DIP_Hub/Send API
    const sendRes = await dipHubApi.sendDocument({
      header: {
        document_No: formValues.documentCode,
        document_Type: formValues.documentType || 'CONG_VAN',
        subject: formValues.documentTitle || 'Văn bản liên thông',
        sender_Code: formValues.sender,
        receiver_Code: receiverCodes,
        priority: '1',
        issue_Date: new Date().toISOString().slice(0, 10),
      },
      body: [
        {
          file_Name: `${formValues.documentCode.replace(/\//g, '_')}.pdf`,
          data_Type: 'pdf',
          content_Type: 'application/pdf',
          file_URL: 'http://minio.gov.vn/documents/sample.pdf',
        },
      ],
    });

    const isSuccess = isApiSuccess(sendRes);
    const msg = getApiMessage(sendRes, isSuccess ? 'Gửi văn bản qua API DIP_Hub/Send thành công!' : 'Gửi văn bản thất bại');

    if (isSuccess) {
      const next: ExchangeTransaction = {
        ...formValues,
        route: formValues.route || `${formValues.sender} -> TRUC_LT -> ${formValues.receiver}`,
        updatedAt: formValues.sentAt || formValues.updatedAt,
        status: 'sent',
      };

      if (editingId) {
        setList((prev) => prev.map((tx) => (tx.id === editingId ? next : tx)));
      } else {
        setList((prev) => [next, ...prev]);
      }
      setToast({ open: true, message: msg, severity: 'success' });
      setOpenForm(false);
    } else {
      setToast({
        open: true,
        message: `Lỗi API DIP_Hub/Send [ResultCode: ${sendRes.resultCode || sendRes.ResultCode}]: ${msg}`,
        severity: 'error',
      });
    }
  }

  // Gọi API Tiếp nhận văn bản (DIP_Hub/Receive)
  async function handleReceiveApi(tx: ExchangeTransaction) {
    const res = await dipHubApi.receiveDocument({
      document_Id: tx.id,
      sender_Code: tx.sender,
      receiver_Code: tx.receiver,
    });

    const isSuccess = isApiSuccess(res);
    const msg = getApiMessage(res, isSuccess ? 'Tiếp nhận văn bản thành công (DIP_Hub/Receive)!' : 'Tiếp nhận thất bại');

    if (isSuccess) {
      setList((prev) =>
        prev.map((item) => (item.id === tx.id ? { ...item, status: 'received', receivedAt: new Date().toLocaleString('vi-VN') } : item))
      );
      setToast({ open: true, message: msg, severity: 'success' });
    } else {
      setToast({
        open: true,
        message: `Lỗi API DIP_Hub/Receive [ResultCode: ${res.resultCode || res.ResultCode}]: ${msg}`,
        severity: 'error',
      });
    }
  }

  // Gọi API Phản hồi / Xác nhận ACK (DIP_Hub/Ack)
  async function handleAckApi(tx: ExchangeTransaction, status: 'ACK' | 'NACK') {
    const res = await dipHubApi.ackDocument({
      document_Id: tx.id,
      receiver_Code: tx.receiver,
      status,
    });

    const isSuccess = isApiSuccess(res);
    const msg = getApiMessage(res, isSuccess ? `Đã gửi xác nhận ${status} qua API DIP_Hub/Ack` : `Xác nhận ${status} thất bại`);

    if (isSuccess) {
      setList((prev) => prev.map((item) => (item.id === tx.id ? { ...item, ack: status } : item)));
      setToast({ open: true, message: msg, severity: status === 'ACK' ? 'success' : 'info' });
    } else {
      setToast({
        open: true,
        message: `Lỗi API DIP_Hub/Ack [ResultCode: ${res.resultCode || res.ResultCode}]: ${msg}`,
        severity: 'error',
      });
    }
  }

  const stats = {
    total: list.length,
    received: list.filter((tx) => tx.status === 'received').length,
    failed: list.filter((tx) => tx.status === 'failed').length,
    retrying: list.filter((tx) => tx.status === 'retrying').length,
    waiting: list.filter((tx) => tx.ack === 'WAITING').length,
  };

  return (
    <PageShell
      title="Document Exchange"
      subtitle="Theo dõi hành trình giao nhận văn bản: gửi từ đâu, qua route nào, đến ai, ACK ra sao, có retry hay phát sinh lỗi không."
    >
      {/* ── Metrics ── */}
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard label="Tổng giao dịch" value={stats.total} helper="Từ API DOCUMENTS & DIP_Hub" icon="solar:inbox-in-bold" />
        <MetricCard
          label="Tỷ lệ thành công"
          value={`${Math.round((stats.received / Math.max(stats.total, 1)) * 100)}%`}
          helper={`${stats.received} giao dịch RECEIVED`}
          icon="solar:check-read-bold"
        />
        <MetricCard label="Đang chờ ACK" value={stats.waiting} helper="WAITING — chưa nhận xác nhận" icon="solar:chat-round-line-bold" />
        <MetricCard label="Lỗi / Retry" value={`${stats.failed} / ${stats.retrying}`} helper="Failed cần xử lý thủ công" icon="solar:restart-bold" />
      </GridRow>

      {/* ── Bảng Delivery Tracking ── */}
      <SectionCard
        title="Theo dõi giao dịch liên thông"
        subtitle="Quản lý lịch sử giao dịch liên thông qua API DIP_Hub & DIP_INTERNAL."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={fetchDocumentsAndTransactions} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới (API)'}
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleOpenCreate}>
              Gửi văn bản mới
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Tìm giao dịch"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Transaction ID, văn bản, nơi gửi, nơi nhận..."
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="date"
              label="Từ ngày (CDATE_START)"
              InputLabelProps={{ shrink: true }}
              value={cdateStart}
              onChange={(e) => setCdateStart(e.target.value)}
              sx={{ minWidth: 170 }}
            />
            <TextField
              size="small"
              type="date"
              label="Đến ngày (CDATE_END)"
              InputLabelProps={{ shrink: true }}
              value={cdateEnd}
              onChange={(e) => setCdateEnd(e.target.value)}
              sx={{ minWidth: 170 }}
            />
            <TextField
              size="small"
              label="Lọc trạng thái"
              select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="received">Received</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="retrying">Retrying</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
          </Stack>

          <DataTable
            columns={[
              { key: 'id', label: 'Transaction ID' },
              { key: 'documentCode', label: 'Văn bản' },
              { key: 'sender', label: 'Nơi gửi' },
              { key: 'receiver', label: 'Nơi nhận' },
              { key: 'sentAt', label: 'Thời gian gửi' },
              { key: 'status', label: 'Trạng thái', align: 'center' },
              { key: 'ack', label: 'ACK', align: 'center' },
              { key: 'retries', label: 'Retry', align: 'right' },
              { key: 'actions', label: 'Thao tác', align: 'right' },
            ]}
            rows={tableRows}
          />
        </Stack>
      </SectionCard>

      {/* ── Dialog Chi tiết giao dịch ── */}
      <Dialog open={Boolean(detailTx)} onClose={() => setDetailTx(null)} fullWidth maxWidth="md">
        {detailTx && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography variant="h6">{detailTx.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailTx.documentCode} — {detailTx.documentTitle}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <StatusChip status={detailTx.status} />
                  <StatusChip status={detailTx.ack} />
                </Stack>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 1 }}>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }}>
                <Tab label="Metadata" icon={<Iconify icon="solar:document-text-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
                <Tab label="File đính kèm" icon={<Iconify icon="solar:paperclip-2-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
                <Tab label="Thao tác API (Receive/ACK)" icon={<Iconify icon="solar:round-transfer-horizontal-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
              </Tabs>

              {detailTab === 0 && (
                <Grid container spacing={2}>
                  {[
                    { label: 'Transaction ID', value: detailTx.id },
                    { label: 'Loại văn bản', value: detailTx.documentType || '—' },
                    { label: 'Số ký hiệu văn bản', value: detailTx.documentCode },
                    { label: 'Route', value: detailTx.route },
                    { label: 'Nơi gửi', value: detailTx.sender },
                    { label: 'Người gửi', value: detailTx.senderPerson ? `${detailTx.senderPerson} — ${detailTx.senderTitle}` : '—' },
                    { label: 'Nơi nhận', value: detailTx.receiver },
                    { label: 'Thời gian gửi', value: detailTx.sentAt || '—' },
                    { label: 'Thời gian nhận', value: detailTx.receivedAt || '—' },
                    { label: 'Cập nhật lần cuối', value: detailTx.updatedAt },
                    { label: 'Số lần retry', value: String(detailTx.retries) },
                    { label: 'ACK Status', value: detailTx.ack },
                  ].map((row) => (
                    <Grid key={row.label} item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                        <Typography variant="caption" color="text.secondary">
                          {row.label}
                        </Typography>
                        <Typography variant="subtitle2">{row.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {detailTab === 1 && (
                <DataTable
                  minWidth={780}
                  columns={[
                    { key: 'fileName', label: 'Tên file', width: 220 },
                    { key: 'type', label: 'Loại', width: 180 },
                    { key: 'size', label: 'Kích thước', align: 'right', width: 110 },
                    { key: 'uploadedAt', label: 'Upload lúc', width: 150 },
                    { key: 'actions', label: 'Thao tác', align: 'center', width: 90 },
                  ]}
                  rows={[
                    {
                      fileName: `${detailTx.documentCode.replace(/\//g, '_').toLowerCase()}.pdf`,
                      type: 'application/pdf',
                      size: '2.1 MB',
                      uploadedAt: detailTx.sentAt || detailTx.updatedAt,
                      actions: (
                        <AttachmentActionsMenu
                          file={{
                            fileName: `${detailTx.documentCode.replace(/\//g, '_').toLowerCase()}.pdf`,
                            type: 'application/pdf',
                            size: '2.1 MB',
                          }}
                          onPreview={setPreviewFile}
                        />
                      ),
                    },
                  ]}
                />
              )}

              {detailTab === 2 && (
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <Alert severity="info">
                    Thực hiện kiểm thử các API tiếp nhận (`/DIP_Hub/Receive`) và xác nhận phản hồi (`/DIP_Hub/Ack`) cho thông điệp này.
                  </Alert>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<Iconify icon="solar:inbox-in-bold" />}
                      onClick={() => handleReceiveApi(detailTx)}
                    >
                      Gọi API Receive (Tiếp nhận)
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Iconify icon="solar:check-circle-bold" />}
                      onClick={() => handleAckApi(detailTx, 'ACK')}
                    >
                      Gửi ACK (Xác nhận thành công)
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Iconify icon="solar:close-circle-bold" />}
                      onClick={() => handleAckApi(detailTx, 'NACK')}
                    >
                      Gửi NACK (Báo lỗi)
                    </Button>
                  </Stack>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailTx(null)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Dialog Gửi văn bản mới (Call DIP_Hub/Send) ── */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Cập nhật giao dịch' : 'Gửi văn bản liên thông mới (DIP_Hub/Send)'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID (Message ID)"
                disabled={Boolean(editingId)}
                value={formValues.id}
                onChange={(e) => setFormValues((p) => ({ ...p, id: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số ký hiệu văn bản (Document No)"
                value={formValues.documentCode}
                onChange={(e) => setFormValues((p) => ({ ...p, documentCode: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trích yếu (Subject)"
                value={formValues.documentTitle || ''}
                onChange={(e) => setFormValues((p) => ({ ...p, documentTitle: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loại văn bản"
                select
                value={formValues.documentType || 'CONG_VAN'}
                onChange={(e) => setFormValues((p) => ({ ...p, documentType: e.target.value }))}
              >
                {DOC_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Mã đơn vị gửi (Sender Code)"
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
                    label="Mã đơn vị nhận (Receiver Code - Chọn 1 hoặc nhiều)"
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thời gian phát hành"
                value={formValues.sentAt || ''}
                onChange={(e) => setFormValues((p) => ({ ...p, sentAt: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Gửi (Call API DIP_Hub/Send)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((p) => ({ ...p, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </PageShell>
  );
}
