import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Alert,
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
import SignatureStudio from '../../sections/workflow/components/SignatureStudio';

type ManagedDocumentRecord = DocumentRecord & {
  attachments: string[];
  signProvider: string;
  signStatus: string;
  signedPositions: number;
};

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

function pad2(value: number) {
  return value < 10 ? `0${value}` : String(value);
}

function formatDocumentDate(input: Date | number | string) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);

  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())} ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function normalizeManagedDocument(input: Partial<ManagedDocumentRecord>): ManagedDocumentRecord | null {
  if (!input.code || !input.title || !input.sender || !input.receiver) return null;

  const normalizedCreatedAt = input.createdAt
    ? formatDocumentDate(parseDocumentDate(String(input.createdAt)))
    : formatDocumentDate(new Date());

  return {
    code: String(input.code),
    title: String(input.title),
    type: String(input.type ?? 'CONG_VAN'),
    sender: String(input.sender),
    receiver: String(input.receiver),
    version: String(input.version ?? 'v1'),
    classification: String(input.classification ?? 'Thường'),
    status: String(input.status ?? 'Đang xử lý'),
    createdAt: normalizedCreatedAt,
    attachments: Array.isArray(input.attachments) ? input.attachments.map((x) => String(x)) : [],
    signProvider: String(input.signProvider ?? 'USB Token / HSM'),
    signStatus: String(input.signStatus ?? 'Chưa ký'),
    signedPositions: Number.isFinite(input.signedPositions) ? Number(input.signedPositions) : 0,
  };
}

