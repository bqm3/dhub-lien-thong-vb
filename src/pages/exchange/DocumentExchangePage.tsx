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
  Typography,
} from '@mui/material';
import {
  ExchangeTransaction,
  exchangeFunctions,
  exchangeTransactions,
} from '../../sections/interoperability/mockData';
import {
  BulletList,
  DataTable,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';

const emptyTransactionForm: ExchangeTransaction = {
  id: '',
  documentCode: '',
  route: '',
  sender: '',
  receiver: '',
  status: 'sent',
  ack: 'WAITING',
  retries: 0,
  updatedAt: '02/07/2026 09:30',
};

export default function DocumentExchangePage() {
  const [transactionList, setTransactionList] = useState<ExchangeTransaction[]>(exchangeTransactions);
  const [keyword, setKeyword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ExchangeTransaction>(emptyTransactionForm);

  const filteredTransactions = useMemo(
    () =>
      transactionList.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(keyword.toLowerCase()) ||
          transaction.documentCode.toLowerCase().includes(keyword.toLowerCase()) ||
          transaction.sender.toLowerCase().includes(keyword.toLowerCase()) ||
          transaction.receiver.toLowerCase().includes(keyword.toLowerCase())
      ),
    [transactionList, keyword]
  );

  const transactionRows = filteredTransactions.map((transaction) => ({
    id: transaction.id,
    documentCode: transaction.documentCode,
    sender: transaction.sender,
    receiver: transaction.receiver,
    status: <StatusChip status={transaction.status} />,
    ack: <StatusChip status={transaction.ack} />,
    retries: transaction.retries,
    updatedAt: transaction.updatedAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(transaction)}>
          Sửa
        </Button>
        <Button size="small" onClick={() => handleReplay(transaction.id)}>
          Replay
        </Button>
        <Button size="small" color="error" onClick={() => handleDelete(transaction.id)}>
          Xóa
        </Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingId(null);
    setFormValues({
      ...emptyTransactionForm,
      id: `TX-${String(Date.now()).slice(-10)}`,
    });
    setOpenDialog(true);
  }

  function handleEdit(transaction: ExchangeTransaction) {
    setEditingId(transaction.id);
    setFormValues(transaction);
    setOpenDialog(true);
  }

  function handleDelete(id: string) {
    setTransactionList((prev) => prev.filter((transaction) => transaction.id !== id));
  }

  function handleReplay(id: string) {
    setTransactionList((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              status: 'retrying',
              ack: 'WAITING',
              retries: transaction.retries + 1,
              updatedAt: '02/07/2026 10:00',
            }
          : transaction
      )
    );
  }

  function handleSubmit() {
    if (!formValues.id || !formValues.documentCode || !formValues.sender || !formValues.receiver) return;

    const nextValues = {
      ...formValues,
      route: formValues.route || `${formValues.sender} -> TRUC_LT -> ${formValues.receiver}`,
    };

    if (editingId) {
      setTransactionList((prev) =>
        prev.map((transaction) => (transaction.id === editingId ? nextValues : transaction))
      );
    } else {
      setTransactionList((prev) => [nextValues, ...prev]);
    }

    setOpenDialog(false);
  }

  return (
    <PageShell
      title="Document Exchange"
      subtitle="Theo dõi hành trình giao nhận văn bản: gửi từ đâu, qua route nào, đến ai, ACK ra sao, có retry hay phát sinh lỗi hay không."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Submission hôm nay"
            value={transactionList.length}
            helper="Số giao dịch hiện có trong danh sách demo"
            icon="solar:inbox-in-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Delivery success"
            value={`${Math.round((transactionList.filter((item) => item.status === 'received').length / Math.max(transactionList.length, 1)) * 100)}%`}
            helper="Tính trên giao dịch RECEIVED"
            icon="solar:check-read-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="ACK chờ xử lý"
            value={transactionList.filter((item) => item.ack === 'WAITING').length}
            helper="Đang đợi xác nhận từ nơi nhận"
            icon="solar:chat-round-line-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Retry đang chạy"
            value={transactionList.filter((item) => item.status === 'retrying').length}
            helper="Cập nhật khi bấm Replay"
            icon="solar:restart-bold"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Exchange Capabilities"
            subtitle="12 nhóm chức năng của module giao nhận và giám sát giao dịch."
          >
            <BulletList items={exchangeFunctions} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Routing & Policy"
            subtitle="Ví dụ rule route và quy tắc giao dịch theo nơi gửi/nhận."
          >
            <Stack spacing={2}>
              {[
                'Route mặc định: Agency -> Trục liên thông -> Recipient.',
                'Văn bản mức Mật bắt buộc ký số, đối chiếu fingerprint file và ACK trong 30s.',
                'Nếu endpoint đích timeout > 15s, transaction vào hàng retry tự động.',
                'Mỗi transaction phải có messageId, correlationId và audit trail hoàn chỉnh.',
              ].map((item) => (
                <Box key={item} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        title="Delivery Tracking"
        subtitle="Danh sách giao dịch có tạo mới, sửa status, replay và xóa."
        action={
          <Button variant="contained" onClick={handleOpenCreate}>
            Thêm giao dịch
          </Button>
        }
      >
        <Stack spacing={2}>
          <TextField
            size="small"
            label="Tìm giao dịch"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Transaction ID, văn bản, nơi gửi, nơi nhận"
          />
        <DataTable
          columns={[
            { key: 'id', label: 'Transaction ID' },
            { key: 'documentCode', label: 'Văn bản' },
            { key: 'sender', label: 'Nơi gửi' },
            { key: 'receiver', label: 'Nơi nhận' },
            { key: 'status', label: 'Status', align: 'center' },
            { key: 'ack', label: 'ACK', align: 'center' },
            { key: 'retries', label: 'Retry', align: 'right' },
            { key: 'updatedAt', label: 'Cập nhật' },
            { key: 'actions', label: 'Thao tác', align: 'right' },
          ]}
          rows={transactionRows}
        />
        </Stack>
      </SectionCard>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Error Handling"
            subtitle="Kịch bản xử lý lỗi mẫu trong vận hành."
          >
            <Stack spacing={2}>
              {[
                'API Timeout: đẩy vào retry queue, tăng exponential backoff và cảnh báo sau lần 2.',
                'Signature Error: dừng retry, đánh dấu NACK và chuyển xử lý thủ công.',
                'Routing Error: chuyển DLQ, yêu cầu cập nhật rule route trước khi replay.',
              ].map((item) => (
                <Box key={item} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Transaction Control"
            subtitle="Chính sách đối soát giao dịch mục đích cho demo."
          >
            <Stack spacing={2}>
              {[
                'Message uniqueness theo messageId + senderCode + createdAt.',
                'ACK hợp lệ trong 30 giây, quá hạn sẽ được re-check.',
                'Replay cho phép với giao dịch FAILED đã được sửa cấu hình route.',
                'Thống kê SLA tính theo Received success rate và avg receive time.',
              ].map((item) => (
                <Box key={item} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Cập nhật giao dịch' : 'Tạo giao dịch mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID"
                disabled={Boolean(editingId)}
                value={formValues.id}
                onChange={(event) => setFormValues((prev) => ({ ...prev, id: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số ký hiệu văn bản"
                value={formValues.documentCode}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, documentCode: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nơi gửi"
                value={formValues.sender}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, sender: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nơi nhận"
                value={formValues.receiver}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, receiver: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Route"
                value={formValues.route}
                onChange={(event) => setFormValues((prev) => ({ ...prev, route: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Status"
                select
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    status: event.target.value as ExchangeTransaction['status'],
                  }))
                }
              >
                <MenuItem value="sent">sent</MenuItem>
                <MenuItem value="received">received</MenuItem>
                <MenuItem value="failed">failed</MenuItem>
                <MenuItem value="retrying">retrying</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ACK"
                select
                value={formValues.ack}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    ack: event.target.value as ExchangeTransaction['ack'],
                  }))
                }
              >
                <MenuItem value="ACK">ACK</MenuItem>
                <MenuItem value="NACK">NACK</MenuItem>
                <MenuItem value="WAITING">WAITING</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Số lần retry"
                value={formValues.retries}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    retries: Number(event.target.value),
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
