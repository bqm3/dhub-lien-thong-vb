import type { ComponentType } from 'react';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import * as Recharts from 'recharts';
import Iconify from '../../components/iconify';
import { PATH_DASHBOARD } from '../../routes/paths';
import { DataTable, MetricCard, PageShell, SectionCard } from '../../sections/interoperability/components';
import { reportOrder, reportingData, ReportSectionKey } from './reportingData';

type ReportSectionPageProps = { section: ReportSectionKey };

const paths: Record<ReportSectionKey, string> = {
  executive: PATH_DASHBOARD.operations.reporting.executive,
  document: PATH_DASHBOARD.operations.reporting.document,
  incoming: PATH_DASHBOARD.operations.reporting.incoming,
  type: PATH_DASHBOARD.operations.reporting.type,
  delivery: PATH_DASHBOARD.operations.reporting.delivery,
  error: PATH_DASHBOARD.operations.reporting.error,
  retry: PATH_DASHBOARD.operations.reporting.retry,
  agency: PATH_DASHBOARD.operations.reporting.agency,
  daily: PATH_DASHBOARD.operations.reporting.daily,
  export: PATH_DASHBOARD.operations.reporting.export,
};

const pieColors = ['#1976D2', '#2EAD6B', '#F59E0B', '#E34D59', '#7C4DFF', '#00A6C8'];

// Recharts 3 uses newer JSX typings than TypeScript 4 in this project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Chart = Recharts as any;
const ResponsiveContainer = Chart.ResponsiveContainer as unknown as ComponentType<any>;
const tooltipStyle = { borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' };

function TrendChart({ data, series }: { data: Record<string, string | number>[]; series: { key: string; name: string; color: string }[] }) {
  return (
    <Box sx={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart.AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>{series.map((item) => <linearGradient key={item.key} id={`gradient-${item.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={item.color} stopOpacity={0.28} /><stop offset="95%" stopColor={item.color} stopOpacity={0.02} /></linearGradient>)}</defs>
          <Chart.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <Chart.XAxis dataKey="label" axisLine={false} tickLine={false} />
          <Chart.YAxis axisLine={false} tickLine={false} width={54} />
          <Chart.Tooltip contentStyle={tooltipStyle} />
          <Chart.Legend />
          {series.map((item) => <Chart.Area key={item.key} type="monotone" dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={2.5} fill={`url(#gradient-${item.key})`} />)}
        </Chart.AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

function BreakdownChart({ data, series }: { data: Record<string, string | number>[]; series: { key: string; name: string; color: string }[] }) {
  return (
    <Box sx={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart.BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
          <Chart.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <Chart.XAxis dataKey="label" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 12 }} />
          <Chart.YAxis axisLine={false} tickLine={false} width={54} />
          <Chart.Tooltip contentStyle={tooltipStyle} />
          <Chart.Legend />
          {series.map((item) => <Chart.Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[6, 6, 0, 0]} maxBarSize={36} />)}
        </Chart.BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function DistributionChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Stack spacing={1.5}>
      <Box sx={{ height: 245, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%"><Chart.PieChart><Chart.Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString('vi-VN')} /><Chart.Pie data={data} dataKey="value" nameKey="name" innerRadius={68} outerRadius={98} paddingAngle={2}>{data.map((item, index) => <Chart.Cell key={item.name} fill={pieColors[index % pieColors.length]} />)}</Chart.Pie></Chart.PieChart></ResponsiveContainer>
        <Stack sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} alignItems="center" justifyContent="center" spacing={0}><Typography variant="h5">{total.toLocaleString('vi-VN')}</Typography><Typography variant="caption" color="text.secondary">Tổng số</Typography></Stack>
      </Box>
      <Grid container spacing={1}>{data.map((item, index) => <Grid item xs={6} key={item.name}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: pieColors[index % pieColors.length], flexShrink: 0 }} /><Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary" noWrap>{item.name}</Typography><Typography variant="subtitle2">{item.value.toLocaleString('vi-VN')} <Typography component="span" variant="caption" color="text.secondary">({((item.value / total) * 100).toFixed(1)}%)</Typography></Typography></Box></Stack></Grid>)}</Grid>
    </Stack>
  );
}

export default function ReportSectionPage({ section }: ReportSectionPageProps) {
  const config = reportingData[section];
  return (
    <PageShell title={config.title} subtitle={config.subtitle}>
      <SectionCard title="Danh mục báo cáo" subtitle="Chuyển nhanh giữa các báo cáo nghiệp vụ."><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{reportOrder.map((item, index) => <Button key={item.key} component={RouterLink} to={paths[item.key]} variant={item.key === section ? 'contained' : 'outlined'} size="small">{index + 1}. {item.label}</Button>)}</Stack></SectionCard>

      <Grid container spacing={3}>{config.metrics.map((metric) => <Grid key={metric.label} item xs={12} sm={6} lg={3} gap={1}><MetricCard label={metric.label} value={metric.value} helper={metric.helper} icon={metric.icon} /></Grid>)}</Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}><SectionCard title={config.trendTitle} subtitle={config.trendSubtitle}><TrendChart data={config.trendData} series={config.trendSeries} /></SectionCard></Grid>
        <Grid item xs={12} lg={4}><SectionCard title={config.distributionTitle} subtitle={config.distributionSubtitle}><DistributionChart data={config.distributionData} /></SectionCard></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}><SectionCard title={config.breakdownTitle} subtitle={config.breakdownSubtitle}><BreakdownChart data={config.breakdownData} series={config.breakdownSeries} /></SectionCard></Grid>
        <Grid item xs={12} lg={4}><SectionCard title="Nhận định nổi bật" subtitle="Gợi ý nhanh từ dữ liệu mô phỏng trong kỳ."><Stack spacing={2}>{config.insights.map((insight, index) => <Stack key={insight} direction="row" spacing={1.5} alignItems="flex-start"><Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: index === 0 ? 'primary.lighter' : 'background.neutral', color: index === 0 ? 'primary.main' : 'text.secondary' }}><Iconify icon={index === 0 ? 'solar:lightbulb-bold' : 'solar:check-circle-bold'} width={18} /></Box><Typography variant="body2" sx={{ pt: 0.5 }}>{insight}</Typography></Stack>)}{section === 'export' && <Stack spacing={1.25} sx={{ pt: 1 }}><Button variant="contained" startIcon={<Iconify icon="solar:download-bold" />}>Xuất Excel</Button><Button variant="outlined" startIcon={<Iconify icon="solar:file-text-bold" />}>Xuất PDF</Button><Button variant="outlined" startIcon={<Iconify icon="solar:code-bold" />}>Tạo dữ liệu JSON</Button></Stack>}</Stack></SectionCard></Grid>
      </Grid>

      <SectionCard title={config.tableTitle} subtitle={config.tableSubtitle}><Box sx={{ overflowX: 'auto' }}><DataTable columns={config.columns} rows={config.rows} /></Box></SectionCard>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', pb: 1 }}>Dữ liệu trên trang là dữ liệu mô phỏng phục vụ trình diễn giao diện, không phải số liệu vận hành thực tế.</Typography>
    </PageShell>
  );
}
