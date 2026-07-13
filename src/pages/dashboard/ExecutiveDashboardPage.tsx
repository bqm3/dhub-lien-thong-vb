import { Box, Grid, Stack, Typography } from '@mui/material';
import type { ComponentType } from 'react';
import * as Recharts from 'recharts';
import {
  agencies,
  documents,
  exchangeTransactions,
} from '../../sections/interoperability/mockData';
import {
  MetricCard,
  PageShell,
  SectionCard,
} from '../../sections/interoperability/components';
import { useAuthContext } from '../../auth/useAuthContext';

export default function ExecutiveDashboardPage() {
  const { user } = useAuthContext();

  // Recharts typings can be incompatible with TS 4.x in some setups (JSX return type),
  // so we cast once here to keep the dashboard buildable.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ResponsiveContainerBox = (Recharts as any).ResponsiveContainer as unknown as ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LineChart = (Recharts as any).LineChart as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Line = (Recharts as any).Line as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CartesianGrid = (Recharts as any).CartesianGrid as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XAxis = (Recharts as any).XAxis as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const YAxis = (Recharts as any).YAxis as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tooltip = (Recharts as any).Tooltip as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieChart = (Recharts as any).PieChart as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Pie = (Recharts as any).Pie as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BarChart = (Recharts as any).BarChart as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Bar = (Recharts as any).Bar as any;

  const isAdmin = user?.role === 'ADMIN';
  const scopedAgencies = isAdmin ? agencies : agencies.filter((agency) => agency.code === user?.agencyCode);

  const scopedAgencyNames = new Set(scopedAgencies.map((agency) => agency.name));
  const scopedDocuments = isAdmin
    ? documents
    : documents.filter((doc) => scopedAgencyNames.has(doc.sender) || scopedAgencyNames.has(doc.receiver));
  const scopedTransactions = isAdmin
    ? exchangeTransactions
    : exchangeTransactions.filter(
        (tx) => scopedAgencyNames.has(tx.sender) || scopedAgencyNames.has(tx.receiver) || tx.route.includes(user?.agencyCode)
      );

  const overviewMetrics = [
    {
      label: isAdmin ? 'Đơn vị tham gia' : 'Đơn vị',
      value: isAdmin ? String(agencies.length) : String(scopedAgencies.length),
      helper: isAdmin ? 'Tổng hợp toàn hệ thống' : `Phạm vi: ${scopedAgencies[0]?.name ?? 'Chưa gán đơn vị'}`,
    },
    {
      label: 'Văn bản',
      value: String(scopedDocuments.length),
      helper: isAdmin ? 'Tổng văn bản trong demo' : 'Văn bản thuộc đơn vị của bạn',
    },
    {
      label: 'Giao dịch',
      value: String(scopedTransactions.length),
      helper: isAdmin ? 'Tổng giao dịch trong demo' : 'Giao dịch thuộc đơn vị của bạn',
    },
  ];

  const statusDistribution = [
    { name: 'Received', value: scopedTransactions.filter((t) => t.status === 'received').length },
    { name: 'Sent', value: scopedTransactions.filter((t) => t.status === 'sent').length },
    { name: 'Retrying', value: scopedTransactions.filter((t) => t.status === 'retrying').length },
    { name: 'Failed', value: scopedTransactions.filter((t) => t.status === 'failed').length },
  ].filter((x) => x.value > 0);

  const ackDistribution = [
    { name: 'ACK', value: scopedTransactions.filter((t) => t.ack === 'ACK').length },
    { name: 'WAITING', value: scopedTransactions.filter((t) => t.ack === 'WAITING').length },
    { name: 'NACK', value: scopedTransactions.filter((t) => t.ack === 'NACK').length },
  ].filter((x) => x.value > 0);

  const agencySuccess = scopedAgencies.map((a) => ({ name: a.name, successRate: a.successRate, latency: Number(a.avgLatency.replace('s', '')) }));

  const trendData = [
    { day: 'T2', tx: Math.max(1, Math.round(scopedTransactions.length * 0.12)), docs: Math.max(1, Math.round(scopedDocuments.length * 0.08)) },
    { day: 'T3', tx: Math.max(1, Math.round(scopedTransactions.length * 0.14)), docs: Math.max(1, Math.round(scopedDocuments.length * 0.1)) },
    { day: 'T4', tx: Math.max(1, Math.round(scopedTransactions.length * 0.16)), docs: Math.max(1, Math.round(scopedDocuments.length * 0.11)) },
    { day: 'T5', tx: Math.max(1, Math.round(scopedTransactions.length * 0.18)), docs: Math.max(1, Math.round(scopedDocuments.length * 0.12)) },
    { day: 'T6', tx: Math.max(1, Math.round(scopedTransactions.length * 0.2)), docs: Math.max(1, Math.round(scopedDocuments.length * 0.14)) },
    { day: 'T7', tx: Math.max(1, Math.round(scopedTransactions.length * 0.1)), docs: Math.max(1, Math.round(scopedDocuments.length * 0.09)) },
    { day: 'CN', tx: Math.max(1, Math.round(scopedTransactions.length * 0.1)), docs: Math.max(1, Math.round(scopedDocuments.length * 0.08)) },
  ];

  return (
    <PageShell
      title={isAdmin ? 'Executive Dashboard' : 'Dashboard đơn vị'}
      subtitle={
        isAdmin
          ? 'Bảng điều khiển tổng quan cho lãnh đạo và vận hành, theo dõi quy mô hệ thống, sức khỏe giao dịch và mức độ sẵn sàng của các đơn vị kết nối.'
          : 'Bảng điều khiển theo phạm vi đơn vị: theo dõi văn bản, giao dịch và trạng thái liên thông của đơn vị bạn.'
      }
    >
      <Grid container spacing={3}>
        {overviewMetrics.map((metric, index) => (
          <Grid key={metric.label} item xs={12} sm={6} lg={4}>
            <MetricCard
              label={metric.label}
              value={metric.value}
              helper={metric.helper}
              icon={[
                'solar:document-text-bold',
                'solar:transfer-horizontal-bold',
                'solar:folder-with-files-bold',
                'solar:buildings-3-bold',
                'solar:shield-check-bold',
                'solar:danger-triangle-bold',
              ][index]}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <SectionCard
            title="Xu hướng 7 ngày"
            subtitle="Giao dịch và văn bản (dữ liệu demo). Khi có BE sẽ map theo ngày/giờ thực."
          >
            <Box sx={{ height: 320 }}>
              <ResponsiveContainerBox width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tx" name="Giao dịch" stroke="#1E88E5" strokeWidth={2} />
                  <Line type="monotone" dataKey="docs" name="Văn bản" stroke="#43A047" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainerBox>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard title="Phân bố trạng thái" subtitle="Tỷ lệ status + ACK/NACK trong phạm vi xem">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ height: 160 }}>
                  <ResponsiveContainerBox width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Pie data={statusDistribution} dataKey="value" nameKey="name" outerRadius={60} />
                    </PieChart>
                  </ResponsiveContainerBox>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: 160 }}>
                  <ResponsiveContainerBox width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Pie data={ackDistribution} dataKey="value" nameKey="name" outerRadius={60} />
                    </PieChart>
                  </ResponsiveContainerBox>
                </Box>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <SectionCard title="SLA theo đơn vị" subtitle="Success rate mẫu theo đơn vị trong phạm vi xem">
            <Box sx={{ height: 280 }}>
              <ResponsiveContainerBox width="100%" height="100%">
                <BarChart data={agencySuccess} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="successRate" name="Success %" fill="#1565C0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainerBox>
            </Box>
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={7}>
          <SectionCard title="Độ trễ trung bình" subtitle="Latency (s) mẫu theo đơn vị">
            <Box sx={{ height: 280 }}>
              <ResponsiveContainerBox width="100%" height="100%">
                <BarChart data={agencySuccess} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="latency" name="Latency (s)" fill="#6A1B9A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainerBox>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
