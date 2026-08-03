import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { documentLifecycle, documents } from '../../sections/interoperability/mockData';
import {
  DataTable,
  GridRow,
  MetricCard,
  PageShell,
  SectionCard,
  StatusChip,
} from '../../sections/interoperability/components';
import Iconify from '../../components/iconify';
import DocumentAttachmentPreviewDialog from './DocumentAttachmentPreviewDialog';
import DocumentDetailDialog from './DocumentDetailDialog';
import DocumentFormDialog from './DocumentFormDialog';
import DocumentSignDialog from './DocumentSignDialog';
import {
  fileToBase64,
  formatDocumentDate,
  normalizeManagedDocument,
  parseDocumentDate,
  saveDocumentToDemoStorage,
} from './documentHelpers';
import { DOC_TYPES, emptyDocumentForm, ManagedDocumentRecord } from './types';

const lifecycleStepIcons = [
  'solar:document-add-bold',
  'solar:clipboard-list-bold',
  'solar:shield-check-bold',
  'solar:check-circle-bold',
  'solar:plain-2-bold',
  'solar:inbox-in-bold',
  'solar:settings-bold',
  'solar:folder-bold',
  'solar:magnifer-bold',
  'solar:archive-bold',
];

function DocumentActionsMenu({
  onDetail,
  onEdit,
  onDelete,
}: {
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" width={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            onDetail();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:eye-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Chi tiết" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Sửa" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete();
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Iconify icon="solar:trash-bin-trash-bold" width={18} sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary="Xóa" />
        </MenuItem>
      </Menu>
    </>
  );
}

const initialDocuments: ManagedDocumentRecord[] = documents.map((doc, index) => ({
  ...doc,
  attachments: [`${doc.code.toLowerCase()}.pdf`, `phu-luc-${index + 1}.docx`],
  signProvider: index % 3 === 0 ? 'VNPT SmartCA' : 'USB Token / HSM',
  signStatus: doc.status === 'Đã phát hành' ? 'Đã ký số' : index % 2 === 0 ? 'Đang chờ ký' : 'Chưa ký',
  signedPositions: doc.status === 'Đã phát hành' ? 2 : index % 2 === 0 ? 1 : 0,
}));