function parseDocumentDate(value: string) {
  const trimmed = value.trim();
  const isoTime = Date.parse(trimmed);
  if (!Number.isNaN(isoTime)) return isoTime;

  const match = trimmed.match(
    /^(?:(\d{1,2}):(\d{2})(?::(\d{2}))?[,\s]+)?(\d{1,2})\/(\d{1,2})\/(\d{4})$|^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (!match) return 0;

  if (match[1] || match[4]) {
    const [, hh = '0', min = '0', ss = '0', dd = '1', mm = '1', yyyy = '1970'] = match;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss)).getTime();
  }

  const [, , , , , , dd = '1', mm = '1', yyyy = '1970', hh = '0', min = '0', ss = '0'] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss)).getTime();
}

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
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart, setCdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd, setCdateEnd] = useState(defaultDates.cdateEnd);

  const [unitOptions, setUnitOptions] = useState<UnitOption[]>(defaultUnits);
  const [selectedReceivers, setSelectedReceivers] = useState<UnitOption[]>([defaultUnits[4]]);

  const [documentList, setDocumentList] = useState<ManagedDocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ManagedDocumentRecord>(emptyDocumentForm);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [detailDoc, setDetailDoc] = useState<ManagedDocumentRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ManagedDocumentRecord | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch Units catalog (PARENT_CODE = DON_VI)
  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await dmCategoryApi.getList({ searchField: { PARENT_CODE: 'DON_VI' } });
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((u) => ({ code: u.code, name: u.name }));
          setUnitOptions(mapped);
          if (mapped.length > 1) {
            setSelectedReceivers([mapped[1]]);
            setFormValues((p) => ({ ...p, sender: mapped[0].code, receiver: mapped[1].code }));
          }
        }
      } catch (e) {
        console.warn('Unable to load units from API, using defaults', e);
      }
    }
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchApiDocuments();
  }, [cdateStart, cdateEnd]);

  async function fetchApiDocuments() {
    setLoading(true);
    try {
      const res = await documentsApi.getList({
        pageIndex: 1,
        pageSize: 200,
        cdateStart,
        cdateEnd,
      });
      if (res.data) {
        const mapped: ManagedDocumentRecord[] = res.data.map((doc) => ({
          code: doc.documentNo || doc.code || `VB-${doc.id}`,
          title: doc.subject || 'Văn bản điện tử',
          type: doc.documentType || 'CONG_VAN',
          sender: doc.senderName || doc.senderCode || 'Cơ quan gửi',
          receiver: 'Đơn vị liên thông',
          version: 'v1',
          classification: 'Thường',
          status: doc.status || 'Đang xử lý',
          createdAt: doc.cdate || new Date().toLocaleDateString('vi-VN'),
          attachments: [`${(doc.documentNo || 'vb').replace(/\//g, '_')}.pdf`],
          signProvider: 'USB Token / HSM',
          signStatus: doc.status === 'Đã phát hành' ? 'Đã ký số' : 'Chưa ký',
          signedPositions: doc.status === 'Đã phát hành' ? 1 : 0,
        }));
        setDocumentList(mapped);
      }
    } catch (err) {
      console.warn('API DOCUMENTS/GetList error', err);
    } finally {
      setLoading(false);
    }
  }

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
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url));
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
    const defaultSender = unitOptions.length > 0 ? unitOptions[0].code : 'BXD';
    const defaultRecs = unitOptions.length > 1 ? [unitOptions[1]] : [defaultUnits[0]];
    setSelectedReceivers(defaultRecs);
    setFormValues({
      ...emptyDocumentForm,
      code: `VB-2026-${String(Date.now()).slice(-6)}`,
      sender: defaultSender,
      receiver: defaultRecs.map((r) => r.code).join(', '),
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
    setDetailTab(0);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(event.target.files ?? []);
    if (newFiles.length === 0) return;

    setAttachmentFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const toAdd = newFiles.filter((f) => !existing.has(f.name));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });

    setFormValues((prev) => {
      const existing = new Set(prev.attachments);
      const toAddNames = newFiles.map((f) => f.name).filter((n) => !existing.has(n));
      return toAddNames.length > 0 ? { ...prev, attachments: [...prev.attachments, ...toAddNames] } : prev;
    });

    event.target.value = '';
  }

  function handleRemoveAttachment(fileName: string) {
    setFormValues((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((item) => item !== fileName),
    }));
    setAttachmentFiles((prev) => prev.filter((f) => f.name !== fileName));
  }

  function handleOpenSignStudio() {
    if (!formValues.title || !formValues.sender || !formValues.receiver || formValues.attachments.length === 0) return;
    setOpenSignDialog(true);
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const slice = bytes.subarray(i, i + chunkSize);
      let chunkBinary = '';
      for (let j = 0; j < slice.length; j += 1) {
        chunkBinary += String.fromCharCode(slice[j]);
      }
      binary += chunkBinary;
    }
    return btoa(binary);
  }

  async function fileToBase64(file: File) {
    const buf = await file.arrayBuffer();
    return arrayBufferToBase64(buf);
  }

  function getDemoAttachmentUrl(code: string, fileName?: string) {
    if (!fileName) return undefined;
    return `/api/demo-documents/file?code=${encodeURIComponent(code)}&fileName=${encodeURIComponent(fileName)}`;
  }

  async function saveDocumentToDemoStorage(
    document: ManagedDocumentRecord,
    attachmentsPayload: { fileName: string; contentType: string; base64: string }[] = []
  ) {
    const resp = await fetch('/api/demo-documents/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document,
        attachments: attachmentsPayload,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(text || `HTTP ${resp.status}`);
    }

    return resp.json();
  }

  async function handleSubmit() {
    if (!formValues.code || !formValues.title || !formValues.sender || !formValues.receiver || formValues.attachments.length === 0) return;

    try {
      const attachmentsPayload = await Promise.all(
        attachmentFiles.map(async (file) => ({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          base64: await fileToBase64(file),
        }))
      );

      const saved = await saveDocumentToDemoStorage(formValues, attachmentsPayload);

      if (editingCode) {
        setDocumentList((prev) => prev.map((d) => (d.code === editingCode ? formValues : d)));
      } else {
        setDocumentList((prev) => [formValues, ...prev]);
      }

      setOpenForm(false);
      setAttachmentFiles([]);
      enqueueSnackbar(`Đã lưu demo: ${saved?.savedTo ?? 'OK'}`, { variant: 'success' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Lỗi không xác định';
      enqueueSnackbar(`Tạo văn bản thất bại: ${message}`, { variant: 'error' });
    }
  }

  return (
    <PageShell
      title="Document Management"
      subtitle="Quản lý toàn bộ vòng đời văn bản điện tử: tạo mới, metadata, file đính kèm, ký số, gửi nhận và kết nối API /DOCUMENTS/Create."
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

      <Stack direction="row" justifyContent="flex-end">
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={lifecycleExpanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} />}
          onClick={() => setLifecycleExpanded((prev) => !prev)}
        >
          {lifecycleExpanded ? 'Thu gọn' : 'Mở rộng'}
        </Button>
      </Stack>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        <Box>
          <SectionCard
            title="Vòng đời văn bản"
            subtitle="Chuỗi xử lý từ tạo mới đến lưu trữ hoặc hủy."
          >
            {lifecycleExpanded && (
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(5,1fr)' } }}>
                {documentLifecycle.map((step, index) => (
                  <Box key={step} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral', textAlign: 'center' }}>
                    <Typography variant="overline" color="text.secondary" display="block">
                      Bước {index + 1}
                    </Typography>
                    <Typography variant="subtitle2">{step}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            {!lifecycleExpanded && (
              <Typography variant="body2" color="text.secondary">
                Đã thu gọn {documentLifecycle.length} bước vòng đời văn bản. Bấm &quot;Mở rộng&quot; để xem chi tiết.
              </Typography>
            )}
          </SectionCard>
        </Box>

        <Box>
          <SectionCard
            title="Ký số & lưu trữ"
            subtitle="Những điểm chính trong luồng xử lý văn bản."
          >
            {lifecycleExpanded ? (
              <Stack spacing={1.5}>
                {[
                  { icon: 'solar:shield-check-bold', label: 'Bắt buộc ký số', text: 'Luồng thêm mới hỗ trợ tải tệp và mở popup ký số ngay trong form.' },
                  { icon: 'solar:folder-bold', label: 'Lưu trữ tệp', text: 'Mỗi văn bản có thể chứa nhiều tệp đính kèm để theo dõi bản chính và phụ lục.' },
                  { icon: 'solar:clipboard-list-bold', label: 'Nhật ký kiểm toán', text: 'Ghi nhận thao tác tạo, tải tệp, ký số, phát hành và gửi liên thông.' },
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
            ) : (
              <Typography variant="body2" color="text.secondary">
                Đã thu gọn phần ký số &amp; lưu trữ. Bấm &quot;Mở rộng&quot; để xem chi tiết.
              </Typography>
            )}
          </SectionCard>
        </Box>
      </Box>

      <SectionCard
        title="Danh sách văn bản"
        subtitle="Kết nối trực tiếp API DOCUMENTS/Create & GetList; hỗ trợ chọn nơi gửi và nhiều nơi nhận."
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
              type="date"
              label="Từ ngày (CDATE_START)"
              InputLabelProps={{ shrink: true }}
              value={cdateStart}
              onChange={(e) => setCdateStart(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              type="date"
              label="Đến ngày (CDATE_END)"
              InputLabelProps={{ shrink: true }}
              value={cdateEnd}
              onChange={(e) => setCdateEnd(e.target.value)}
              sx={{ minWidth: 160 }}
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

      <Dialog open={Boolean(detailDoc)} onClose={() => setDetailDoc(null)} fullWidth maxWidth="xl">
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
                <Tab label="Ký số" icon={<Iconify icon="solar:shield-check-bold" width={16} />} iconPosition="start" sx={{ minHeight: 40 }} />
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
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2">Giao diện ký số văn bản</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nhà cung cấp: {detailDoc.signProvider} | Trạng thái: {detailDoc.signStatus} | Vị trí ký: {detailDoc.signedPositions}
                    </Typography>
                  </Box>

                  <SignatureStudio
                    files={detailDoc.attachments.map((name) => ({
                      fileName: name,
                      fileUrl: getDemoAttachmentUrl(detailDoc.code, name),
                    }))}
                    onSignComplete={async (signatures) => {
                      const updatedDoc: ManagedDocumentRecord = {
                        ...detailDoc,
                        signStatus: 'Đã ký số',
                        status: detailDoc.status === 'Đang xử lý' ? 'Chờ ký số' : detailDoc.status,
                        signedPositions: signatures.length,
                      };

                      try {
                        await saveDocumentToDemoStorage(updatedDoc);
                        setDocumentList((prev) => prev.map((doc) => (doc.code === updatedDoc.code ? updatedDoc : doc)));
                        setDetailDoc(updatedDoc);
                        enqueueSnackbar('Đã cập nhật trạng thái ký số cho văn bản', { variant: 'success' });
                      } catch (e) {
                        const message = e instanceof Error ? e.message : 'Lỗi không xác định';
                        enqueueSnackbar(`Cập nhật ký số thất bại: ${message}`, { variant: 'error' });
                      }
                    }}
                  />
                </Stack>
              )}

              {detailTab === 3 && (
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

              {detailTab === 4 && (
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

                  <Stack direction="row" spacing={1} flexWrap="wrap">
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
          <Button
            onClick={() => {
              setOpenForm(false);
              setAttachmentFiles([]);
            }}
          >
            Hủy
          </Button>
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
            files={formValues.attachments.map((name) => ({
              fileName: name,
              fileUrl: formAttachmentPreviewUrls[name] ?? getDemoAttachmentUrl(formValues.code, name),
            }))}
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
