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
  AgencyConnection,
  agencies,
  integrationFunctions,
} from '../../sections/interoperability/mockData';
import {
  BulletList,
  DataTable,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';

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

export default function IntegrationManagementPage() {
  const [agencyList, setAgencyList] = useState<AgencyConnection[]>(agencies);
  const [keyword, setKeyword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<AgencyConnection>(emptyAgencyForm);

  const filteredAgencies = useMemo(
    () =>
      agencyList.filter(
        (agency) =>
          agency.code.toLowerCase().includes(keyword.toLowerCase()) ||
          agency.name.toLowerCase().includes(keyword.toLowerCase()) ||
          agency.endpoint.toLowerCase().includes(keyword.toLowerCase())
      ),
    [agencyList, keyword]
  );

  const agencyRows = filteredAgencies.map((agency) => ({
    code: agency.code,
    name: agency.name,
    clientId: agency.clientId,
    endpoint: agency.endpoint,
    credentialType: agency.credentialType,
    status: <StatusChip status={agency.status} />,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(agency)}>
          Sửa
        </Button>
        <Button size="small" color="error" onClick={() => handleDelete(agency.code)}>
          Xóa
        </Button>
      </Stack>
    ),
  }));

  const endpointRows = filteredAgencies.map((agency) => ({
    name: agency.name,
    endpoint: agency.endpoint,
    apiKey: agency.apiKey,
    successRate: `${agency.successRate}%`,
    avgLatency: agency.avgLatency,
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyAgencyForm,
      clientId: `cli_${Date.now()}`,
      apiKey: `ak_${Math.random().toString(36).slice(2, 8).toUpperCase()}***`,
    });
    setOpenDialog(true);
  }

  function handleEdit(agency: AgencyConnection) {
    setEditingCode(agency.code);
    setFormValues(agency);
    setOpenDialog(true);
  }

  function handleDelete(code: string) {
    setAgencyList((prev) => prev.filter((agency) => agency.code !== code));
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.name || !formValues.endpoint) return;

    if (editingCode) {
      setAgencyList((prev) =>
        prev.map((agency) => (agency.code === editingCode ? formValues : agency))
      );
    } else {
      setAgencyList((prev) => [formValues, ...prev]);
    }

    setOpenDialog(false);
  }

  return (
    <PageShell
      title="Integration Management"
      subtitle="Quản lý các hệ thống tham gia trục liên thông, từ đăng ký đơn vị, cấp credential, cấu hình endpoint đến theo dõi chất lượng kết nối."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Đơn vị đã đăng ký"
            value={agencyList.length}
            helper={`${agencyList.filter((item) => item.status === 'active').length} active / ${agencyList.filter((item) => item.status !== 'active').length} cần theo dõi`}
            icon="solar:user-plus-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Client ID đang hoạt động"
            value={agencyList.filter((item) => item.clientId).length}
            helper="Đồng bộ theo mã đơn vị"
            icon="solar:key-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Endpoint đang giám sát"
            value={agencyList.length}
            helper="1 endpoint / bản ghi demo"
            icon="solar:global-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Credential sắp hết hạn"
            value={agencyList.filter((item) => item.status === 'warning').length}
            helper="Bản ghi cảnh báo để mock theo dõi"
            icon="solar:shield-warning-bold"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={3}>
          <SectionCard
            title="Phạm vi chức năng"
            subtitle="Nhóm chức năng cốt lõi của module quản lý kết nối."
          >
            <BulletList items={integrationFunctions} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={9}>
          <SectionCard
            title="Danh sách đơn vị kết nối"
            subtitle="Danh sách có thao tác thêm, sửa, xóa và lọc nhanh theo mã, tên, endpoint."
            action={
              <Button variant="contained" onClick={handleOpenCreate}>
                Thêm đơn vị
              </Button>
            }
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Tìm kiếm đơn vị"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nhập mã, tên hoặc endpoint"
              />
            <DataTable
              columns={[
                { key: 'code', label: 'Mã đơn vị' },
                { key: 'name', label: 'Tên đơn vị' },
                { key: 'clientId', label: 'Client ID' },
                { key: 'endpoint', label: 'Endpoint' },
                { key: 'credentialType', label: 'Credential' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={agencyRows}
            />
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <SectionCard
            title="Endpoint Registry"
            subtitle="Quản lý endpoint dịch vụ, API key và chỉ số SLA để phục vụ monitoring."
          >
            <DataTable
              columns={[
                { key: 'name', label: 'Đơn vị' },
                { key: 'endpoint', label: 'Endpoint' },
                { key: 'apiKey', label: 'API Key' },
                { key: 'successRate', label: 'Success', align: 'right' },
                { key: 'avgLatency', label: 'Avg', align: 'right' },
              ]}
              rows={endpointRows}
            />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Credential Policy"
            subtitle="Quy tắc mẫu cho vận hành và bảo mật kết nối."
          >
            <Stack spacing={2}>
              {[
                'Client ID duy nhất theo agencyCode, không cấp lại trùng lặp.',
                'API Key hiển thị một phần, lưu trọn trên HSM/Secret Vault.',
                'Hỗ trợ OAuth2, mTLS và chữ ký số cho kênh nghiệp vụ.',
                'Cảnh báo trước 14 ngày khi certificate hoặc key sắp hết hạn.',
              ].map((item) => (
                <Box key={item} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingCode ? 'Cập nhật đơn vị kết nối' : 'Thêm đơn vị kết nối'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Mã đơn vị"
              value={formValues.code}
              disabled={Boolean(editingCode)}
              onChange={(event) => setFormValues((prev) => ({ ...prev, code: event.target.value }))}
            />
            <TextField
              label="Tên đơn vị"
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
            />
            <TextField
              label="Cấp đơn vị"
              value={formValues.level}
              onChange={(event) => setFormValues((prev) => ({ ...prev, level: event.target.value }))}
            />
            <TextField
              label="Endpoint"
              value={formValues.endpoint}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, endpoint: event.target.value }))
              }
            />
            <TextField
              label="Credential"
              select
              value={formValues.credentialType}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, credentialType: event.target.value }))
              }
            >
              <MenuItem value="OAuth2">OAuth2</MenuItem>
              <MenuItem value="OAuth2 + mTLS">OAuth2 + mTLS</MenuItem>
              <MenuItem value="API Key + Signature">API Key + Signature</MenuItem>
              <MenuItem value="OAuth2 + Signature">OAuth2 + Signature</MenuItem>
            </TextField>
            <TextField
              label="Trạng thái"
              select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  status: event.target.value as AgencyConnection['status'],
                }))
              }
            >
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="pending">pending</MenuItem>
              <MenuItem value="warning">warning</MenuItem>
            </TextField>
          </Stack>
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