export default function DocumentManagementPage() {
  const [documentList, setDocumentList] = useState<ManagedDocumentRecord[]>(initialDocuments);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openSignDialog, setOpenSignDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ManagedDocumentRecord>(emptyDocumentForm);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [formAttachmentPreviewUrls, setFormAttachmentPreviewUrls] = useState<Record<string, string>>({});
  const [detailDoc, setDetailDoc] = useState<ManagedDocumentRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ManagedDocumentRecord | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let mounted = true;

    async function loadSavedDocuments() {
      try {
        const resp = await fetch('/api/demo-documents');
        if (!resp.ok) return;
        const payload = await resp.json();
        const savedDocsRaw = Array.isArray(payload?.documents) ? payload.documents : [];
        const savedDocs: ManagedDocumentRecord[] = savedDocsRaw
          .map((item: Partial<ManagedDocumentRecord>) => normalizeManagedDocument(item))
          .filter((item: ManagedDocumentRecord | null): item is ManagedDocumentRecord => Boolean(item));

        if (!mounted || savedDocs.length === 0) return;

        setDocumentList((prev) => {
          const byCode = new Map<string, ManagedDocumentRecord>();
          prev.forEach((doc) => byCode.set(doc.code, doc));
          savedDocs.forEach((doc) => byCode.set(doc.code, doc));
          return Array.from(byCode.values());
        });
      } catch {
        // Keep UI usable even if demo endpoint is unavailable.
      }
    }

    loadSavedDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!detailDoc) return;
    const latest = documentList.find((doc) => doc.code === detailDoc.code);
    if (!latest) {
      setDetailDoc(null);
      return;
    }
    if (latest !== detailDoc) {
      setDetailDoc(latest);
    }
  }, [detailDoc, documentList]);

  useEffect(() => {
    const nextUrls: Record<string, string> = {};

    formValues.attachments.forEach((name) => {
      const file = attachmentFiles.find((item) => item.name === name);
      if (file) {
        nextUrls[name] = URL.createObjectURL(file);
      }
    });

    setFormAttachmentPreviewUrls(nextUrls);

    return () => {
      Object.keys(nextUrls).forEach((key) => URL.revokeObjectURL(nextUrls[key]));
    };
  }, [attachmentFiles, formValues.attachments]);

  const filteredDocuments = useMemo(
    () =>
      [...documentList]
        .filter(
          (d) =>
            (typeFilter === '' || d.type === typeFilter) &&
            (d.code.toLowerCase().includes(keyword.toLowerCase()) ||
              d.title.toLowerCase().includes(keyword.toLowerCase()) ||
              d.sender.toLowerCase().includes(keyword.toLowerCase()) ||
              d.receiver.toLowerCase().includes(keyword.toLowerCase()))
        )
        .sort((a, b) => parseDocumentDate(b.createdAt) - parseDocumentDate(a.createdAt)),
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
    attachments: (
      <Chip
        label={`${d.attachments.length} tệp`}
        size="small"
        color="default"
        variant="outlined"
        clickable={d.attachments.length > 0}
        onClick={() => {
          if (d.attachments.length > 0) setPreviewDoc(d);
        }}
        icon={<Iconify icon="solar:eye-bold" width={14} />}
      />
    ),
    signStatus: <StatusChip status={d.signStatus} />,
    classification: <StatusChip status={d.classification} />,
    status: <StatusChip status={d.status} />,
    createdAt: d.createdAt,
    actions: (
      <DocumentActionsMenu
        onDetail={() => handleOpenDetail(d.code)}
        onEdit={() => handleEdit(d)}
        onDelete={() => handleDelete(d.code)}
      />
    ),
  }));

  function handleOpenCreate() {
    setEditingCode(null);
    setAttachmentFiles([]);
    setFormValues({
      ...emptyDocumentForm,
      code: `VB-2026-${String(Date.now()).slice(-6)}`,
      createdAt: formatDocumentDate(new Date()),
    });
    setOpenForm(true);
  }

  function handleEdit(d: ManagedDocumentRecord) {
    setEditingCode(d.code);
    setFormValues(d);
    setAttachmentFiles([]);
    setOpenForm(true);
  }

  function handleDelete(code: string) {
    setDocumentList((prev) => prev.filter((d) => d.code !== code));
  }

  function handleOpenDetail(code: string) {
    const doc = documentList.find((item) => item.code === code);
    if (!doc) return;
    setDetailDoc(doc);
  }

  async function handleSubmit(values: ManagedDocumentRecord, files: File[]) {
    if (!values.code || !values.title || !values.sender || !values.receiver || values.attachments.length === 0) {
      return;
    }

    try {
      const attachmentsPayload = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          base64: await fileToBase64(file),
        }))
      );

      const saved = await saveDocumentToDemoStorage(values, attachmentsPayload);

      if (editingCode) {
        setDocumentList((prev) => prev.map((d) => (d.code === editingCode ? values : d)));
      } else {
        setDocumentList((prev) => [values, ...prev]);
      }

      setFormValues(values);
      setOpenForm(false);
      setAttachmentFiles([]);
      enqueueSnackbar(`Đã lưu demo: ${saved?.savedTo ?? 'OK'}`, { variant: 'success' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Lỗi không xác định';
      enqueueSnackbar(`Lưu demo thất bại: ${message}`, { variant: 'error' });
    }
  }

  return (
    <PageShell
      title="Document Management"
      subtitle="Quản lý toàn bộ vòng đời văn bản điện tử: tạo mới, metadata, file đính kèm, ký số, gửi nhận, lưu trữ và tra cứu trên một màn hình."
    >
      <SectionCard
        title="Luồng hành trình văn bản"
        subtitle="Theo dõi chuỗi xử lý từ tạo mới đến lưu trữ dài hạn hoặc hủy."
      >
        <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
          <Stack
            direction="row"
            alignItems="stretch"
            spacing={0}
            sx={{ minWidth: { xs: 920, lg: '100%' }, width: '100%' }}
          >
            {documentLifecycle.map((step, index) => {
              const isLast = index === documentLifecycle.length - 1;
              return (
                <Stack key={step} direction="row" alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    spacing={1}
                    alignItems="center"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      px: 0.75,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: 'background.neutral',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        boxShadow: (theme) => `0 6px 14px ${theme.palette.primary.main}33`,
                      }}
                    >
                      <Iconify icon={lifecycleStepIcons[index] || 'solar:check-circle-bold'} width={20} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                      Bước {index + 1}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        lineHeight: 1.25,
                        px: 0.25,
                        minHeight: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {step}
                    </Typography>
                  </Stack>
                  {!isLast && (
                    <Iconify
                      icon="solar:alt-arrow-right-bold"
                      width={18}
                      sx={{ color: 'primary.main', mx: 0.5, flexShrink: 0, opacity: 0.7 }}
                    />
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </SectionCard>

      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng văn bản"
          value={documentList.length}
          helper={`${documentList.filter((d) => d.status === 'Đã phát hành').length} đã phát hành`}
          icon="solar:documents-bold"
        />
        <MetricCard
          label="Có đính kèm"
          value={documentList.filter((d) => d.attachments.length > 0).length}
          helper="Có tối thiểu 1 tệp"
          icon="solar:paperclip-2-bold"
        />
        <MetricCard
          label="Đã ký số"
          value={documentList.filter((d) => d.signStatus === 'Đã ký số').length}
          helper="Hoàn tất bước ký"
          icon="solar:shield-check-bold"
        />
        <MetricCard
          label="Đang xử lý"
          value={documentList.filter((d) => d.status === 'Đang xử lý').length}
          helper="Chờ xử lý hoặc phát hành"
          icon="solar:refresh-circle-bold"
        />
      </GridRow>

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
              label="Loại văn bản"
              select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {DOC_TYPES.filter((t) => t !== '').map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <DataTable
            columns={[
              { key: 'code', label: 'Số ký hiệu' },
              { key: 'title', label: 'Trích yếu' },
              { key: 'type', label: 'Loại' },
              { key: 'sender', label: 'Nơi gửi' },
              { key: 'receiver', label: 'Nơi nhận' },
              { key: 'version', label: 'Version', align: 'center' },
              { key: 'attachments', label: 'Đính kèm', align: 'center' },
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

      <DocumentDetailDialog
        doc={detailDoc}
        onClose={() => setDetailDoc(null)}
        onDocumentUpdated={(updatedDoc) => {
          setDocumentList((prev) => prev.map((doc) => (doc.code === updatedDoc.code ? updatedDoc : doc)));
          setDetailDoc(updatedDoc);
        }}
      />

      <DocumentAttachmentPreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <DocumentFormDialog
        open={openForm}
        editingCode={editingCode}
        initialValues={formValues}
        onClose={() => {
          setOpenForm(false);
          setAttachmentFiles([]);
        }}
        onOpenSignStudio={(values, files) => {
          setFormValues(values);
          setAttachmentFiles(files);
          setOpenSignDialog(true);
        }}
        onSubmit={handleSubmit}
      />

      <DocumentSignDialog
        open={openSignDialog}
        formValues={formValues}
        formAttachmentPreviewUrls={formAttachmentPreviewUrls}
        onClose={() => setOpenSignDialog(false)}
        onSignComplete={(signaturesCount) => {
          setFormValues((prev) => ({
            ...prev,
            signStatus: 'Đã ký số',
            status: prev.status === 'Đang xử lý' ? 'Chờ ký số' : prev.status,
            signedPositions: signaturesCount,
          }));
          setOpenSignDialog(false);
        }}
      />
    </PageShell>
  );
}
