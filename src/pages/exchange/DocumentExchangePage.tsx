import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import Iconify from '../../components/iconify';
import { ExchangeTransaction } from '../../sections/interoperability/mockData';
import {
  DataTable,
  GridRow,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';
import { documentsApi } from '../../services/documentsApi';
import { dmCategoryApi } from '../../services/dmCategoryApi';
import useLoading from '../../hooks/useLoading';
import { isApiSuccess } from '../../utils/axios';
import DocumentExchangeDetailDialog from './DocumentExchangeDetailDialog';
import DocumentExchangeCreateDialog from './DocumentExchangeCreateDialog';
import { ACK_SUCCESS_STATUSES, FAILED_STATUSES, getDocumentStatusNote } from '../../utils/constants';

function TransactionActionsMenu({
  tx,
  onDetail,
  onReplay,
  onDelete,
  onAck,
}: {
  tx: ExchangeTransaction;
  onDetail: () => void;
  onReplay: () => void;
  onDelete: () => void;
  onAck: () => void;
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
            onAck();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />
          </ListItemIcon>
          <ListItemText primary="Xác nhận" />
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
        {/* <MenuItem
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
        </MenuItem> */}
      </Menu>
    </>
  );
}

const emptyForm: ExchangeTransaction = {
  id: '',
  documentId: '',
  documentNo: '',
  documentCode: '',
  documentType: 'CONG_VAN',
  subject: '',
  documentTitle: '',
  senderCode: '',
  sender: '',
  receiverCode: [],
  receiver: '',
  priority: 'NORMAL',
  sendTime: '',
  issueDate: '',
  route: '',
  senderPerson: '',
  senderTitle: '',
  status: 'sent',
  ack: 'WAITING',
  retries: 0,
  sentAt: '',
  receivedAt: '',
  updatedAt: '',
  errorReason: '',
  errorDetail: '',
};

export default function DocumentExchangePage() {
  const [list, setList] = useState<ExchangeTransaction[]>([]);
  const [keyword, setKeyword] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [detailTx, setDetailTx] = useState<ExchangeTransaction | null>(null);

  const { enqueueSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await documentsApi.getRoutes({});
      const rawData = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      if (rawData && Array.isArray(rawData)) {
        const groupMap = new Map<string, any>();

        rawData.forEach((item: any) => {
          const sCode = item.SENDER_NAME || item.SENDER_CODE || item.SOURCE_SYSTEM || item.senderCode || '';
          const docNo = item.DOCUMENT_NO || item.documentNo || item.code || '';
          const sendTime = item.SEND_TIME || item.sendTime || item.CDATE || item.cdate || '';
          const groupKey = item.MESSAGE_ID || item.messageId || `${docNo}_${sCode}_${sendTime}` || String(item.ID || item.CODE);

          if (!groupMap.has(groupKey)) {
            groupMap.set(groupKey, {
              id: item.ID || item.id,
              code: item.CODE || item.code,
              messageId: item.MESSAGE_ID || item.messageId,
              documentId: item.DOCUMENT_ID || item.documentId,
              documentNo: docNo,
              documentType: item.DOCUMENT_TYPE || item.documentType || 'CONG_VAN',
              subject: item.SUBJECT || item.subject || '',
              senderCode: item.SENDER_CODE || item.senderCode || '',
              sender: sCode,
              senderPerson: item.SENDER_PERSON || '',
              senderTitle: item.SENDER_TITLE || '',
              priority: item.PRIORITY || item.priority || 'NORMAL',
              sendTime: sendTime,
              sentAt: sendTime,
              issueDate: sendTime,
              documentCode: docNo,
              documentTitle: item.SUBJECT || item.subject || '',
              routes: [],
            });
          }

          const group = groupMap.get(groupKey);
          const rName = item.RECEIVER_NAME || item.RECEIVER_CODE || item.TARGET_SYSTEM || item.receiverCode || '';
          group.routes.push({
            id: item.ID || item.id,
            code: item.CODE || item.code,
            messageId: item.MESSAGE_ID || item.messageId,
            receiverCode: item.RECEIVER_CODE || item.receiverCode || '',
            receiverName: rName,
            status: (item.STATUS || 'WAITING').toUpperCase(),
            sendTime: sendTime,
            receiveTime: item.RECEIVE_TIME || item.receiveTime || '',
            ackTime: item.ACK_TIME || item.ackTime || '',
          });
        });

        const mapped: ExchangeTransaction[] = Array.from(groupMap.values()).map((g: any) => {
          const receiverNames = g.routes.map((r: any) => r.receiverName).filter(Boolean);
          const receiverCodes = g.routes.map((r: any) => r.receiverCode).filter(Boolean);

          const isAllAck = g.routes.every((r: any) =>
            ACK_SUCCESS_STATUSES.includes((r.status || '').toUpperCase())
          );
          const hasFailed = g.routes.some((r: any) =>
            FAILED_STATUSES.includes((r.status || '').toUpperCase())
          );
          const hasRetrying = g.routes.some((r: any) =>
            ['RETRYING'].includes((r.status || '').toUpperCase())
          );

          let overallStatus = 'waiting';
          if (isAllAck) overallStatus = 'received';
          else if (hasFailed) overallStatus = 'failed';
          else if (hasRetrying) overallStatus = 'retrying';

          return {
            ...g,
            receiverCode: receiverCodes,
            receiver: receiverNames.join(', '),
            status: overallStatus,
            ack: isAllAck ? 'ACK' : 'WAITING',
            retries: g.routes.reduce((acc: number, r: any) => acc + (r.retryCount || 0), 0),
            updatedAt: g.routes.find((r: any) => r.ackTime)?.ackTime || g.sentAt,
            route: `${g.sender} -> ${receiverNames.join(', ')}`,
          };
        });

        setList(mapped);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch danh sách văn bản để chọn trong Dialog Tạo giao dịch
  const { data: documentOptions = [] } = useQuery({
    queryKey: ['exchangeDocumentOptions'],
    queryFn: async () => {
      const res = await documentsApi.getList({ pageIndex: 1, pageSize: 200 });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      return rawList.map((doc: any) => ({
        id: doc.ID || doc.id,
        code: doc.CODE || doc.code,
        documentNo: doc.DOCUMENT_NO || doc.documentNo || doc.CODE || '',
        subject: doc.SUBJECT || doc.subject || '',
        documentType: doc.DOCUMENT_TYPE || doc.documentType || 'CONG_VAN',
        senderCode: doc.SENDER_CODE || doc.senderCode || '',
        senderName: doc.SENDER_NAME || doc.senderName || '',
      }));
    },
  });

  // Fetch danh sách đơn vị để làm Nơi gửi / Nơi nhận (PARENT_CODE = DON_VI và các đơn vị con)
  const { data: unitOptions = [] } = useQuery({
    queryKey: ['exchangeUnitOptions'],
    queryFn: async () => {
      const res = await dmCategoryApi.getList({ pageIndex: 1, pageSize: 500 });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);

      // Lọc các đơn vị có PARENT_CODE = DON_VI hoặc là đơn vị con của PARENT_CODE = DON_VI
      const validUnitCodes = new Set<string>();
      let addedNew = true;
      while (addedNew) {
        addedNew = false;
        rawList.forEach((item: any) => {
          const code = String(item.CODE || item.code || '').trim();
          const parentCode = String(item.PARENT_CODE || item.parentCode || '').trim();
          if (code && !validUnitCodes.has(code)) {
            if (parentCode.toUpperCase() === 'DON_VI' || validUnitCodes.has(parentCode)) {
              validUnitCodes.add(code);
              addedNew = true;
            }
          }
        });
      }

      const options: { code: string; label: string }[] = [];
      const seen = new Set<string>();
      rawList.forEach((item: any) => {
        const code = String(item.CODE || item.code || '').trim();
        const name = String(item.NAME || item.name || '').trim();
        if (code && validUnitCodes.has(code) && !seen.has(code)) {
          seen.add(code);
          options.push({ code, label: name || code });
        }
      });
      return options;
    },
  });



  const filtered = useMemo(
    () =>
      list.filter(
        (tx) =>
          String(tx.id || tx.code || '').toLowerCase().includes(keyword.toLowerCase()) ||
          (tx.documentCode || '').toLowerCase().includes(keyword.toLowerCase()) ||
          (tx.documentTitle || '').toLowerCase().includes(keyword.toLowerCase()) ||
          (tx.sender || '').toLowerCase().includes(keyword.toLowerCase()) ||
          (tx.receiver || '').toLowerCase().includes(keyword.toLowerCase())
      ),
    [list, keyword]
  );


  function handleDelete(id: string | number) {
    setList((prev) => prev.filter((tx) => (tx.id || tx.code) !== id));
  }

  function handleReplay(id: string | number) {
    setList((prev) =>
      prev.map((tx) =>
        (tx.id || tx.code) === id
          ? { ...tx, status: 'retrying', ack: 'WAITING', retries: (tx.retries || 0) + 1, updatedAt: new Date().toLocaleDateString('vi-VN') }
          : tx
      )
    );
  }

  const [ackTarget, setAckTarget] = useState<{
    tx: ExchangeTransaction;
    receivers: { code: string; name: string; status: string }[];
    selectedCode: string;
  } | null>(null);

  async function executeAck(tx: ExchangeTransaction, receiverCode: string) {
    const docId = String(tx.documentId || tx.id || tx.code || '');
    if (!docId || !receiverCode) {
      enqueueSnackbar('Thiếu thông tin mã văn bản hoặc mã đơn vị nhận', { variant: 'warning' });
      return;
    }

    try {
      showLoading();
      const res = await documentsApi.ackDocument({
        documentId: docId,
        receiverCode,
        status: 'RECEIVED',
      });

      if (isApiSuccess(res)) {
        setAckTarget(null);
        fetchTransactions();
      }
    } catch {
      // ignore
    } finally {
      hideLoading();
    }
  }

  function handleAck(tx: ExchangeTransaction) {
    const receivers: { code: string; name: string; status: string }[] =
      tx.routes && tx.routes.length > 0
        ? tx.routes.map((r: any) => ({
            code: r.receiverCode || r.code || '',
            name: r.receiverName || r.receiverCode || '',
            status: r.status || 'WAITING',
          }))
        : Array.isArray(tx.receiverCode)
        ? tx.receiverCode.map((c) => ({ code: c, name: c, status: 'WAITING' }))
        : [{ code: String(tx.receiverCode || ''), name: String(tx.receiver || ''), status: 'WAITING' }];

    if (receivers.length <= 1) {
      executeAck(tx, receivers[0]?.code || '');
    } else {
      setAckTarget({
        tx,
        receivers,
        selectedCode: receivers[0]?.code || '',
      });
    }
  }

  async function handleCreateSubmit(formValues: ExchangeTransaction) {
    const docNo = formValues.documentNo || formValues.documentCode;
    const sCode = formValues.senderCode || formValues.sender;
    const rCodes: string[] = Array.isArray(formValues.receiverCode)
      ? formValues.receiverCode
      : typeof formValues.receiverCode === 'string' && formValues.receiverCode
      ? (formValues.receiverCode as string).split(',').map((s) => s.trim()).filter(Boolean)
      : typeof formValues.receiver === 'string' && formValues.receiver
      ? (formValues.receiver as string).split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const subj = formValues.subject || formValues.documentTitle;

    if (!docNo || !sCode || rCodes.length === 0) {
      enqueueSnackbar('Vui lòng chọn Số ký hiệu, Nơi gửi và chọn ít nhất 1 Nơi nhận', { variant: 'warning' });
      return;
    }

    try {
      showLoading();
      const sendRes = await documentsApi.sendDocument({
        header: {
          documentId: formValues.documentId || formValues.id,
          documentNo: docNo,
          documentType: formValues.documentType || 'CONG_VAN',
          subject: subj || 'Văn bản liên thông',
          senderCode: sCode,
          receiverCode: rCodes,
          priority: formValues.priority || 'NORMAL',
          sendTime: formValues.sendTime || formValues.issueDate || new Date().toISOString().split('T')[0],
          issueDate: formValues.sendTime || formValues.issueDate || new Date().toISOString().split('T')[0],
        },
      });

      await fetchTransactions();
      setOpenForm(false);
      setTimeout(() => {
        fetchTransactions();
      }, 1200);
    } catch {
      // ignore
    } finally {
      hideLoading();
    }
  }

  const tableRows = filtered.map((tx, index) => ({
    stt: (
      <Typography
        variant="body2"
        align="center"
        sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600 }}
        onClick={() => { setDetailTx(tx); }}
      >
        {index + 1}
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
    receiver: (
      <Stack spacing={0.5} alignItems="flex-start" sx={{ py: 0.5 }}>
        {tx.routes && tx.routes.length > 0 ? (
          tx.routes.map((r: any, idx: number) => {
            const sUpper = (r.status || '').toUpperCase();
            const isAck = ACK_SUCCESS_STATUSES.includes(sUpper);
            const isFailed = FAILED_STATUSES.includes(sUpper);
            const color = isAck ? 'success' : isFailed ? 'error' : 'warning';
            const icon = isAck ? 'solar:check-circle-bold' : isFailed ? 'solar:danger-bold' : 'solar:clock-circle-bold';
            const statusText = getDocumentStatusNote(r.status);

            return (
              <Chip
                key={r.id || idx}
                icon={<Iconify icon={icon} width={13} />}
                label={`${r.receiverName || r.receiverCode} (${statusText})`}
                size="small"
                color={color}
                variant="soft"
                sx={{ height: 22, fontSize: '0.725rem', fontWeight: 600 }}
              />
            );
          })
        ) : (
          <Typography variant="body2">{tx.receiver || '—'}</Typography>
        )}
      </Stack>
    ),
    sentAt: <Typography variant="caption">{tx.sentAt || tx.updatedAt}</Typography>,
    actions: (
      <TransactionActionsMenu
        tx={tx}
        onDetail={() => { setDetailTx(tx); }}
        onReplay={() => handleReplay(tx.id || tx.code || '')}
        onDelete={() => handleDelete(tx.id || tx.code || '')}
        onAck={() => handleAck(tx)}
      />
    ),
  }));

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
        <MetricCard label="Tổng giao dịch" value={stats.total} helper="Trong tất cả thời gian" icon="solar:inbox-in-bold" backgroundColor="#01AD65" />
        <MetricCard label="Tỷ lệ thành công" value={`${Math.round((stats.received / Math.max(stats.total, 1)) * 100)}%`} helper={`${stats.received} giao dịch RECEIVED`} icon="solar:check-read-bold" backgroundColor="#028EDD" />
        <MetricCard label="Đang chờ ACK" value={stats.waiting} helper="WAITING — chưa nhận xác nhận" icon="solar:chat-round-line-bold" backgroundColor="#9E50FE" />
        <MetricCard label="Lỗi / Retry" value={`${stats.failed} / ${stats.retrying}`} helper="Failed cần xử lý thủ công" icon="solar:restart-bold" backgroundColor="#FF8551" />
      </GridRow>

      {/* ── Bảng Delivery Tracking ── */}
      <SectionCard
        title="Theo dõi giao dịch"
        subtitle="Lịch sử giao dịch liên thông. Bấm Transaction ID hoặc Chi tiết để xem đầy đủ thông tin, lý do lỗi, thời gian gửi/nhận."
        action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpenForm(true)}>
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
              fullWidth
            />
          </Stack>

          <DataTable
            columns={[
              { key: 'stt', label: 'STT', align: 'center', width: 60 },
              { key: 'documentCode', label: 'Văn bản' },
              { key: 'sender', label: 'Nơi gửi' },
              { key: 'receiver', label: 'Nơi nhận' },
              { key: 'sentAt', label: 'Thời gian gửi' },
              { key: 'actions', label: 'Thao tác', align: 'right' },
            ]}
            rows={tableRows}
          />
        </Stack>
      </SectionCard>

      <DocumentExchangeDetailDialog
        open={Boolean(detailTx)}
        detailTx={detailTx}
        onClose={() => setDetailTx(null)}
        onAck={handleAck}
        onReplay={handleReplay}
      />

      <DocumentExchangeCreateDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreateSubmit}
        documentOptions={documentOptions}
        unitOptions={unitOptions}
      />

      {/* ── Dialog Chọn Đơn vị xác nhận (ACK cho Demo) ── */}
      {ackTarget && (
        <Dialog open={Boolean(ackTarget)} onClose={() => setAckTarget(null)} fullWidth maxWidth="xs">
          <DialogTitle>Chọn Đơn vị gửi Xác nhận (ACK)</DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Văn bản <strong>{ackTarget.tx.documentCode || ackTarget.tx.documentNo}</strong> được gửi cho {ackTarget.receivers.length} đơn vị. Chọn đơn vị bạn muốn đóng vai tiếp nhận phản hồi:
            </Typography>
            <TextField
              select
              fullWidth
              label="Đơn vị nhận xác nhận"
              value={ackTarget.selectedCode}
              onChange={(e) => setAckTarget({ ...ackTarget, selectedCode: e.target.value })}
              SelectProps={{ native: true }}
            >
              {ackTarget.receivers.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} ({r.status === 'ACK' ? 'Đã ACK' : 'Chờ ACK'})
                </option>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAckTarget(null)}>Hủy</Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              onClick={() => executeAck(ackTarget.tx, ackTarget.selectedCode)}
            >
              Gửi xác nhận (ACK)
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </PageShell>
  );
}
