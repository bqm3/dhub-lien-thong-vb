import { Box, Grid, Stack, Typography } from '@mui/material';
import {
  deliveryStatusSummary,
  errorSummary,
  overviewMetrics,
  reportCatalog,
  reportHighlights,
  retrySummary,
  topAgencies,
} from '../../sections/interoperability/mockData';
import {
  DataTable,
  MetricCard,
  PageShell,
  ProgressList,
  SectionCard,
} from '../../sections/interoperability/components';

export default function ReportingPage() {
  const documentReportRows = [
    { date: '19/05', sender: 'UBND Hà Nội', quantity: '2,500' },
    { date: '20/05', sender: 'Bộ X', quantity: '1,800' },
  ];

  const incomingRows = [
    { receiver: 'Sở Nội Vụ', quantity: '3,200' },
    { receiver: 'Sở TTTT', quantity: '2,900' },
  ];

  const deliveryRows = deliveryStatusSummary.map((item) => ({
    status: item.label,
    count: item.value.toLocaleString('en-US'),
  }));

  return (
    <PageShell
      title="Reporting Center"
      subtitle="Trung tâm báo cáo thống kê cho lãnh đạo và vận hành, tổng hợp document, giao dịch, lỗi, retry, đơn vị và khả năng export Excel/PDF."
    >
      <Grid container spacing={3}>
        {overviewMetrics.slice(0, 6).map((metric, index) => (
          <Grid key={metric.label} item xs={12} sm={6} lg={4}>
            <MetricCard
              label={metric.label}
              value={metric.value}
              helper={metric.helper}
              icon={[
                'solar:chart-2-bold',
                'solar:diagram-up-bold',
                'solar:chart-square-bold',
                'solar:users-group-rounded-bold',
                'solar:verified-check-bold',
                'solar:bug-bold',
              ][index]}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Report Catalog"
            subtitle="10 nhóm báo cáo mẫu theo mô tả nghiệp vụ."
          >
            <Stack spacing={1.5}>
              {reportCatalog.map((report, index) => (
                <Box key={report} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2">
                    {index + 1}. {report}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Theo loại văn bản"
            subtitle="Tỷ trọng mẫu theo cơ cấu document."
          >
            <ProgressList items={reportHighlights} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Daily System Report"
            subtitle="Ngay: 25/06/2026"
          >
            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2">Document: AAAA</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sent: 20,500 | Received: 20,400 | Success: 99.5% | Error: 100 | SLA: 99.8%
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2">Export formats</Typography>
                <Typography variant="body2" color="text.secondary">
                  Hỗ trợ Excel, PDF và API export để tích hợp với hệ thống BI bên ngoài.
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Báo cáo văn bản"
            subtitle="Thống kê theo ngày và đơn vị gửi."
          >
            <DataTable
              columns={[
                { key: 'date', label: 'Ngày' },
                { key: 'sender', label: 'Đơn vị gửi' },
                { key: 'quantity', label: 'Số lượng', align: 'right' },
              ]}
              rows={documentReportRows}
            />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Báo cáo văn bản nhận vào"
            subtitle="Thống kê theo đơn vị nhận."
          >
            <DataTable
              columns={[
                { key: 'receiver', label: 'Đơn vị nhận' },
                { key: 'quantity', label: 'Số lượng', align: 'right' },
              ]}
              rows={incomingRows}
            />
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Delivery Report"
            subtitle="Tổng hợp theo trạng thái giao nhận."
          >
            <DataTable
              columns={[
                { key: 'status', label: 'Status' },
                { key: 'count', label: 'Count', align: 'right' },
              ]}
              rows={deliveryRows}
            />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Error Report"
            subtitle="Tổng lỗi: 500"
          >
            <ProgressList
              items={errorSummary.map((item) => ({
                label: item.label,
                value: Math.round((item.value / 500) * 100),
              }))}
            />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Retry Report"
            subtitle="Thống kê theo lần retry."
          >
            <ProgressList
              items={retrySummary.map((item) => ({
                label: item.label,
                value: Math.round((item.value / 700) * 100),
              }))}
            />
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard
            title="Agency Report"
            subtitle="Top sender, top receiver và SLA mẫu theo đơn vị."
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    Top Sender
                  </Typography>
                  <Stack spacing={1}>
                    {topAgencies.senders.map((item, index) => (
                      <Typography key={item} variant="body2">
                        {index + 1}. {item}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    Top Receiver
                  </Typography>
                  <Stack spacing={1}>
                    {topAgencies.receivers.map((item, index) => (
                      <Typography key={item} variant="body2">
                        {index + 1}. {item}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    Agency SLA
                  </Typography>
                  <Typography variant="body2">{topAgencies.sla}</Typography>
                </Box>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
