import { useMemo, useState } from 'react';
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
  ExchangeTransaction,
  exchangeTransactions,
} from '../../sections/interoperability/mockData';
import {
  DataTable,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';
import Iconify from '../../components/iconify';

// ── Kịch bản mẫu chuẩn ──────────────────────────────────────────────
const SCENARIO_SENDER = {
  unit: 'UBND Hà Nội',
  person: 'Nguyễn Văn A',
  title: 'Phó Chủ tịch UBND Hà Nội',
};
const SCENARIO_RECEIVERS = ['Sở Nội vụ', 'Sở Thông tin & Truyền thông'];
const SCENARIO_FILES = [
  { name: '123_QD_UBND.pdf', type: 'application/pdf', size: '1.8 MB' },
  { name: '123_QD_UBND.xml', type: 'application/xml', size: '42 KB' },
];

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

export default function DocumentExchangePage() {
  const [list, setList] = useState<ExchangeTransaction[]>(exchangeTransactions);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ExchangeTransaction>(emptyForm);
  const [detailTx, setDetailTx] = useState<ExchangeTransaction | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [previewFile, setPreviewFile] = useState<AttachmentPreview | null>(null);

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
        onClick={() => { setDetailTx(tx); setDetailTab(0); }}
      >
        {tx.id}
      </Typography>
    ),
    documentCode: (
      <Stack>
        <Typography variant="body2" fontWeight={600}>{tx.documentCode}</Typography>
        {tx.documentTitle && (
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tx.documentTitle}
          </Typography>
        )}
      </Stack>
    ),
    sender: (
      <Stack>
        <Typography variant="body2">{tx.sender}</Typography>
        {tx.senderPerson && (
          <Typography variant="caption" color="text.secondary">{tx.senderPerson}</Typography>
        )}
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
        onDetail={() => { setDetailTx(tx); setDetailTab(0); }}
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
      sentAt: new Date().toLocaleDateString('vi-VN').replace(/\//g, '/') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
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
        tx.id === id ? { ...tx, status: 'retrying', ack: 'WAITING', retries: tx.retries + 1, updatedAt: '20/07/2026 10:00' } : tx
      )
    );
  }

  function handleSubmit() {
    if (!formValues.id || !formValues.documentCode || !formValues.sender || !formValues.receiver) return;
    const next = {
      ...formValues,
      route: formValues.route || `${formValues.sender} -> TRUC_LT -> ${formValues.receiver}`,
      updatedAt: formValues.sentAt || formValues.updatedAt,
    };
    if (editingId) {
      setList((prev) => prev.map((tx) => (tx.id === editingId ? next : tx)));
    } else {
      setList((prev) => [next, ...prev]);
    }
    setOpenForm(false);
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
      <Grid container>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Tổng giao dịch" value={stats.total} helper="Trong tất cả thời gian" icon="solar:inbox-in-bold" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Tỷ lệ thành công" value={`${Math.round((stats.received / Math.max(stats.total, 1)) * 100)}%`} helper={`${stats.received} giao dịch RECEIVED`} icon="solar:check-read-bold" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Đang chờ ACK" value={stats.waiting} helper="WAITING — chưa nhận xác nhận" icon="solar:chat-round-line-bold" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard label="Lỗi / Retry" value={`${stats.failed} / ${stats.retrying}`} helper="Failed cần xử lý thủ công" icon="solar:restart-bold" />
        </Grid>
      </Grid>

      {/* ── Bảng Delivery Tracking ── */}
      <SectionCard
        title="Theo dõi giao dịch"
        subtitle="Lịch sử giao dịch liên thông. Bấm Transaction ID hoặc Chi tiết để xem đầy đủ thông tin, lý do lỗi, thời gian gửi/nhận."
        action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleOpenCreate}>
            Thêm giao dịch
          </Button>
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
                  <Typography variant="body2" color="text.secondary">{detailTx.documentCode} — {detailTx.documentTitle}</Typography>
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
                <Tab label="Lịch sử trạng thái" icon={<Iconify icon="solar:history-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
                {(detailTx.errorReason) && (
                  <Tab label="Lỗi" icon={<Iconify icon="solar:bug-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40, color: 'error.main' }} />
                )}
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
                    { label: 'ACK', value: detailTx.ack },
                  ].map((row) => (
                    <Grid key={row.label} item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                        <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                        <Typography variant="subtitle2">{row.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                      <Typography variant="caption" color="text.secondary">Trích yếu</Typography>
                      <Typography variant="body2">{detailTx.documentTitle || '—'}</Typography>
                    </Box>
                  </Grid>
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
                    {
                      fileName: `${detailTx.documentCode.replace(/\//g, '_').toLowerCase()}.xml`,
                      type: 'application/xml',
                      size: '38 KB',
                      uploadedAt: detailTx.sentAt || detailTx.updatedAt,
                      actions: (
                        <AttachmentActionsMenu
                          file={{
                            fileName: `${detailTx.documentCode.replace(/\//g, '_').toLowerCase()}.xml`,
                            type: 'application/xml',
                            size: '38 KB',
                          }}
                          onPreview={setPreviewFile}
                        />
                      ),
                    },
                  ]}
                />
              )}

              {detailTab === 2 && (
                <DataTable
                  columns={[
                    { key: 'time', label: 'Thời gian' },
                    { key: 'event', label: 'Sự kiện' },
                    { key: 'actor', label: 'Thực hiện bởi' },
                    { key: 'detail', label: 'Chi tiết' },
                  ]}
                  rows={[
                    { time: detailTx.sentAt || detailTx.updatedAt, event: 'Tiếp nhận gửi', actor: detailTx.senderPerson || detailTx.sender, detail: `Văn bản ${detailTx.documentCode} nộp vào hàng đợi giao nhận` },
                    { time: detailTx.sentAt || detailTx.updatedAt, event: 'Định tuyến', actor: 'Hệ thống TRUC_LT', detail: `Route: ${detailTx.route}` },
                    ...(detailTx.retries > 0 ? Array.from({ length: detailTx.retries }, (_, i) => ({
                      time: detailTx.updatedAt,
                      event: `Retry lần ${i + 1}`,
                      actor: 'Hệ thống TRUC_LT',
                      detail: detailTx.errorReason ? `Lỗi: ${detailTx.errorReason}. Thử lại tự động.` : `Retry #${i + 1}`,
                    })) : []),
                    ...(detailTx.status === 'received' ? [{ time: detailTx.receivedAt || detailTx.updatedAt, event: 'Giao thành công', actor: detailTx.receiver, detail: 'Đơn vị nhận xác nhận ACK, hoàn tất giao dịch' }] : []),
                    ...(detailTx.status === 'failed' ? [{ time: detailTx.updatedAt, event: 'Thất bại', actor: 'Hệ thống TRUC_LT', detail: detailTx.errorDetail || 'Giao dịch thất bại sau số lần retry tối đa' }] : []),
                  ]}
                />
              )}

              {detailTab === 3 && detailTx.errorReason && (
                <Stack spacing={2}>
                  <Alert severity="error" icon={<Iconify icon="solar:bug-bold" />}>
                    <Typography variant="subtitle2">{detailTx.errorReason}</Typography>
                  </Alert>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'error.lighter' }}>
                    <Typography variant="body2" color="error.darker">{detailTx.errorDetail}</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Hướng dẫn xử lý</Typography>
                    {detailTx.errorReason === 'API Timeout' && (
                      <Stack spacing={0.5}>
                        <Typography variant="body2">1. Kiểm tra trạng thái endpoint đơn vị nhận.</Typography>
                        <Typography variant="body2">2. Nếu endpoint đã ổn định, bấm <strong>Replay</strong> để thử lại.</Typography>
                        <Typography variant="body2">3. Nếu vẫn lỗi, liên hệ quản trị viên kiểm tra network.</Typography>
                      </Stack>
                    )}
                    {detailTx.errorReason === 'Signature Error' && (
                      <Stack spacing={0.5}>
                        <Typography variant="body2">1. Yêu cầu đơn vị gửi ký lại văn bản với chứng thư số còn hiệu lực.</Typography>
                        <Typography variant="body2">2. Đảm bảo file PDF và XML được ký cùng một lần, không chỉnh sửa sau ký.</Typography>
                        <Typography variant="body2">3. Gửi lại giao dịch sau khi đã ký đúng.</Typography>
                      </Stack>
                    )}
                    {detailTx.errorReason === 'Routing Error' && (
                      <Stack spacing={0.5}>
                        <Typography variant="body2">1. Vào <strong>Kết nối liên thông</strong> → tab <strong>Endpoint</strong> để kiểm tra cấu hình route.</Typography>
                        <Typography variant="body2">2. Cập nhật đúng agencyCode và endpoint URL cho đơn vị nhận.</Typography>
                        <Typography variant="body2">3. Bấm <strong>Replay</strong> sau khi route đã được sửa.</Typography>
                      </Stack>
                    )}
                    {detailTx.errorReason === 'Auth Failed' && (
                      <Stack spacing={0.5}>
                        <Typography variant="body2">1. Vào <strong>Kết nối liên thông</strong> → tab <strong>API Key</strong> hoặc <strong>Credential</strong>.</Typography>
                        <Typography variant="body2">2. Cấp lại API Key hoặc renew certificate cho đơn vị liên quan.</Typography>
                        <Typography variant="body2">3. Bấm <strong>Replay</strong> sau khi thông tin xác thực đã cập nhật.</Typography>
                      </Stack>
                    )}
                    {detailTx.errorReason === 'Storage Error' && (
                      <Stack spacing={0.5}>
                        <Typography variant="body2">1. Hệ thống đang tự chuyển sang node lưu trữ dự phòng.</Typography>
                        <Typography variant="body2">2. Chờ hệ thống retry tự động. Nếu không tự phục hồi, liên hệ quản trị viên hạ tầng.</Typography>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailTx(null)}>Đóng</Button>
              {(detailTx.status === 'failed' || detailTx.status === 'retrying') && (
                <Button variant="contained" color="warning" onClick={() => { handleReplay(detailTx.id); setDetailTx(null); }}>
                  Replay giao dịch
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={Boolean(previewFile)} onClose={() => setPreviewFile(null)} fullWidth maxWidth="sm">
        <DialogTitle>Xem file đính kèm</DialogTitle>
        <DialogContent>
          {previewFile && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Iconify
                    icon={previewFile.type.includes('pdf') ? 'solar:file-text-bold' : 'solar:code-file-bold'}
                    width={28}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box>
                    <Typography variant="subtitle1">{previewFile.fileName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {previewFile.type} · {previewFile.size}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Alert severity="info">
                Đây là bản xem nhanh demo. Nội dung file thực tế sẽ được tải từ kho lưu trữ khi kết nối backend.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog Thêm/Sửa ── */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Cập nhật giao dịch' : 'Tạo giao dịch mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Transaction ID" disabled={Boolean(editingId)}
                value={formValues.id} onChange={(e) => setFormValues((p) => ({ ...p, id: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Số ký hiệu văn bản"
                value={formValues.documentCode} onChange={(e) => setFormValues((p) => ({ ...p, documentCode: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Trích yếu"
                value={formValues.documentTitle || ''} onChange={(e) => setFormValues((p) => ({ ...p, documentTitle: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Loại văn bản" select value={formValues.documentType || 'CONG_VAN'}
                onChange={(e) => setFormValues((p) => ({ ...p, documentType: e.target.value }))}>
                {DOC_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Route"
                value={formValues.route} onChange={(e) => setFormValues((p) => ({ ...p, route: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nơi gửi"
                value={formValues.sender} onChange={(e) => setFormValues((p) => ({ ...p, sender: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Người gửi"
                value={formValues.senderPerson || ''} onChange={(e) => setFormValues((p) => ({ ...p, senderPerson: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Chức danh người gửi"
                value={formValues.senderTitle || ''} onChange={(e) => setFormValues((p) => ({ ...p, senderTitle: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nơi nhận"
                value={formValues.receiver} onChange={(e) => setFormValues((p) => ({ ...p, receiver: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Trạng thái" select value={formValues.status}
                onChange={(e) => setFormValues((p) => ({ ...p, status: e.target.value as ExchangeTransaction['status'] }))}>
                <MenuItem value="sent">sent</MenuItem>
                <MenuItem value="received">received</MenuItem>
                <MenuItem value="failed">failed</MenuItem>
                <MenuItem value="retrying">retrying</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="ACK" select value={formValues.ack}
                onChange={(e) => setFormValues((p) => ({ ...p, ack: e.target.value as ExchangeTransaction['ack'] }))}>
                <MenuItem value="ACK">ACK</MenuItem>
                <MenuItem value="NACK">NACK</MenuItem>
                <MenuItem value="WAITING">WAITING</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Số lần retry"
                value={formValues.retries} onChange={(e) => setFormValues((p) => ({ ...p, retries: Number(e.target.value) }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Thời gian gửi"
                value={formValues.sentAt || ''} onChange={(e) => setFormValues((p) => ({ ...p, sentAt: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Lý do lỗi (nếu có)"
                value={formValues.errorReason || ''} onChange={(e) => setFormValues((p) => ({ ...p, errorReason: e.target.value }))} />
            </Grid>
            {formValues.errorReason && (
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Chi tiết lỗi"
                  value={formValues.errorDetail || ''} onChange={(e) => setFormValues((p) => ({ ...p, errorDetail: e.target.value }))} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
