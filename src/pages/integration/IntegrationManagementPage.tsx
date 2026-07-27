import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
  Chip,
  Grid
} from '@mui/material';
import {
  AgencyConnection,
  agencies,
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
  const [detailAgency, setDetailAgency] = useState<AgencyConnection | null>(null);
  const [detailTab, setDetailTab] = useState(0);
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
        <Button size="small" variant="outlined" onClick={() => handleOpenDetail(a)}>Sửa</Button>
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
      clientId: `cli_new_2026_${String(agencyList.length + 1).length < 3 ? `00${agencyList.length + 1}`.slice(-3) : String(agencyList.length + 1)}`,
      apiKey: `ak_${Math.random().toString(36).slice(2, 6).toUpperCase()}***`,
    });
    setOpenDialog(true);
  }

  function handleOpenDetail(agency: AgencyConnection) {
    setDetailAgency(agency);
    setFormValues(agency);
    setEditingCode(agency.code);
    setDetailTab(0);
  }

  function handleDelete(code: string) {
    setAgencyList((prev) => prev.filter((a) => a.code !== code));
    if (detailAgency?.code === code) setDetailAgency(null);
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name || !formValues.endpoint) return;
    if (editingCode) {
      setAgencyList((prev) => prev.map((a) => (a.code === editingCode ? formValues : a)));
      setDetailAgency(formValues);
    } else {
      setAgencyList((prev) => [formValues, ...prev]);
    }
    setOpenDialog(false);
  }

  function handleSaveDetail() {
    if (!formValues.code || !formValues.name || !formValues.endpoint || !detailAgency) return;
    setAgencyList((prev) => prev.map((a) => (a.code === detailAgency.code ? formValues : a)));
    setDetailAgency(formValues);
  }

  function DetailField({ label, value }: { label: string; value: ReactNode }) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral', height: '100%' }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2" sx={{ wordBreak: 'break-all' }}>{value}</Typography>
      </Box>
    );
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
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Đơn vị đã đăng ký"
          value={agencyList.length}
          helper={`${activeAgencies.length} active / ${pendingAgencies.length} pending / ${warningAgencies.length} warning`}
          icon="solar:user-plus-bold"
        />
        <MetricCard
          label="Client ID đang hoạt động"
          value={activeAgencies.length}
          helper="Cấp theo agencyCode, không trùng lặp"
          icon="solar:key-bold"
        />
        <MetricCard
          label="Endpoint đang giám sát"
          value={agencyList.length}
          helper="Kiểm tra health mỗi 5 phút"
          icon="solar:global-bold"
        />
        <MetricCard
          label="Credential cần gia hạn"
          value={warningAgencies.length}
          helper="Sẽ hết hạn trong 14 ngày tới"
          icon="solar:shield-warning-bold"
        />
      </GridRow>

      {/* Summary cards */}
      <GridRow cols={{ xs: 1, md: 3 }}>
        <Box>
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
        </Box>
        <Box>
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
        </Box>
        <Box>
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
        </Box>
      </GridRow>

      {/* Main tabs */}
      <SectionCard
        title="Quản lý kết nối"
        subtitle="Chọn nhóm chức năng để xem và thao tác."
        // action={
        //   <Button variant="contained" startIcon={<Iconify icon="solar:user-plus-bold" />} onClick={handleOpenCreate}>
        //     Thêm đơn vị
        //   </Button>
        // }
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

      {/* Dialog thêm đơn vị */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Đăng ký đơn vị kết nối</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Mã đơn vị" value={formValues.code}
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

      {/* Dialog chi tiết / sửa đơn vị */}
      <Dialog open={Boolean(detailAgency)} onClose={() => setDetailAgency(null)} fullWidth maxWidth="md">
        {detailAgency && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography variant="h6">{formValues.name || detailAgency.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{formValues.code || detailAgency.code}</Typography>
                </Box>
                <StatusChip status={formValues.status} />
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 1 }}>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
                <Tab label="Tổng quan" />
                <Tab label="Client ID" />
                <Tab label="API Key" />
                <Tab label="Endpoint" />
                <Tab label="Credential" />
                <Tab label="Chỉnh sửa" />
              </Tabs>

              {detailTab === 0 && (
                <Grid container spacing={2}>
                  {[
                    { label: 'Mã đơn vị', value: formValues.code },
                    { label: 'Tên đơn vị', value: formValues.name },
                    { label: 'Cấp', value: formValues.level || '—' },
                    { label: 'Trạng thái', value: formValues.status },
                    { label: 'Client ID', value: formValues.clientId },
                    { label: 'API Key', value: formValues.apiKey },
                    { label: 'Endpoint', value: formValues.endpoint },
                    { label: 'Loại Credential', value: formValues.credentialType || '—' },
                    { label: 'Success Rate', value: `${formValues.successRate}%` },
                    { label: 'Avg Latency', value: formValues.avgLatency },
                  ].map((row) => (
                    <Grid key={row.label} item xs={12} sm={6}>
                      <DetailField label={row.label} value={row.value} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {detailTab === 1 && (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><DetailField label="Client ID" value={formValues.clientId} /></Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Ngày cấp" value="01/01/2026" /></Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Hết hạn" value="31/12/2026" /></Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Trạng thái" value={<StatusChip status={formValues.status} />} /></Grid>
                  </Grid>
                  <AlertInfo text="Client ID duy nhất theo agencyCode. Không cấp trùng; dùng để xác thực OAuth/JWT khi gọi API liên thông." />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setFormValues((p) => ({
                          ...p,
                          clientId: `cli_${p.code.toLowerCase()}_${Date.now().toString().slice(-4)}`,
                        }))
                      }
                    >
                      Cấp lại Client ID
                    </Button>
                  </Stack>
                </Stack>
              )}

              {detailTab === 2 && (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><DetailField label="API Key" value={formValues.apiKey} /></Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Loại Credential" value={formValues.credentialType || '—'} /></Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Rotate lần cuối" value="15/06/2026" /></Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Trạng thái" value={<StatusChip status={formValues.status} />} /></Grid>
                  </Grid>
                  <AlertInfo text="API Key chỉ hiển thị một phần trên UI. Rotate định kỳ; revoke ngay khi nghi ngờ lộ khóa." />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setFormValues((p) => ({
                          ...p,
                          apiKey: `ak_${Math.random().toString(36).slice(2, 6).toUpperCase()}***`,
                        }))
                      }
                    >
                      Rotate API Key
                    </Button>
                    <Button variant="outlined" color="warning" onClick={() => setFormValues((p) => ({ ...p, status: 'warning' }))}>
                      Revoke
                    </Button>
                  </Stack>
                </Stack>
              )}

              {detailTab === 3 && (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><DetailField label="Endpoint URL" value={formValues.endpoint} /></Grid>
                    <Grid item xs={12} sm={4}><DetailField label="Success Rate" value={`${formValues.successRate}%`} /></Grid>
                    <Grid item xs={12} sm={4}><DetailField label="Avg Latency" value={formValues.avgLatency} /></Grid>
                    <Grid item xs={12} sm={4}><DetailField label="Kiểm tra lần cuối" value="02/07/2026 08:00" /></Grid>
                  </Grid>
                  <AlertInfo text="Endpoint dùng để nhận văn bản / webhook ACK-Status. Health check định kỳ mỗi 5 phút." />
                  <Button variant="outlined" sx={{ alignSelf: 'flex-start' }}>Test ping</Button>
                </Stack>
              )}

              {detailTab === 4 && (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><DetailField label="Loại Credential" value={formValues.credentialType || '—'} /></Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailField
                        label="Cert Fingerprint"
                        value={`SHA256:${(formValues.clientId || 'XXXXXXXX').slice(-8).toUpperCase()}`}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Hiệu lực đến" value="31/12/2026" /></Grid>
                    <Grid item xs={12} sm={6}><DetailField label="Trạng thái" value={<StatusChip status={formValues.status} />} /></Grid>
                  </Grid>
                  <AlertInfo text="Hỗ trợ OAuth2, mTLS và chữ ký số. Cảnh báo trước 14 ngày khi certificate/key sắp hết hạn." />
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined">Gia hạn</Button>
                    <Button variant="outlined" color="error" onClick={() => setFormValues((p) => ({ ...p, status: 'warning' }))}>
                      Thu hồi
                    </Button>
                  </Stack>
                </Stack>
              )}

              {detailTab === 5 && (
                <Stack spacing={2}>
                  <TextField label="Mã đơn vị" value={formValues.code} disabled />
                  <TextField label="Tên đơn vị" value={formValues.name}
                    onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))} />
                  <TextField label="Cấp đơn vị" select value={formValues.level}
                    onChange={(e) => setFormValues((p) => ({ ...p, level: e.target.value }))}>
                    {LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </TextField>
                  <TextField label="Client ID" value={formValues.clientId}
                    onChange={(e) => setFormValues((p) => ({ ...p, clientId: e.target.value }))} />
                  <TextField label="API Key" value={formValues.apiKey}
                    onChange={(e) => setFormValues((p) => ({ ...p, apiKey: e.target.value }))} />
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
                  <TextField
                    label="Success Rate (%)"
                    type="number"
                    value={formValues.successRate}
                    onChange={(e) => setFormValues((p) => ({ ...p, successRate: Number(e.target.value) || 0 }))}
                  />
                  <TextField label="Avg Latency" value={formValues.avgLatency}
                    onChange={(e) => setFormValues((p) => ({ ...p, avgLatency: e.target.value }))} />
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailAgency(null)}>Đóng</Button>
              {(detailTab === 5 || detailTab === 1 || detailTab === 2) && (
                <Button variant="contained" onClick={handleSaveDetail}>Lưu thay đổi</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageShell>
  );
}

function AlertInfo({ text }: { text: string }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Box>
  );
}
