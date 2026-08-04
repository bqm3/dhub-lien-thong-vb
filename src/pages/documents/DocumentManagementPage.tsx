import { ChangeEvent, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  DataTable,
  GridRow,
  MetricCard,
  PageShell,
  SectionCard,
} from '../../sections/interoperability/components';
import Iconify from '../../components/iconify';
import { documentsApi, documentAttachmentsApi } from '../../services/documentsApi';
import { dmCategoryApi } from '../../services/dmCategoryApi';
import { getDefaultDateRange } from '../../services/getDefaultDateRange';
import { formatTime } from '../../utils/formatTime';
import { isApiSuccess } from '../../utils/axios';
import useLoading from '../../hooks/useLoading';

export type ManagedDocumentRecord = {
  numericId?: number;
  id?: number;
  code: string;           // CODE
  messageId?: string;      // MESSAGE_ID
  documentNo: string;      // DOCUMENT_NO
  documentType: string;    // DOCUMENT_TYPE
  subject: string;         // SUBJECT
  senderCode: string;      // SENDER_CODE
  senderName: string;      // SENDER_NAME
  status: string;          // STATUS
  createdAt: string;       // CDATE
  attachments?: {
    id?: number;
    originalFileName: string;
    objectKey: string;
    fileSize?: number;
    contentType?: string;
  }[];
};

const emptyDocumentForm: ManagedDocumentRecord = {
  code: '',
  documentNo: '',
  documentType: '',
  subject: '',
  senderCode: '',
  senderName: '',
  status: '1',
  createdAt: formatTime(new Date()),
};

function getFileExtensionInfo(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) {
    return { icon: 'solar:file-corrupted-bold', color: '#e53935', bg: 'rgba(229, 57, 53, 0.1)', label: 'PDF' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { icon: 'solar:file-word-bold', color: '#1976d2', bg: 'rgba(25, 118, 210, 0.1)', label: 'DOCX' };
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return { icon: 'solar:file-excel-bold', color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.1)', label: 'XLSX' };
  }
  if (['zip', 'rar', '7z'].includes(ext)) {
    return { icon: 'solar:archive-bold', color: '#ed6c02', bg: 'rgba(237, 108, 2, 0.1)', label: ext.toUpperCase() };
  }
  return { icon: 'solar:file-text-bold', color: '#0288d1', bg: 'rgba(2, 136, 209, 0.1)', label: ext.toUpperCase() || 'FILE' };
}

