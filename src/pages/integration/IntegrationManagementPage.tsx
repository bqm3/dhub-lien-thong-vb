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
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  AgencyConnection,
  agencies,
} from '../../sections/interoperability/mockData';
import {
  DataTable,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';
import Iconify from '../../components/iconify';

const emptyAgencyForm: AgencyConnection = {
  code: '',
  name: '',
  level: '',
  clientId: '',
  apiKey: '',
  endpoint: '',
  credentialType: '',
  status: 'pending',
  successRate: 99,
  avgLatency: '3.0s',
};

const CREDENTIAL_TYPES = ['OAuth2', 'OAuth2 + mTLS', 'API Key + Signature', 'OAuth2 + Signature'];
const LEVELS = ['Tỉnh/Thành phố', 'Bộ/Ngành', 'Sở/Ban/Ngành', 'Cơ quan TW', 'Cơ quan địa phương'];

export default function IntegrationManagementPage() {
  const [agencyList, setAgencyList] = useState<AgencyConnection[]>(agencies);
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<AgencyConnection>(emptyAgencyForm);

  const filteredAgencies = useMemo(
    () =>
      agencyList.filter(
        (a) =>
          a.code.toLowerCase().includes(keyword.toLowerCase()) ||
          a.name.toLowerCase().includes(keyword.toLowerCase()) ||
          a.endpoint.toLowerCase().includes(keyword.toLowerCase())
      ),
    [agencyList, keyword]
  );

  const activeAgencies = agencyList.filter((a) => a.status === 'active');
  const pendingAgencies = agencyList.filter((a) => a.status === 'pending');
  const warningAgencies = agencyList.filter((a) => a.status === 'warning');

  // ── Tab 0: Đăng ký đơn vị ──
  const registryRows = filteredAgencies.map((a) => ({
    code: a.code,
    name: a.name,
    level: a.level,
    status: <StatusChip status={a.status} />,
    registeredAt: `01/0${Math.floor(Math.random() * 6) + 1}/2026`,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(a)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => handleDelete(a.code)}>Xóa</Button>
      </Stack>
    ),
  }));

  // ── Tab 1: Client ID ──
  const clientIdRows = filteredAgencies.map((a) => ({
    code: a.code,
    name: a.name,
    clientId: a.clientId,
    issuedAt: '01/01/2026',
    expiresAt: '31/12/2026',
    status: <StatusChip status={a.status} />,
    actions: (
      <Button size="small" variant="outlined">Cấp lại</Button>
    ),
  }));

  // ── Tab 2: API Key ──
  const apiKeyRows = filteredAgencies.map((a) => ({
    code: a.code,
    name: a.name,
    apiKey: a.apiKey,
    credentialType: a.credentialType,
    lastRotated: '15/06/2026',
    status: <StatusChip status={a.status} />,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" variant="outlined">Rotate</Button>
        <Button size="small" variant="outlined" color="warning">Revoke</Button>
      </Stack>
    ),
  }));

  // ── Tab 3: Endpoint ──
  const endpointRows = filteredAgencies.map((a) => ({
    name: a.name,
    endpoint: a.endpoint,
    successRate: `${a.successRate}%`,
    avgLatency: a.avgLatency,
    lastCheck: '02/07/2026 08:00',
    status: <StatusChip status={a.status} />,
    actions: (
      <Button size="small" variant="outlined">Test ping</Button>
    ),
  }));

  // ── Tab 4: Credential ──
  const credentialRows = filteredAgencies.map((a) => ({
    name: a.name,
    credentialType: a.credentialType,
    certFingerprint: `SHA256:${a.clientId.slice(-8).toUpperCase()}`,
    validUntil: '31/12/2026',
    status: <StatusChip status={a.status} />,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" variant="outlined">Gia hạn</Button>
        <Button size="small" variant="outlined" color="error">Thu hồi</Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyAgencyForm,
      clientId: `cli_new_2026_${String(agencyList.length + 1).padStart(3, '0')}`,
      apiKey: `ak_${Math.random().toString(36).slice(2, 6).toUpperCase()}***`,
    });
    setOpenDialog(true);
  }

  function handleEdit(agency: AgencyConnection) {
    setEditingCode(agency.code);
    setFormValues(agency);
    setOpenDialog(true);
  }

  function handleDelete(code: string) {
    setAgencyList((prev) => prev.filter((a) => a.code !== code));
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name || !formValues.endpoint) return;
    if (editingCode) {
      setAgencyList((prev) => prev.map((a) => (a.code === editingCode ? formValues : a)));
    } else {
      setAgencyList((prev) => [formValues, ...prev]);
    }
    setOpenDialog(false);
  }

  const tabConfig = [
    { label: 'Đăng ký đơn vị', icon: 'solar:user-plus-bold' },
    { label: 'Client ID', icon: 'solar:key-bold' },
    { label: 'API Key', icon: 'solar:lock-password-bold' },
    { label: 'Endpoint', icon: 'solar:global-bold' },
    { label: 'Credential', icon: 'solar:shield-check-bold' },
  ];

  return (
    <PageShell
      title="Integration Management"
      subtitle="Quản lý các đơn vị tham gia trục liên thông: đăng ký, cấp Client ID, API Key, cấu hình Endpoint và quản lý Credential."
    >
      {/* Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Đơn vị đã đăng ký"
            value={agencyList.length}
            helper={`${activeAgencies.length} active / ${pendingAgencies.length} pending / ${warningAgencies.length} warning`}
            icon="solar:user-plus-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Client ID đang hoạt động"
            value={activeAgencies.length}
            helper="Cấp theo agencyCode, không trùng lặp"
            icon="solar:key-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Endpoint đang giám sát"
            value={agencyList.length}
            helper="Kiểm tra health mỗi 5 phút"
            icon="solar:global-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Credential cần gia hạn"
            value={warningAgencies.length}
            helper="Sẽ hết hạn trong 14 ngày tới"
            icon="solar:shield-warning-bold"
          />
        </Grid>
      </Grid>

      {/* Summary cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SectionCard title="Cơ cấu đơn vị" subtitle="Phân loại theo cấp hành chính.">
            <Stack spacing={1.5}>
              {[
                { label: 'Tỉnh/Thành phố', count: agencyList.filter((a) => a.level === 'Tỉnh/Thành phố').length, color: 'primary' },
                { label: 'Bộ/Ngành', count: agencyList.filter((a) => a.level === 'Bộ/Ngành').length, color: 'info' },
                { label: 'Sở/Ban/Ngành', count: agencyList.filter((a) => a.level === 'Sở/Ban/Ngành').length, color: 'success' },
                { label: 'Cơ quan TW', count: agencyList.filter((a) => a.level === 'Cơ quan TW').length, color: 'warning' },
                { label: 'Cơ quan địa phương', count: agencyList.filter((a) => a.level === 'Cơ quan địa phương').length, color: 'default' },
              ].map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{row.label}</Typography>
                  <Chip label={row.count} size="small" color={row.color as any} variant="filled" />
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard title="Credential Policy" subtitle="Quy tắc vận hành bảo mật kết nối.">
            <Stack spacing={1.5}>
              {[
                'Client ID duy nhất theo agencyCode, không cấp lại trùng lặp.',
                'API Key hiển thị một phần, lưu trọn trên HSM/Secret Vault.',
                'Hỗ trợ OAuth2, mTLS và chữ ký số cho kênh nghiệp vụ.',
                'Cảnh báo trước 14 ngày khi certificate hoặc key sắp hết hạn.',
              ].map((item) => (
                <Box key={item} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard title="Trạng thái kết nối" subtitle="Tổng hợp theo trạng thái hiện tại.">
            <Stack spacing={1.5}>
              {[
                { label: 'Active — Kết nối ổn định', count: activeAgencies.length, color: '#22c55e' },
                { label: 'Warning — Cần kiểm tra', count: warningAgencies.length, color: '#f59e0b' },
                { label: 'Pending — Chờ kích hoạt', count: pendingAgencies.length, color: '#6b7280' },
              ].map((row) => (
                <Box key={row.label} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{row.label}</Typography>
                    <Typography variant="subtitle2" sx={{ color: row.color }}>{row.count}</Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Main tabs */}
      <SectionCard
        title="Quản lý kết nối"
        subtitle="Chọn nhóm chức năng để xem và thao tác."
        action={
          <Button variant="contained" startIcon={<Iconify icon="solar:user-plus-bold" />} onClick={handleOpenCreate}>
            Thêm đơn vị
          </Button>
        }
      >
        <Stack spacing={2}>
          <TextField
            size="small"
            label="Tìm kiếm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Mã đơn vị, tên, endpoint..."
            sx={{ maxWidth: 380 }}
          />
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            {tabConfig.map((t) => (
              <Tab key={t.label} label={t.label} icon={<Iconify icon={t.icon} width={18} />} iconPosition="start" />
            ))}
          </Tabs>

          {tab === 0 && (
            <DataTable
              columns={[
                { key: 'code', label: 'Mã đơn vị' },
                { key: 'name', label: 'Tên đơn vị' },
                { key: 'level', label: 'Cấp' },
                { key: 'registeredAt', label: 'Ngày đăng ký' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={registryRows}
            />
          )}
          {tab === 1 && (
            <DataTable
              columns={[
                { key: 'code', label: 'Mã đơn vị' },
                { key: 'name', label: 'Tên đơn vị' },
                { key: 'clientId', label: 'Client ID' },
                { key: 'issuedAt', label: 'Ngày cấp' },
                { key: 'expiresAt', label: 'Hết hạn' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={clientIdRows}
            />
          )}
          {tab === 2 && (
            <DataTable
              columns={[
                { key: 'code', label: 'Mã đơn vị' },
                { key: 'name', label: 'Tên đơn vị' },
                { key: 'apiKey', label: 'API Key' },
                { key: 'credentialType', label: 'Loại' },
                { key: 'lastRotated', label: 'Rotate lần cuối' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={apiKeyRows}
            />
          )}
          {tab === 3 && (
            <DataTable
              columns={[
                { key: 'name', label: 'Đơn vị' },
                { key: 'endpoint', label: 'Endpoint URL' },
                { key: 'successRate', label: 'Success Rate', align: 'right' },
                { key: 'avgLatency', label: 'Avg Latency', align: 'right' },
                { key: 'lastCheck', label: 'Kiểm tra lần cuối' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={endpointRows}
            />
          )}
          {tab === 4 && (
            <DataTable
              columns={[
                { key: 'name', label: 'Đơn vị' },
                { key: 'credentialType', label: 'Loại credential' },
                { key: 'certFingerprint', label: 'Cert Fingerprint' },
                { key: 'validUntil', label: 'Hiệu lực đến' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={credentialRows}
            />
          )}
        </Stack>
      </SectionCard>

      {/* Dialog thêm/sửa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingCode ? 'Cập nhật đơn vị kết nối' : 'Đăng ký đơn vị kết nối'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Mã đơn vị" value={formValues.code} disabled={Boolean(editingCode)}
              onChange={(e) => setFormValues((p) => ({ ...p, code: e.target.value }))} />
            <TextField label="Tên đơn vị" value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))} />
            <TextField label="Cấp đơn vị" select value={formValues.level}
              onChange={(e) => setFormValues((p) => ({ ...p, level: e.target.value }))}>
              {LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </TextField>
            <TextField label="Endpoint URL" value={formValues.endpoint}
              onChange={(e) => setFormValues((p) => ({ ...p, endpoint: e.target.value }))} />
            <TextField label="Loại Credential" select value={formValues.credentialType}
              onChange={(e) => setFormValues((p) => ({ ...p, credentialType: e.target.value }))}>
              {CREDENTIAL_TYPES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField label="Trạng thái" select value={formValues.status}
              onChange={(e) => setFormValues((p) => ({ ...p, status: e.target.value as AgencyConnection['status'] }))}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
