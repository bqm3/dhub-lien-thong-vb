import { Grid, Stack, Typography } from '@mui/material';
import {
  apiEndpoints,
  sampleAgencyRequest,
  sampleDocumentRequest,
  sampleExchangeResponse,
} from '../../sections/interoperability/mockData';
import {
  CodeBlock,
  DataTable,
  PageShell,
  SectionCard,
} from '../../sections/interoperability/components';

export default function SampleApiPage() {
  const endpointRows = apiEndpoints.map((endpoint) => ({
    method: endpoint.method,
    path: endpoint.path,
    auth: endpoint.auth,
    description: endpoint.description,
  }));

  return (
    <PageShell
      title="Sample API Center"
      subtitle="Tập hợp endpoint, payload và response mẫu để đội front-end/back-end có thể dùng ngay khi demo, mock API hoặc chuyển sang kết nối thật."
    >
      <SectionCard
        title="Danh sách API mẫu"
        subtitle="Tập endpoint theo 4 module: integration, document, exchange và reporting."
      >
        <DataTable
          columns={[
            { key: 'method', label: 'Method', align: 'center' },
            { key: 'path', label: 'Path' },
            { key: 'auth', label: 'Auth' },
            { key: 'description', label: 'Description' },
          ]}
          rows={endpointRows}
        />
      </SectionCard>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Sample Request: Register Agency"
            subtitle="Payload demo cho chức năng đăng ký đơn vị kết nối."
          >
            <CodeBlock code={sampleAgencyRequest} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Sample Request: Create Document"
            subtitle="Payload demo cho Document Registry + Attachment Management."
          >
            <CodeBlock code={sampleDocumentRequest} />
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Sample Response: Exchange ACK"
            subtitle="Response demo sau khi giao dịch được tiếp nhận và xác nhận."
          >
            <CodeBlock code={sampleExchangeResponse} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Hướng tích hợp"
            subtitle="Checklist để chuyển từ mock sang API thật."
          >
            <Stack spacing={2}>
              {[
                'Chuẩn hóa agencyCode, documentCode, transactionId theo một convention duy nhất.',
                'Khai báo lớp service axios cho integrations, documents, exchange, reports.',
                'Thay mock data bằng response mapping và bổ sung loading/error state.',
                'Nối export report với endpoint trả file blob cho Excel/PDF.',
              ].map((item) => (
                <Typography key={item} variant="body2">
                  {item}
                </Typography>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}