export default function DocumentManagementPage() {
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);

  // Pagination states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ManagedDocumentRecord>(emptyDocumentForm);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [detailDoc, setDetailDoc] = useState<ManagedDocumentRecord | null>(null);

  // TanStack Query: Fetch Document Types Category (PARENT_CODE = 'LOAI_VB')
  const { data: docTypesCategory } = useQuery({
    queryKey: ['docTypesCategory'],
    queryFn: async () => {
      const res = await dmCategoryApi.getList({
        pageIndex: 1,
        pageSize: 100,
        searchField: { PARENT_CODE: 'LOAI_VB' },
      });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      if (!rawList || rawList.length === 0) return [];
      return rawList.map((item: any) => ({
        code: item.CODE || item.code || '',
        name: item.NAME || item.name || item.CODE || item.code || '',
      }));
    },
  });

  const docTypeOptions = docTypesCategory || [];

  // TanStack Query: Fetch Đơn vị phát hành (PARENT_CODE = 'DON_VI')
  const { data: donViCategory } = useQuery({
    queryKey: ['donViCategory'],
    queryFn: async () => {
      const res = await dmCategoryApi.getList({
        pageIndex: 1,
        pageSize: 200,
        searchField: { PARENT_CODE: 'DON_VI' },
      });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      if (!rawList || rawList.length === 0) return [];
      return rawList.map((item: any) => ({
        code: item.CODE || item.code || '',
        name: item.NAME || item.name || item.CODE || item.code || '',
      }));
    },
  });

  const donViOptions: { code: string; name: string }[] = donViCategory || [];

  // TanStack Query: Fetch Documents from API (DOCUMENTSController)
  const { data, isFetching, refetch } = useQuery<{ rows: ManagedDocumentRecord[]; total: number }>({
    queryKey: ['documents', pageIndex, pageSize, cdateStart, cdateEnd, typeFilter],
    queryFn: async () => {
      const res = await documentsApi.getList({
        pageIndex,
        pageSize,
        cdateStart,
        cdateEnd,
        searchField: typeFilter ? { DOCUMENT_TYPE: typeFilter } : {},
      });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      const total = res?.TotalRecords ?? res?.totalRecords ?? res?.TotalCount ?? res?.totalCount ?? (rawList ? rawList.length : 0);
      if (!rawList) return { rows: [], total: 0 };
      const mapped: ManagedDocumentRecord[] = rawList.map((item: any) => ({
        numericId: item.ID || item.id,
        id: item.ID || item.id,
        code: item.CODE || item.code || '',
        messageId: item.MESSAGE_ID || item.messageId || '',
        documentNo: item.DOCUMENT_NO || item.documentNo || '',
        documentType: item.DOCUMENT_TYPE || item.documentType || '',
        subject: item.SUBJECT || item.subject || '',
        senderCode: item.SENDER_CODE || item.senderCode || '',
        senderName: item.SENDER_NAME || item.senderName || '',
        status: String(item.STATUS ?? item.status ?? '1'),
        createdAt: formatTime(item.CDATE || item.cdate || item.createdDate || item.CREATED_DATE),
      }));
      return { rows: mapped, total };
    },
    placeholderData: keepPreviousData,
  });

  // TanStack Query: Fetch Detail & Attachments for Detail Dialog via DOCUMENTS/GetInfo/{id}
  const { data: detailDocAttachments } = useQuery({
    queryKey: ['documentAttachments', detailDoc?.numericId || detailDoc?.id],
    enabled: Boolean(detailDoc?.numericId || detailDoc?.id),
    queryFn: async () => {
      const docId = detailDoc?.numericId || detailDoc?.id;
      if (!docId) return [];
      const res = await documentsApi.getInfo(docId);
      const infoData = res?.Data || res?.data;
      const list = infoData?.DOCUMENT_ATTACHMENT || infoData?.document_attachment || infoData?.DocumentAttachment || [];
      return list.map((item: any) => ({
        id: item.ID || item.id,
        originalFileName: item.ORIGINAL_FILE_NAME || item.originalFileName || 'File_dinh_kem.pdf',
        objectKey: item.OBJECT_KEY || item.objectKey || '',
        fileSize: item.FILE_SIZE || item.fileSize || 0,
        contentType: item.CONTENT_TYPE || item.contentType || 'application/pdf',
      }));
    },
  });

  const documentList = data?.rows || [];
  const totalCount = data?.total || 0;

  // TanStack Mutation: Save Document
  const saveMutation = useMutation({
    mutationFn: async (item: ManagedDocumentRecord) => {
      if (!editingCode) {
        // Tạo mới: dùng CreateBundle (multipart/form-data) — BE tự sinh CODE
        return await documentsApi.createBundle({
          documentNo: item.documentNo,
          documentType: item.documentType,
          subject: item.subject,
          senderCode: item.senderCode,
          senderName: item.senderName,
          status: item.status || '1',
          files: attachmentFiles,
        });
      } else {
        // Cập nhật: dùng Create cũ (JSON)
        const docRes = await documentsApi.createOrUpdate({
          id: item.numericId,
          code: item.code || item.documentNo,
          documentNo: item.documentNo,
          documentType: item.documentType,
          subject: item.subject,
          senderCode: item.senderCode,
          senderName: item.senderName,
          status: item.status || '1',
        });
        // Upload file đính kèm nếu có
        if (attachmentFiles.length > 0) {
          await Promise.all(
            attachmentFiles.map((file) =>
              documentAttachmentsApi.create({
                documentId: item.documentNo || item.code,
                originalFileName: file.name,
                contentType: file.type || 'application/pdf',
                objectKey: `documents/${item.documentNo || item.code}/${file.name}`,
                fileSize: file.size,
              })
            )
          );
        }
        return docRes;
      }
    },
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        queryClient.invalidateQueries({ queryKey: ['documentAttachments'] });
        refetch();
        setOpenForm(false);
        setAttachmentFiles([]);
      }
    },
  });

  // TanStack Mutation: Delete Document (Delete DOCUMENTS)
  const deleteMutation = useMutation({
    mutationFn: (numericId: number) => documentsApi.delete(numericId),
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        refetch();
      }
      setDeletingId(null);
    },
  });

  const filteredDocuments = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return documentList;
    return documentList.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.documentNo.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        d.senderCode.toLowerCase().includes(q) ||
        d.senderName.toLowerCase().includes(q)
    );
  }, [documentList, keyword]);

  const documentRows = filteredDocuments.map((d) => ({
    code: d.code,
    documentNo: d.documentNo,
    documentType: d.documentType,
    sender: (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{d.senderName}</Typography>
        <Typography variant="caption" color="text.secondary">{d.senderCode}</Typography>
      </Box>
    ),
    status: d.status === '1' || d.status === 'Active' ? 'Hoạt động' : 'Ngưng dùng',
    createdAt: formatTime(d.createdAt),
    actions: (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <Tooltip title="Chi tiết">
          <IconButton size="small" color="info" onClick={() => setDetailDoc(d)}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sửa">
          <IconButton size="small" color="primary" onClick={() => handleEdit(d)}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa">
          <IconButton size="small" color="error" onClick={() => setDeletingId(d.numericId || null)}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setAttachmentFiles([]);
    const now = Date.now();
    setFormValues({
      ...emptyDocumentForm,
      code: ``,
      documentNo: ``,
      createdAt: formatTime(new Date()),
    });
    setOpenForm(true);
  }

  function handleEdit(d: ManagedDocumentRecord) {
    setEditingCode(d.code);
    setFormValues(d);
    setAttachmentFiles([]);
    setOpenForm(true);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(event.target.files ?? []);
    if (newFiles.length === 0) return;

    setAttachmentFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const toAdd = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...toAdd];
    });

    event.target.value = '';
  }

  function handleRemoveFile(fileName: string) {
    setAttachmentFiles((prev) => prev.filter((f) => f.name !== fileName));
  }

  function handleSubmit() {
    if (!formValues.documentNo || !formValues.subject || !formValues.documentType || !formValues.senderCode || !formValues.senderName) return;
    saveMutation.mutate(formValues);
  }

  function handleConfirmDelete() {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  }

  return (
    <PageShell
      title="Quản lý văn bản"
      subtitle="Quản lý danh sách các văn bản điện tử và tệp tin đính kèm trong hệ thống."
    >
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng văn bản"
          value={totalCount}
          helper="Tất cả văn bản trong hệ thống"
          icon="solar:documents-bold"
        />
        <MetricCard
          label="Đang hoạt động"
          value={documentList.filter((d) => d.status === '1' || d.status === 'Active').length}
          helper="Văn bản sử dụng"
          icon="solar:shield-check-bold"
        />
        <MetricCard
          label="Ngưng dùng"
          value={documentList.filter((d) => d.status !== '1' && d.status !== 'Active').length}
          helper="Ngưng hoạt động"
          icon="solar:shield-warning-bold"
        />
        <MetricCard
          label="Loại văn bản"
          value={new Set(documentList.map((d) => d.documentType)).size}
          helper="Phân loại hệ thống"
          icon="solar:category-bold"
        />
      </GridRow>

      <SectionCard
        title="Danh sách văn bản"
        subtitle="Danh sách văn bản và trạng thái kết nối liên thông."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Đang tải...' : 'Làm mới'}
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleOpenCreate}>
              Thêm văn bản
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Tìm kiếm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Mã, số ký hiệu, trích yếu, mã/tên CQ gửi..."
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Lọc loại văn bản"
              select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPageIndex(1);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {docTypeOptions.map((item: any) => (
                <MenuItem key={item.code} value={item.code}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              label="Từ ngày"
              InputLabelProps={{ shrink: true }}
              value={cdateStart}
              onChange={(e) => {
                setCdateStart(e.target.value);
                setPageIndex(1);
              }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              type="date"
              label="Đến ngày"
              InputLabelProps={{ shrink: true }}
              value={cdateEnd}
              onChange={(e) => {
                setCdateEnd(e.target.value);
                setPageIndex(1);
              }}
              sx={{ minWidth: 160 }}
            />
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <DataTable
              columns={[
                { key: 'code', label: 'Mã' },
                { key: 'documentNo', label: 'Số ký hiệu' },
                { key: 'documentType', label: 'Loại VB', align: 'center' },
                { key: 'sender', label: 'Cơ quan gửi' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'createdAt', label: 'Ngày tạo', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={documentRows}
              loading={isFetching}
              pageIndex={pageIndex}
              rowsPerPage={pageSize}
              totalCount={totalCount}
              onPageChange={(newPage) => setPageIndex(newPage)}
              onRowsPerPageChange={(newSize) => {
                setPageSize(newSize);
                setPageIndex(1);
              }}
            />
          </Box>
        </Stack>
      </SectionCard>

      {/* Dialog Chi tiết */}
      <Dialog open={Boolean(detailDoc)} onClose={() => setDetailDoc(null)} fullWidth maxWidth="md">
        {detailDoc && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:document-bold" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Chi tiết văn bản: {detailDoc.documentNo}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Mã văn bản</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{detailDoc.code}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Số ký hiệu</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{detailDoc.documentNo}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Loại văn bản</Typography>
                  <Typography variant="body2">{detailDoc.documentType}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Mã cơ quan gửi</Typography>
                  <Typography variant="body2">{detailDoc.senderCode}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Tên cơ quan gửi</Typography>
                  <Typography variant="body2">{detailDoc.senderName}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                  <Typography variant="body2">{detailDoc.status === '1' || detailDoc.status === 'Active' ? 'Hoạt động' : 'Ngưng dùng'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Thời gian tạo</Typography>
                  <Typography variant="body2">{detailDoc.createdAt}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Trích yếu</Typography>
                  <Typography variant="body2">{detailDoc.subject}</Typography>
                </Grid>

                {/* Danh sách tệp đính kèm của văn bản */}
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Tệp đính kèm ({detailDocAttachments?.length || 0})
                    </Typography>
                  </Stack>
                  {detailDocAttachments && detailDocAttachments.length > 0 ? (
                    <Grid container spacing={1.5}>
                      {detailDocAttachments.map((att: any) => {
                        const fileInfo = getFileExtensionInfo(att.originalFileName);
                        return (
                          <Grid item xs={12} sm={6} key={att.id || att.originalFileName}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.75,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: (theme) => theme.customShadows?.z4 || '0 4px 12px rgba(0,0,0,0.06)',
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                                <Box
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 1.5,
                                    bgcolor: fileInfo.bg,
                                    color: fileInfo.color,
                                    display: 'grid',
                                    placeItems: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Iconify icon={fileInfo.icon} width={24} />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {att.originalFileName}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                                    <Chip label={fileInfo.label} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: fileInfo.bg, color: fileInfo.color }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {(att.fileSize / 1024).toFixed(1)} KB
                                    </Typography>
                                  </Stack>
                                </Box>
                              </Stack>
                              <Tooltip title="Tải tệp tin">
                                <IconButton size="small" color="primary" sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
                                  <Iconify icon="solar:download-bold" width={18} />
                                </IconButton>
                              </Tooltip>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.03) }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có tệp đính kèm nào.
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDoc(null)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog Tạo mới / Cập nhật thiết kế hiện đại, tinh gọn */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Iconify icon={editingCode ? 'solar:pen-bold' : 'solar:document-add-bold'} width={24} />
            </Box>
            <Box>
              <Typography variant="h6">{editingCode ? 'Cập nhật văn bản' : 'Tạo mới văn bản'}</Typography>
              <Typography variant="caption" color="text.secondary">
                Nhập các thông tin văn bản và đính kèm tệp tin tương ứng.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Khối 1: Thông tin văn bản */}
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 700 }}>
                1. Thông tin văn bản
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Số ký hiệu"
                    value={formValues.documentNo}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, documentNo: e.target.value }))}
                    placeholder="Nhập số ký hiệu văn bản"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Loại văn bản"
                    value={formValues.documentType}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, documentType: e.target.value }))}
                  >
                    {docTypeOptions.map((item: any) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2.5}
                    label="Trích yếu"
                    value={formValues.subject}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Nhập nội dung trích yếu văn bản"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Khối 2: Đơn vị phát hành */}
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 700 }}>
                2. Đơn vị phát hành
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Đơn vị phát hành"
                    value={formValues.senderCode}
                    onChange={(e) => {
                      const selected = donViOptions.find((o) => o.code === e.target.value);
                      setFormValues((prev) => ({
                        ...prev,
                        senderCode: selected?.code || '',
                        senderName: selected?.name || '',
                      }));
                    }}
                  >
                    {donViOptions.map((item) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Khối 3: Tệp đính kèm */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                  3. Tệp đính kèm
                </Typography>
                {attachmentFiles.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Đã chọn <b>{attachmentFiles.length}</b> tệp tin
                  </Typography>
                )}
              </Stack>

              <Box
                component="label"
                onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e: React.DragEvent) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const droppedFiles = Array.from(e.dataTransfer.files ?? []);
                  if (droppedFiles.length === 0) return;
                  setAttachmentFiles((prev) => {
                    const existingNames = new Set(prev.map((f) => f.name));
                    return [...prev, ...droppedFiles.filter((f) => !existingNames.has(f.name))];
                  });
                }}
                sx={{
                  p: 3,
                  display: 'block',
                  textAlign: 'center',
                  border: (theme) => `1px solid ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  bgcolor: (theme) => isDragOver ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                  },
                }}
              >
                <input type="file" hidden multiple onChange={handleFileChange} />
                <Stack spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      display: 'grid',
                      placeItems: 'center',
                      transform: isDragOver ? 'scale(1.08)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <Iconify icon="solar:cloud-upload-bold-duotone" width={32} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {isDragOver ? 'Thả tệp vào đây' : 'Nhấp để chọn tệp hoặc kéo thả vào đây'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      PDF, WORD (.docx), EXCEL (.xlsx), ZIP — Tối đa 25MB/tệp
                    </Typography>
                  </Box>
                </Stack>
              </Box>


              {attachmentFiles.length > 0 && (
                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                  {attachmentFiles.map((file) => {
                    const fileInfo = getFileExtensionInfo(file.name);
                    return (
                      <Grid item xs={12} sm={6} key={file.name}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: 'background.paper',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 1.25,
                                bgcolor: fileInfo.bg,
                                color: fileInfo.color,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Iconify icon={fileInfo.icon} width={22} />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {file.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={fileInfo.label} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: fileInfo.bg, color: fileInfo.color }} />
                                <Typography variant="caption" color="text.secondary">
                                  {(file.size / 1024).toFixed(1)} KB
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          <Tooltip title="Xóa tệp">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFile(file.name)}
                              sx={{
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                },
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={() => setOpenForm(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:diskette-bold" />}
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Đang lưu...' : 'Lưu văn bản'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Xác nhận Xóa */}
      <Dialog open={Boolean(deletingId)} onClose={() => setDeletingId(null)} fullWidth maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa văn bản này không?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingId(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
