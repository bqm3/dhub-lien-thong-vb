import { ChangeEvent, useMemo, useState } from 'react';
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
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  DocumentRecord,
  documentLifecycle,
  documents,
} from '../../sections/interoperability/mockData';
import {
  DataTable,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';
import Iconify from '../../components/iconify';
import SignatureStudio from '../../sections/workflow/components/SignatureStudio';

type ManagedDocumentRecord = DocumentRecord & {
  attachments: string[];
  signProvider: string;
  signStatus: string;
  signedPositions: number;
};

const emptyDocumentForm: ManagedDocumentRecord = {
  code: '',
  title: '',
  type: 'CONG_VAN',
  sender: '',
  receiver: '',
  version: 'v1',
  classification: 'Thường',
  status: 'Đang xử lý',
  createdAt: '02/07/2026 09:00',
  attachments: [],
  signProvider: 'USB Token / HSM',
  signStatus: 'Chưa ký',
  signedPositions: 0,
};

const DOC_TYPES = ['', 'CONG_VAN', 'QUYET_DINH', 'BAO_CAO', 'THONG_BAO', 'KE_HOACH', 'BIEN_NHAN'];

const initialDocuments: ManagedDocumentRecord[] = documents.map((doc, index) => ({
  ...doc,
  attachments: [
    `${doc.code.toLowerCase()}.pdf`,
    `phu-luc-${index + 1}.docx`,
  ],
  signProvider: index % 3 === 0 ? 'VNPT SmartCA' : 'USB Token / HSM',
  signStatus: doc.status === 'Đã phát hành' ? 'Đã ký số' : index % 2 === 0 ? 'Đang chờ ký' : 'Chưa ký',
  signedPositions: doc.status === 'Đã phát hành' ? 2 : index % 2 === 0 ? 1 : 0,
}));

function fakeVersions(doc: ManagedDocumentRecord) {
  const n = parseInt(doc.version.replace('v', ''), 10);
  return Array.from({ length: n }, (_, i) => ({
    version: `v${i + 1}`,
    changedBy: i === 0 ? doc.sender : 'Hệ thống',
    changedAt: doc.createdAt,
    note: i === 0 ? 'Tạo mới' : `Cập nhật lần ${i}`,
  }));
}

function fakeAudit(doc: ManagedDocumentRecord) {
  return [
    { action: 'Tạo mới', actor: doc.sender, time: doc.createdAt, detail: `Khởi tạo văn bản ${doc.code}` },
    { action: 'Tải tệp', actor: doc.sender, time: doc.createdAt, detail: `${doc.attachments.length} tệp đính kèm đã được thêm vào hồ sơ` },
    {
      action: 'Ký số',
      actor: doc.sender,
      time: doc.createdAt,
      detail: `${doc.signStatus} qua ${doc.signProvider}`,
    },
    { action: 'Phát hành', actor: doc.sender, time: doc.createdAt, detail: `Chuyển trạng thái sang ${doc.status}` },
    { action: 'Gửi liên thông', actor: 'Hệ thống', time: doc.createdAt, detail: `Điểm đến ${doc.receiver}` },
  ];
}

export default function DocumentManagementPage() {
  const [documentList, setDocumentList] = useState<ManagedDocumentRecord[]>(initialDocuments);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openSignDialog, setOpenSignDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ManagedDocumentRecord>(emptyDocumentForm);
  const [detailDoc, setDetailDoc] = useState<ManagedDocumentRecord | null>(null);
  const [detailTab, setDetailTab] = useState(0);

  const filteredDocuments = useMemo(
    () =>
      documentList.filter(
        (d) =>
          (typeFilter === '' || d.type === typeFilter) &&
          (d.code.toLowerCase().includes(keyword.toLowerCase()) ||
            d.title.toLowerCase().includes(keyword.toLowerCase()) ||
            d.sender.toLowerCase().includes(keyword.toLowerCase()) ||
            d.receiver.toLowerCase().includes(keyword.toLowerCase()))
      ),
    [documentList, keyword, typeFilter]
  );

  const documentRows = filteredDocuments.map((d) => ({
    code: d.code,
    title: (
      <Typography variant="body2" sx={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {d.title}
      </Typography>
    ),
    type: <Chip label={d.type} size="small" variant="outlined" />,
    sender: d.sender,
    receiver: d.receiver,
    version: d.version,
    attachments: <Chip label={`${d.attachments.length} tệp`} size="small" color="default" variant="outlined" />,
    signStatus: <StatusChip status={d.signStatus} />,
    classification: <StatusChip status={d.classification} />,
    status: <StatusChip status={d.status} />,
    createdAt: d.createdAt,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" variant="outlined" onClick={() => { setDetailDoc(d); setDetailTab(0); }}>
          Chi tiết
        </Button>
        <Button size="small" onClick={() => handleEdit(d)}>Sửa</Button>
        <Button size="small" color="error" onClick={() => handleDelete(d.code)}>Xóa</Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyDocumentForm,
      code: `VB-2026-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toLocaleString('vi-VN'),
    });
    setOpenForm(true);
  }

  function handleEdit(d: ManagedDocumentRecord) {
    setEditingCode(d.code);
    setFormValues(d);
    setOpenForm(true);
  }

  function handleDelete(code: string) {
    setDocumentList((prev) => prev.filter((d) => d.code !== code));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).map((file) => file.name);
    setFormValues((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
    event.target.value = '';
  }

  function handleRemoveAttachment(fileName: string) {
    setFormValues((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((item) => item !== fileName),
    }));
  }

  function handleOpenSignStudio() {
    if (!formValues.title || !formValues.sender || !formValues.receiver || formValues.attachments.length === 0) return;
    setOpenSignDialog(true);
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.title || !formValues.sender || !formValues.receiver || formValues.attachments.length === 0) return;

    if (editingCode) {
      setDocumentList((prev) => prev.map((d) => (d.code === editingCode ? formValues : d)));
    } else {
      setDocumentList((prev) => [formValues, ...prev]);
    }

    setOpenForm(false);
  }

  return (
    <PageShell
      title="Document Management"
      subtitle="Quản lý toàn bộ vòng đời văn bản điện tử: tạo mới, metadata, file đính kèm, ký số, gửi nhận, lưu trữ và tra cứu trên một màn hình."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Tổng văn bản"
            value={documentList.length}
            helper={`${documentList.filter((d) => d.status === 'Đã phát hành').length} đã phát hành`}
            icon="solar:documents-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Có đính kèm"
            value={documentList.filter((d) => d.attachments.length > 0).length}
            helper="Có tối thiểu 1 tệp"
            icon="solar:paperclip-2-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Đã ký số"
            value={documentList.filter((d) => d.signStatus === 'Đã ký số').length}
            helper="Hoàn tất bước ký"
            icon="solar:shield-check-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Đang xử lý"
            value={documentList.filter((d) => d.status === 'Đang xử lý').length}
            helper="Chờ xử lý hoặc phát hành"
            icon="solar:refresh-circle-bold"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <SectionCard title="Document Lifecycle" subtitle="Chuỗi xử lý từ tạo mới đến lưu trữ hoặc hủy.">
            <Grid container spacing={1.5}>
              {documentLifecycle.map((step, index) => (
                <Grid key={step} item xs={6} sm={4} md={2.4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral', textAlign: 'center' }}>
                    <Typography variant="overline" color="text.secondary" display="block">
                      Bước {index + 1}
                    </Typography>
                    <Typography variant="subtitle2">{step}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard title="Ký số & lưu trữ" subtitle="Những điểm chính trong luồng xử lý văn bản.">
            <Stack spacing={1.5}>
              {[
                { icon: 'solar:shield-check-bold', label: 'Bắt buộc ký số', text: 'Luồng thêm mới hỗ trợ tải tệp và mở popup ký số ngay trong form.' },
                { icon: 'solar:folder-bold', label: 'Lưu trữ tệp', text: 'Mỗi văn bản có thể chứa nhiều tệp đính kèm để theo dõi bản chính và phụ lục.' },
                { icon: 'solar:clipboard-list-bold', label: 'Audit Trail', text: 'Ghi nhận thao tác tạo, tải tệp, ký số, phát hành và gửi liên thông.' },
              ].map((item) => (
                <Box key={item.label} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Iconify icon={item.icon} width={20} sx={{ mt: 0.25, color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="subtitle2">{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.text}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        title="Danh sách văn bản"
        subtitle="Tìm kiếm, lọc, thêm mới và theo dõi ngay cả file đính kèm lẫn trạng thái ký số."
        action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleOpenCreate}>
            Thêm văn bản
          </Button>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Tìm kiếm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Số ký hiệu, trích yếu, nơi gửi, nơi nhận..."
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Lọc loại văn bản"
              select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {DOC_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t === '' ? 'Tất cả' : t}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <DataTable
            columns={[
              { key: 'code', label: 'Số ký hiệu' },
              { key: 'title', label: 'Trích yếu' },
              { key: 'type', label: 'Loại', align: 'center' },
              { key: 'sender', label: 'Nơi gửi' },
              { key: 'receiver', label: 'Nơi nhận' },
              { key: 'version', label: 'Phiên bản', align: 'center' },
              { key: 'attachments', label: 'Tệp', align: 'center' },
              { key: 'signStatus', label: 'Ký số', align: 'center' },
              { key: 'classification', label: 'Phân loại', align: 'center' },
              { key: 'status', label: 'Trạng thái', align: 'center' },
              { key: 'createdAt', label: 'Ngày tạo' },
              { key: 'actions', label: 'Thao tác', align: 'right' },
            ]}
            rows={documentRows}
          />
        </Stack>
      </SectionCard>

      <Dialog open={Boolean(detailDoc)} onClose={() => setDetailDoc(null)} fullWidth maxWidth="md">
        {detailDoc && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6">{detailDoc.code}</Typography>
                  <Typography variant="body2" color="text.secondary">{detailDoc.title}</Typography>
                </Box>
                <StatusChip status={detailDoc.status} />
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 1 }}>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }}>
                <Tab label="Metadata" icon={<Iconify icon="solar:document-text-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
                <Tab label="Attachment" icon={<Iconify icon="solar:paperclip-2-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
                <Tab label="Version" icon={<Iconify icon="solar:history-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
                <Tab label="Audit Trail" icon={<Iconify icon="solar:clipboard-list-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
              </Tabs>

              {detailTab === 0 && (
                <Grid container spacing={2}>
                  {[
                    { label: 'Số ký hiệu', value: detailDoc.code },
                    { label: 'Loại văn bản', value: detailDoc.type },
                    { label: 'Nơi gửi', value: detailDoc.sender },
                    { label: 'Nơi nhận', value: detailDoc.receiver },
                    { label: 'Phiên bản', value: detailDoc.version },
                    { label: 'Phân loại', value: detailDoc.classification },
                    { label: 'Trạng thái', value: detailDoc.status },
                    { label: 'Nhà cung cấp ký', value: detailDoc.signProvider },
                    { label: 'Ký số', value: `${detailDoc.signStatus} (${detailDoc.signedPositions} vị trí)` },
                    { label: 'Ngày tạo', value: detailDoc.createdAt },
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
                      <Typography variant="body2">{detailDoc.title}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {detailTab === 1 && (
                <DataTable
                  columns={[
                    { key: 'fileName', label: 'Tên file' },
                    { key: 'contentType', label: 'Loại' },
                    { key: 'size', label: 'Kích thước', align: 'right' },
                    { key: 'uploadedAt', label: 'Upload lúc' },
                  ]}
                  rows={detailDoc.attachments.map((fileName) => ({
                    fileName,
                    contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    size: fileName.endsWith('.pdf') ? '2.4 MB' : '0.8 MB',
                    uploadedAt: detailDoc.createdAt,
                  }))}
                />
              )}

              {detailTab === 2 && (
                <DataTable
                  columns={[
                    { key: 'version', label: 'Phiên bản', align: 'center' },
                    { key: 'changedBy', label: 'Người thay đổi' },
                    { key: 'changedAt', label: 'Thời điểm' },
                    { key: 'note', label: 'Ghi chú' },
                  ]}
                  rows={fakeVersions(detailDoc)}
                />
              )}

              {detailTab === 3 && (
                <DataTable
                  columns={[
                    { key: 'action', label: 'Hành động' },
                    { key: 'actor', label: 'Người thực hiện' },
                    { key: 'time', label: 'Thời gian' },
                    { key: 'detail', label: 'Chi tiết' },
                  ]}
                  rows={fakeAudit(detailDoc)}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDoc(null)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingCode ? 'Cập nhật văn bản' : 'Tạo mới văn bản'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số ký hiệu"
                disabled={Boolean(editingCode)}
                value={formValues.code}
                onChange={(e) => setFormValues((p) => ({ ...p, code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loại văn bản"
                select
                value={formValues.type}
                onChange={(e) => setFormValues((p) => ({ ...p, type: e.target.value }))}
              >
                {DOC_TYPES.filter((t) => t !== '').map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trích yếu"
                value={formValues.title}
                onChange={(e) => setFormValues((p) => ({ ...p, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nơi gửi"
                value={formValues.sender}
                onChange={(e) => setFormValues((p) => ({ ...p, sender: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nơi nhận"
                value={formValues.receiver}
                onChange={(e) => setFormValues((p) => ({ ...p, receiver: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phiên bản"
                value={formValues.version}
                onChange={(e) => setFormValues((p) => ({ ...p, version: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phân loại"
                select
                value={formValues.classification}
                onChange={(e) => setFormValues((p) => ({ ...p, classification: e.target.value }))}
              >
                {['Thường', 'Nội bộ', 'Mật', 'Tối mật'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.status}
                onChange={(e) => setFormValues((p) => ({ ...p, status: e.target.value }))}
              >
                {['Đang xử lý', 'Chờ ký số', 'Đã phát hành', 'Đã nhận', 'Đang lưu trữ'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2">Tệp đính kèm văn bản</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tải file PDF, DOCX hoặc phụ lục để đưa vào quy trình ký số.
                      </Typography>
                    </Box>
                    <Button variant="outlined" component="label" startIcon={<Iconify icon="solar:upload-bold" />}>
                      Upload file
                      <input hidden multiple type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} />
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {formValues.attachments.length > 0 ? (
                      formValues.attachments.map((file) => (
                        <Chip key={file} label={file} onDelete={() => handleRemoveAttachment(file)} variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">Chưa có tệp đính kèm.</Typography>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Luồng thêm mới hiện hỗ trợ đủ 3 bước trên cùng popup: nhập metadata, upload file và mở giao diện ký số.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2">Popup giao diện ký số</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nhà cung cấp: {formValues.signProvider} | Trạng thái: {formValues.signStatus} | Vị trí ký: {formValues.signedPositions}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleOpenSignStudio}
                    disabled={!formValues.title || !formValues.sender || !formValues.receiver || formValues.attachments.length === 0}
                  >
                    Mở giao diện ký số
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSignDialog} onClose={() => setOpenSignDialog(false)} fullWidth maxWidth="xl">
        <DialogTitle>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
            <Box>
              <Typography variant="h6">Giao diện ký số văn bản</Typography>
              <Typography variant="body2" color="text.secondary">
                {formValues.code} · {formValues.attachments[0] ?? 'Chưa có file'}
              </Typography>
            </Box>
            <StatusChip status={formValues.signStatus} />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <SignatureStudio
            fileName={formValues.attachments[0]}
            onSignComplete={(signatures) => {
              setFormValues((prev) => ({
                ...prev,
                signStatus: 'Đã ký số',
                status: prev.status === 'Đang xử lý' ? 'Chờ ký số' : prev.status,
                signedPositions: signatures.length,
              }));
              setOpenSignDialog(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSignDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
