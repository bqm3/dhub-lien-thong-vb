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
  DocumentRecord,
  documentFunctions,
  documentLifecycle,
  documents,
} from '../../sections/interoperability/mockData';
import {
  BulletList,
  DataTable,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';

const emptyDocumentForm: DocumentRecord = {
  code: '',
  title: '',
  type: 'CONG_VAN',
  sender: '',
  receiver: '',
  version: 'v1',
  classification: 'Thường',
  status: 'Đang xử lý',
  createdAt: '02/07/2026 09:00',
};

export default function DocumentManagementPage() {
  const [documentList, setDocumentList] = useState<DocumentRecord[]>(documents);
  const [keyword, setKeyword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<DocumentRecord>(emptyDocumentForm);

  const filteredDocuments = useMemo(
    () =>
      documentList.filter(
        (document) =>
          document.code.toLowerCase().includes(keyword.toLowerCase()) ||
          document.title.toLowerCase().includes(keyword.toLowerCase()) ||
          document.sender.toLowerCase().includes(keyword.toLowerCase()) ||
          document.receiver.toLowerCase().includes(keyword.toLowerCase())
      ),
    [documentList, keyword]
  );

  const documentRows = filteredDocuments.map((document) => ({
    code: document.code,
    title: document.title,
    type: document.type,
    sender: document.sender,
    receiver: document.receiver,
    version: document.version,
    classification: <StatusChip status={document.classification} />,
    status: <StatusChip status={document.status} />,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={() => handleEdit(document)}>
          Sửa
        </Button>
        <Button size="small" color="error" onClick={() => handleDelete(document.code)}>
          Xóa
        </Button>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setFormValues({
      ...emptyDocumentForm,
      code: `VB-2026-${String(Date.now()).slice(-6)}`,
    });
    setOpenDialog(true);
  }

  function handleEdit(document: DocumentRecord) {
    setEditingCode(document.code);
    setFormValues(document);
    setOpenDialog(true);
  }

  function handleDelete(code: string) {
    setDocumentList((prev) => prev.filter((document) => document.code !== code));
  }

  function handleSubmit() {
    if (!formValues.code || !formValues.title || !formValues.sender || !formValues.receiver) return;

    if (editingCode) {
      setDocumentList((prev) =>
        prev.map((document) => (document.code === editingCode ? formValues : document))
      );
    } else {
      setDocumentList((prev) => [formValues, ...prev]);
    }

    setOpenDialog(false);
  }

  return (
    <PageShell
      title="Document Management"
      subtitle="Quản lý toàn bộ vòng đời văn bản điện tử từ tạo mới, metadata, file đính kèm, phiên bản, bảo mật, lưu trữ đến audit trail và tra cứu."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Văn bản đang quản lý"
            value={documentList.length}
            helper="Danh sách đang cho phép CRUD demo"
            icon="solar:documents-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="File đính kèm"
            value={documentList.length * 2}
            helper="Giả lập 2 file / văn bản"
            icon="solar:paperclip-2-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Version đang lưu"
            value={documentList.filter((item) => item.version !== 'v1').length}
            helper="Bản ghi có hơn 1 phiên bản"
            icon="solar:history-bold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Tỷ lệ tra cứu được"
            value="99.9%"
            helper="Full-text + metadata search"
            icon="solar:magnifer-bold"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Danh mục chức năng"
            subtitle="11 nhóm chức năng của Document Lifecycle Management."
          >
            <BulletList items={documentFunctions} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Document Lifecycle"
            subtitle="Minh họa chuỗi xử lý từ lúc tạo đến archive/hủy."
          >
            <Grid container spacing={1.5}>
              {documentLifecycle.map((step, index) => (
                <Grid key={step} item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral', height: '100%' }}>
                    <Typography variant="overline" color="text.secondary">
                      Bước {index + 1}
                    </Typography>
                    <Typography variant="subtitle2">{step}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <SectionCard
            title="Document Registry"
            subtitle="Danh sách văn bản có thêm mới, chỉnh sửa metadata và xóa bản ghi demo."
            action={
              <Button variant="contained" onClick={handleOpenCreate}>
                Thêm văn bản
              </Button>
            }
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Tìm kiếm văn bản"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Số ký hiệu, trích yếu, nơi gửi, nơi nhận"
              />
            <DataTable
              columns={[
                { key: 'code', label: 'Số ký hiệu' },
                { key: 'title', label: 'Trích yếu' },
                { key: 'type', label: 'Loại' },
                { key: 'sender', label: 'Nơi gửi' },
                { key: 'receiver', label: 'Nơi nhận' },
                { key: 'version', label: 'Version', align: 'center' },
                { key: 'classification', label: 'Phân loại', align: 'center' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={documentRows}
            />
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Security & Archive"
            subtitle="Thông tin mẫu cho bảo mật và chính sách lưu trữ."
          >
            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Bảo mật
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hỗ trợ mức Thường, Nội bộ, Mật. Metadata nhạy cảm được mã hóa và audit theo từng
                  lần truy cập.
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Retention
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Văn bản nghiệp vụ giữ 10 năm, văn bản hành chính giữ 5 năm, hỗ trợ archive và hủy
                  theo policy.
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Audit Trail
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ghi nhận tạo, cập nhật metadata, ký số, gửi nhận, tải file, đổi version và archive.
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingCode ? 'Cập nhật văn bản' : 'Tạo mới văn bản'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số ký hiệu"
                disabled={Boolean(editingCode)}
                value={formValues.code}
                onChange={(event) => setFormValues((prev) => ({ ...prev, code: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loại văn bản"
                select
                value={formValues.type}
                onChange={(event) => setFormValues((prev) => ({ ...prev, type: event.target.value }))}
              >
                <MenuItem value="CONG_VAN">CONG_VAN</MenuItem>
                <MenuItem value="QUYET_DINH">QUYET_DINH</MenuItem>
                <MenuItem value="BAO_CAO">BAO_CAO</MenuItem>
                <MenuItem value="THONG_BAO">THONG_BAO</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trích yếu"
                value={formValues.title}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, title: event.target.value }))
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Version"
                value={formValues.version}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, version: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phân loại"
                select
                value={formValues.classification}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, classification: event.target.value }))
                }
              >
                <MenuItem value="Thường">Thường</MenuItem>
                <MenuItem value="Nội bộ">Nội bộ</MenuItem>
                <MenuItem value="Mật">Mật</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trạng thái"
                select
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
                <MenuItem value="Đã phát hành">Đã phát hành</MenuItem>
                <MenuItem value="Đã nhận">Đã nhận</MenuItem>
                <MenuItem value="Đang lưu trữ">Đang lưu trữ</MenuItem>
              </TextField>
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
