import { useMemo, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Iconify from '../../../components/iconify';
import { DataTable, GridRow, MetricCard, SectionCard } from '../../../sections/interoperability/components';
import { dmCategoryApi } from '../../../services/dmCategoryApi';
import { certificateApi, CertificateItem } from '../../../services/certificateApi';
import { getDefaultDateRange } from '../../../services/getDefaultDateRange';
import { formatTime } from '../../../utils/formatTime';
import { isApiSuccess } from '../../../utils/axios';
import useLoading from '../../../hooks/useLoading';

export type CertRecord = {
  id?: number;
  unitCode: string;
  unitName: string;
  serialNumber: string;
  issuer: string;
  subjectName: string;
  validFrom: string;
  validTo: string;
  status: 'Active' | 'Expired';
  certType: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  certData?: string;
  updatedAt: string;
};

const emptyCertForm: CertRecord = {
  unitCode: '',
  unitName: '',
  serialNumber: '',
  issuer: '',
  subjectName: '',
  validFrom: '',
  validTo: '',
  status: 'Active',
  certType: 'SIGNING',
  filePath: '',
  fileName: '',
  fileSize: 0,
  certData: '',
  updatedAt: '',
};

const ACCEPTED_EXTENSIONS = ['.crt', '.cer', '.pem', '.pfx', '.p12'];
const MAX_FILE_SIZE_MB = 10;

// Icon + màu theo phần mở rộng file, giúp nhận diện loại chứng thư nhanh hơn
function getCertFileMeta(fileName: string) {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'pfx':
    case 'p12':
      return { icon: 'solar:lock-keyhole-bold-duotone', color: '#9E50FE', label: 'PKCS#12 (có khóa riêng)' };
    case 'pem':
      return { icon: 'solar:code-square-bold-duotone', color: '#01AD65', label: 'PEM' };
    default:
      return { icon: 'solar:shield-check-bold-duotone', color: '#028EDD', label: 'X.509' };
  }
}

// Trạng thái hiệu lực + số ngày còn lại, giúp người dùng ước lượng nhanh khi tới hạn
function getValidityInfo(validTo?: string) {
  if (!validTo) return null;
  const end = new Date(validTo.split('/').reverse().join('-')); // dd/mm/yyyy -> yyyy-mm-dd
  if (Number.isNaN(end.getTime())) return null;
  const diffDays = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Đã hết hạn', color: 'error' as const, days: diffDays };
  if (diffDays <= 30) return { label: `Còn ${diffDays} ngày`, color: 'warning' as const, days: diffDays };
  return { label: `Còn ${diffDays} ngày`, color: 'success' as const, days: diffDays };
}

export interface CertificateTabRef {
  openCreateForUnit: (unitCode: string, unitName: string) => void;
}

const CertificateTab = forwardRef<CertificateTabRef, {}>((_, ref) => {
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [cdateStart] = useState(defaultDates.cdateStart);
  const [cdateEnd] = useState(defaultDates.cdateEnd);

  // Pagination states - Certificates
  const [certPageIndex, setCertPageIndex] = useState(1);
  const [certPageSize, setCertPageSize] = useState(10);
  const [certKeyword, setCertKeyword] = useState('');

  // Modals state
  const [openCertEditor, setOpenCertEditor] = useState(false);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [certFormValues, setCertFormValues] = useState<CertRecord>(emptyCertForm);
  const [deletingCertId, setDeletingCertId] = useState<number | null>(null);
  const [isParsingCert, setIsParsingCert] = useState(false);

  // Upload UX state
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [pfxPassword, setPfxPassword] = useState('');
  const [showPfxPassword, setShowPfxPassword] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useImperativeHandle(ref, () => ({
    openCreateForUnit(unitCode: string, unitName: string) {
      handleOpenCreateCert(unitCode, unitName);
    },
  }));

  // Query danh sách đơn vị cho Autocomplete Chữ ký số (Lọc PARENT_CODE = DON_VI hoặc đơn vị con)
  const { data: unitOptions = [] } = useQuery<{ code: string; name: string; label: string }[]>({
    queryKey: ['unitsDropdownOptions'],
    queryFn: async () => {
      const res = await dmCategoryApi.getList({ pageIndex: 1, pageSize: 500 });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);

      // Lọc các đơn vị có PARENT_CODE = DON_VI hoặc là đơn vị con của PARENT_CODE = DON_VI
      const validUnitCodes = new Set<string>();
      let addedNew = true;
      while (addedNew) {
        addedNew = false;
        rawList.forEach((item: any) => {
          const code = String(item.CODE || item.code || '').trim();
          const parentCode = String(item.PARENT_CODE || item.parentCode || '').trim();
          if (code && !validUnitCodes.has(code)) {
            if (parentCode.toUpperCase() === 'DON_VI' || validUnitCodes.has(parentCode)) {
              validUnitCodes.add(code);
              addedNew = true;
            }
          }
        });
      }

      const options: { code: string; name: string; label: string }[] = [];
      const seen = new Set<string>();
      rawList.forEach((item: any) => {
        const code = String(item.CODE || item.code || '').trim();
        const name = String(item.NAME || item.name || '').trim();
        if (code && validUnitCodes.has(code) && !seen.has(code)) {
          seen.add(code);
          options.push({
            code,
            name: name || code,
            label: name ? `${code} - ${name}` : code,
          });
        }
      });
      return options;
    },
  });

  // TanStack Query: Fetch Certificates
  const { data: certData, isFetching: isFetchingCerts, refetch: refetchCerts } = useQuery<{ rows: CertRecord[]; total: number }>({
    queryKey: ['certificates', certPageIndex, certPageSize, cdateStart, cdateEnd],
    queryFn: async () => {
      const res = await certificateApi.getList({
        pageIndex: certPageIndex,
        pageSize: certPageSize,
        cdateStart,
        cdateEnd,
      });
      const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
      const total = res?.TotalRecords ?? res?.totalRecords ?? (rawList ? rawList.length : 0);
      if (!rawList) return { rows: [], total: 0 };
      const mapped: CertRecord[] = rawList.map((item: any) => ({
        id: item.ID || item.id,
        unitCode: item.UNIT_CODE || item.unitCode || '',
        unitName: item.UNIT_NAME || item.unitName || item.UNIT_CODE || '',
        serialNumber: item.SERIAL_NUMBER || item.serialNumber || '',
        issuer: item.ISSUER || item.issuer || 'Ban Cơ yếu Chính phủ (VGCA)',
        subjectName: item.SUBJECT_NAME || item.subjectName || '',
        validFrom: formatTime(item.VALID_FROM || item.validFrom),
        validTo: formatTime(item.VALID_TO || item.validTo),
        status: (item.STATUS !== undefined ? item.STATUS : 1) === 1 ? 'Active' : 'Expired',
        certType: item.CERT_TYPE || item.certType || 'SIGNING',
        filePath: item.FILE_PATH || item.filePath || 'minio://certs/',
        fileName: item.FILE_NAME || item.fileName || '',
        fileSize: item.FILE_SIZE || item.fileSize || 0,
        updatedAt: formatTime(item.CDATE || item.cdate),
      }));
      return { rows: mapped, total };
    },
    placeholderData: keepPreviousData,
  });

  const certRows = certData?.rows || [];
  const totalCertCount = certData?.total || 0;

  // Save Cert Mutation
  const saveCertMutation = useMutation({
    mutationFn: (item: CertificateItem) => certificateApi.createOrUpdate(item),
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['certificates'] });
        refetchCerts();
        setOpenCertEditor(false);
      }
    },
  });

  // Delete Cert Mutation
  const deleteCertMutation = useMutation({
    mutationFn: (id: number) => certificateApi.delete(id),
    onMutate: () => showLoading(),
    onSettled: () => hideLoading(),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        queryClient.invalidateQueries({ queryKey: ['certificates'] });
        refetchCerts();
      }
      setDeletingCertId(null);
    },
  });

  const filteredCerts = useMemo(() => {
    const q = certKeyword.trim().toLowerCase();
    if (!q) return certRows;
    return certRows.filter(
      (c: CertRecord) =>
        c.unitCode.toLowerCase().includes(q) ||
        c.unitName.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        c.subjectName.toLowerCase().includes(q)
    );
  }, [certKeyword, certRows]);

  const certTableRows = filteredCerts.map((cert: CertRecord) => ({
    unitCode: (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {cert.unitCode}
      </Typography>
    ),
    unitName: cert.unitName || cert.unitCode,
    serialNumber: (
      <Chip label={cert.serialNumber} size="small" variant="outlined" color="primary" sx={{ fontFamily: 'monospace' }} />
    ),
    issuer: cert.issuer || 'Ban Cơ yếu Chính phủ',
    subjectName: cert.subjectName || cert.unitName,
    filePath: cert.filePath ? (
      <Chip
        icon={<Iconify icon="solar:cloud-storage-bold" width={16} />}
        label={cert.fileName || cert.filePath.split('/').pop() || 'minio-cert.crt'}
        size="small"
        color="secondary"
        variant="soft"
      />
    ) : (
      '—'
    ),
    validity: `${cert.validFrom || '—'} ➔ ${cert.validTo || '—'}`,
    expiryStatus: (() => {
      if (!cert.validTo) return <Chip label="Không rõ" size="small" variant="soft" color="default" sx={{ fontWeight: 600 }} />;
      // Parse validTo (có thể dạng dd/MM/yyyy HH:mm:ss hoặc ISO)
      let expDate: Date | null = null;
      const match = cert.validTo.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        expDate = new Date(`${match[3]}-${match[2]}-${match[1]}T23:59:59`);
      } else {
        const d = new Date(cert.validTo);
        if (!isNaN(d.getTime())) expDate = d;
      }
      if (!expDate) return <Chip label="Không rõ" size="small" variant="soft" color="default" sx={{ fontWeight: 600 }} />;
      const now = new Date();
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        return <Chip label="Đã hết hạn" size="small" color="error" variant="soft" sx={{ fontWeight: 600 }} />;
      }
      if (diffDays <= 30) {
        return <Chip label={`Còn ${diffDays} ngày`} size="small" color="warning" variant="soft" sx={{ fontWeight: 600 }} />;
      }
      return <Chip label={`Còn ${diffDays} ngày`} size="small" color="success" variant="soft" sx={{ fontWeight: 600 }} />;
    })(),
    status: (
      <Chip
        label={cert.status === 'Active' ? 'Hiệu lực' : 'Hết hạn'}
        color={cert.status === 'Active' ? 'success' : 'error'}
        size="small"
        variant="soft"
        sx={{ fontWeight: 600 }}
      />
    ),
    updatedAt: cert.updatedAt,
    actions: (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <Tooltip title="Sửa chứng thư">
          <IconButton size="small" color="primary" onClick={() => handleEditCert(cert)}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa chứng thư">
          <IconButton size="small" color="error" onClick={() => cert.id && setDeletingCertId(cert.id)}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  }));

  function handleOpenCreateCert(presetUnitCode?: string, presetUnitName?: string) {
    setEditingCertId(null);
    setFileError(null);
    setPfxPassword('');
    setShowPfxPassword(false);
    setIsPasswordRequired(false);
    setSelectedFile(null);
    setCertFormValues({
      ...emptyCertForm,
      unitCode: presetUnitCode || '',
      unitName: presetUnitName || presetUnitCode || '',
      serialNumber: '',
      fileName: '',
      filePath: '',
      issuer: '',
      subjectName: '',
      validFrom: '',
      validTo: '',
      certData: '',
    });
    setOpenCertEditor(true);
  }

  function handleEditCert(cert: CertRecord) {
    setEditingCertId(cert.id || null);
    setFileError(null);
    setPfxPassword('');
    setShowPfxPassword(false);
    setIsPasswordRequired(false);
    setSelectedFile(null);
    setCertFormValues(cert);
    setOpenCertEditor(true);
  }

  function handleSubmitCert() {
    if (!certFormValues.unitCode || !certFormValues.fileName) return;
    saveCertMutation.mutate({
      id: certFormValues.id,
      unitCode: certFormValues.unitCode,
      unitName: certFormValues.unitName,
      serialNumber: certFormValues.serialNumber,
      issuer: certFormValues.issuer,
      subjectName: certFormValues.subjectName || certFormValues.unitName,
      validFrom: certFormValues.validFrom,
      validTo: certFormValues.validTo,
      status: certFormValues.status === 'Active' ? 1 : 0,
      certType: certFormValues.certType,
      filePath: certFormValues.filePath,
      fileName: certFormValues.fileName,
      fileSize: certFormValues.fileSize,
      certData: certFormValues.certData,
    });
  }

  function validateFile(file: File): string | null {
    const ext = `.${(file.name.split('.').pop() || '').toLowerCase()}`;
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Định dạng "${ext}" không được hỗ trợ. Chỉ chấp nhận: ${ACCEPTED_EXTENSIONS.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File quá lớn (tối đa ${MAX_FILE_SIZE_MB}MB).`;
    }
    return null;
  }

  function getActiveFile(): File | null {
    if (selectedFile) return selectedFile;
    if (certFormValues.certData) {
      try {
        const byteCharacters = atob(certFormValues.certData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], certFormValues.fileName || 'certificate.pfx', { type: 'application/x-pkcs12' });
      } catch (e) {
        console.warn('Could not reconstruct File from certData base64', e);
      }
    }
    return null;
  }

  function handleFileSelected(file: File) {
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
    setIsPasswordRequired(false);
    setCertFormValues((prev) => ({
      ...prev,
      fileName: file.name,
      fileSize: file.size,
      filePath: `certificates/${prev.unitCode || 'UNIT'}_${file.name}`,
    }));
  }

  async function processCertFile(file: File, pwd?: string) {
    setFileError(null);
    setIsParsingCert(true);
    setParseProgress(15);
    const progressTimer = setInterval(() => {
      setParseProgress((p) => (p < 85 ? p + 15 : p));
    }, 200);
    try {
      const res = await certificateApi.parseFile(file, pwd);
      if (!isApiSuccess(res)) {
        const isPwdReq = res?.IsPasswordRequired || res?.isPasswordRequired;
        if (isPwdReq) {
          setIsPasswordRequired(true);
        }
        setFileError(res?.Message || 'Không thể đọc file chứng thư số.');
        return;
      }
      setIsPasswordRequired(false);
      const data = res?.Data || res?.data;

      if (data) {
        setCertFormValues((prev) => ({
          ...prev,
          serialNumber: data.SerialNumber || data.serialNumber || prev.serialNumber,
          issuer: data.Issuer || data.issuer || prev.issuer,
          subjectName: data.SubjectName || data.subjectName || prev.subjectName,
          validFrom: data.ValidFrom || data.validFrom || prev.validFrom,
          validTo: data.ValidTo || data.validTo || prev.validTo,
          fileName: data.FileName || file.name,
          fileSize: data.FileSize || file.size,
          filePath: `certificates/${prev.unitCode || 'UNIT'}_${file.name}`,
          certData: data.CertDataBase64 || '',
        }));
      } else {
        setCertFormValues((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: file.size,
          filePath: `certificates/${prev.unitCode || 'UNIT'}_${file.name}`,
        }));
      }
    } catch (parseErr: any) {
      console.warn('Backend certificate parsing error:', parseErr);
      setFileError(parseErr?.message || parseErr?.Message || 'Lỗi kết nối khi giải mã chứng thư số.');
    } finally {
      clearInterval(progressTimer);
      setParseProgress(0);
      setIsParsingCert(false);
    }
  }

  function handleClearCertFile() {
    setFileError(null);
    setPfxPassword('');
    setIsPasswordRequired(false);
    setSelectedFile(null);
    setCertFormValues((prev) => ({
      ...prev,
      fileName: '',
      fileSize: 0,
      serialNumber: '',
      issuer: '',
      subjectName: '',
      validFrom: '',
      validTo: '',
      certData: '',
      filePath: '',
    }));
  }

  const validityInfo = getValidityInfo(certFormValues.validTo);
  const certFileMeta = getCertFileMeta(certFormValues.fileName);

  return (
    <Stack spacing={3}>
      <GridRow cols={{ xs: 1, sm: 2, lg: 4 }}>
        <MetricCard
          label="Tổng Chứng thư số"
          value={totalCertCount}
          helper="Đăng ký mã hóa / ký số"
          icon="solar:shield-keyhole-bold"
          backgroundColor="#028EDD"
        />
        <MetricCard
          label="Hiệu lực"
          value={certRows.filter((c) => c.status === 'Active').length}
          helper="Đang hoạt động"
          icon="solar:check-circle-bold"
          backgroundColor="#01AD65"
        />
        <MetricCard
          label="Hết hạn / Khóa"
          value={certRows.filter((c) => c.status === 'Expired').length}
          helper="Cần cấp lại"
          icon="solar:danger-bold"
          backgroundColor="#FF8551"
        />
        <MetricCard
          label="Kho lưu trữ"
          value="Object Storage"
          helper="Lưu trữ tập tin an toàn"
          icon="solar:cloud-storage-bold"
          backgroundColor="#9E50FE"
        />
      </GridRow>

      <SectionCard
        title="Quản lý Chứng thư số PKI"
        subtitle="Quản lý chứng thư số ký văn bản điện tử và chứng thư kết nối liên thông của các đơn vị."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => refetchCerts()} disabled={isFetchingCerts}>
              {isFetchingCerts ? 'Đang tải...' : 'Làm mới'}
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:file-key-bold" />} onClick={() => handleOpenCreateCert()}>
              Thêm chứng thư số
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Tìm kiếm chứng thư"
              value={certKeyword}
              onChange={(e) => setCertKeyword(e.target.value)}
              placeholder="Mã đơn vị, Serial, Nhà cấp phát (CA), Tên đơn vị..."
              sx={{ flex: 1 }}
            />
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <DataTable
              columns={[
                { key: 'unitCode', label: 'Mã Đơn vị' },
                { key: 'unitName', label: 'Tên Đơn vị' },
                { key: 'serialNumber', label: 'Serial Number' },
                { key: 'issuer', label: 'Nhà cấp phát (CA)' },
                { key: 'filePath', label: 'Đường dẫn file' },
                { key: 'validity', label: 'Thời hạn hiệu lực' },
                { key: 'expiryStatus', label: 'Hiệu lực', align: 'center' },
                { key: 'status', label: 'Trạng thái', align: 'center' },
                { key: 'actions', label: 'Thao tác', align: 'right' },
              ]}
              rows={certTableRows}
              loading={isFetchingCerts}
              pageIndex={certPageIndex}
              rowsPerPage={certPageSize}
              totalCount={totalCertCount}
              onPageChange={(p) => setCertPageIndex(p)}
              onRowsPerPageChange={(s) => {
                setCertPageSize(s);
                setCertPageIndex(1);
              }}
            />
          </Box>
        </Stack>
      </SectionCard>

      {/* Editor Modal - Certificate */}
      <Dialog open={openCertEditor} onClose={() => setOpenCertEditor(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingCertId ? 'Cập nhật Chứng thư số' : 'Thêm mới Chứng thư số'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Bước 1: Chọn đơn vị sở hữu */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Avatar sx={{ width: 26, height: 26, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>1</Avatar>
                <Typography variant="subtitle2">Chọn đơn vị sở hữu chứng thư</Typography>
              </Stack>
              <Autocomplete
                options={unitOptions}
                getOptionLabel={(option: any) => option.label || option.name || option.code || ''}
                value={
                  unitOptions.find(
                    (u: any) =>
                      u.code === certFormValues.unitCode ||
                      u.name === certFormValues.unitName ||
                      u.code === certFormValues.unitName
                  ) || (certFormValues.unitCode ? { code: certFormValues.unitCode, name: certFormValues.unitName || certFormValues.unitCode, label: certFormValues.unitName || certFormValues.unitCode } : null)
                }
                onChange={(_, newValue: any) => {
                  const code = newValue ? newValue.code : '';
                  const name = newValue ? newValue.name || newValue.label : '';
                  setCertFormValues((prev) => ({
                    ...prev,
                    unitCode: code,
                    unitName: name || code,
                  }));
                }}
                renderInput={(params: any) => (
                  <TextField {...params} fullWidth placeholder="Tìm và chọn đơn vị sở hữu chứng thư số..." />
                )}
              />
            </Grid>

            {/* Bước 2: Upload file chứng thư số (drag & drop) */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Avatar sx={{ width: 26, height: 26, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>2</Avatar>
                <Typography variant="subtitle2">Tải lên file chứng thư số</Typography>
              </Stack>

              <Box
                component="label"
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  if (!isParsingCert) setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={(e: React.DragEvent) => {
                  e.preventDefault();
                  setIsDragActive(false);
                  if (isParsingCert) return;
                  const droppedFiles = Array.from(e.dataTransfer.files ?? []);
                  if (droppedFiles.length > 0) handleFileSelected(droppedFiles[0]);
                }}
                sx={{
                  p: 3,
                  display: 'block',
                  textAlign: 'center',
                  border: (theme) =>
                    `1px solid ${fileError ? theme.palette.error.main : isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: 2,
                  cursor: isParsingCert ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  bgcolor: (theme) =>
                    isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                  },
                }}
              >
                <input
                  type="file"
                  accept={ACCEPTED_EXTENSIONS.join(',')}
                  hidden
                  disabled={isParsingCert}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                    e.target.value = '';
                  }}
                />
                {isParsingCert ? (
                  <Stack spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Iconify icon="solar:shield-check-bold-duotone" width={32} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Đang giải mã thông tin file chứng thư...
                    </Typography>
                    <Box sx={{ width: '100%', maxWidth: 300 }}>
                      <LinearProgress variant="determinate" value={parseProgress} sx={{ borderRadius: 1, height: 5 }} />
                    </Box>
                  </Stack>
                ) : (
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
                        transform: isDragActive ? 'scale(1.08)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Iconify icon="solar:cloud-upload-bold-duotone" width={32} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {isDragActive ? 'Thả tệp vào đây' : 'Nhấp để chọn tệp hoặc kéo thả vào đây'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Hỗ trợ {ACCEPTED_EXTENSIONS.join(', ')} — Tối đa {MAX_FILE_SIZE_MB}MB/tệp
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Box>

              {certFormValues.fileName && !isParsingCert && (
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 1.5,
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
                        width: 40,
                        height: 40,
                        borderRadius: 1.25,
                        bgcolor: alpha(certFileMeta.color, 0.12),
                        color: certFileMeta.color,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={certFileMeta.icon} width={24} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={certFormValues.fileName}
                      >
                        {certFormValues.fileName}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                        <Typography variant="caption" color="text.secondary">
                          {certFormValues.fileSize ? (certFormValues.fileSize / 1024).toFixed(1) : 0} KB
                        </Typography>
                        <Chip size="small" label={certFileMeta.label} variant="soft" sx={{ height: 20, fontSize: 11 }} />
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title="Gỡ file">
                      <IconButton size="small" color="error" onClick={handleClearCertFile}>
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              )}

              {fileError && (
                <Alert severity={isPasswordRequired ? 'warning' : 'error'} sx={{ mt: 1.5 }} onClose={() => setFileError(null)}>
                  {fileError}
                </Alert>
              )}

              {/* Ô nhập mật khẩu mở file PFX/PKCS12 */}
              <Paper
                variant="outlined"
                sx={{
                  mt: 1.5,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                  borderColor: isPasswordRequired ? 'warning.main' : 'divider',
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:lock-keyhole-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="primary.main">
                      Mật khẩu giải mã PFX / PKCS12 (nếu có)
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <TextField
                      fullWidth
                      size="small"
                      type={showPfxPassword ? 'text' : 'password'}
                      label="Mật khẩu mở file PFX"
                      value={pfxPassword}
                      onChange={(e) => setPfxPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mở file PFX..."
                      helperText="Nếu file .pfx/.p12 có mật khẩu khóa bảo vệ, hãy nhập mật khẩu tại đây rồi bấm Giải mã hoặc chọn file."
                      autoComplete="off"
                      inputProps={{
                        autoComplete: 'new-password',
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPfxPassword((show) => !show)}
                              edge="end"
                              size="small"
                            >
                              <Iconify icon={showPfxPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      sx={{ height: 40, minWidth: 100, flexShrink: 0 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const targetFile = getActiveFile();
                        if (targetFile) {
                          processCertFile(targetFile, pfxPassword);
                        }
                      }}
                      disabled={isParsingCert || !getActiveFile()}
                    >
                      {isParsingCert ? 'Đang đọc...' : 'Giải mã'}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Bước 3: Tóm tắt thông tin trích xuất tự động từ Chứng thư số */}
            {certFormValues.serialNumber && !isParsingCert && (
              <Grid item xs={12}>
                <Fade in>
                  <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ px: 2, py: 1.25, bgcolor: 'background.neutral' }}
                    >
                      <Iconify icon="solar:document-text-bold-duotone" width={18} sx={{ color: 'text.secondary' }} />
                      <Typography variant="subtitle2">Thông tin trích xuất tự động</Typography>
                      <Chip
                        size="small"
                        color="success"
                        variant="soft"
                        icon={<Iconify icon="solar:check-circle-bold" width={14} />}
                        label="Đã xác thực từ file"
                        sx={{ ml: 'auto' }}
                      />
                    </Stack>
                    <Divider />
                    <Grid container>
                      {[
                        { icon: 'solar:hashtag-square-bold-duotone', label: 'Serial Number', value: certFormValues.serialNumber },
                        { icon: 'solar:buildings-3-bold-duotone', label: 'Nhà cấp phát (CA)', value: certFormValues.issuer },
                        { icon: 'solar:user-id-bold-duotone', label: 'Tên chủ thể', value: certFormValues.subjectName },
                        {
                          icon: 'solar:folder-cloud-bold-duotone',
                          label: 'Vị trí lưu trữ (Object Key)',
                          value: certFormValues.filePath,
                        },
                      ].map((row) => (
                        <Grid item xs={12} sm={6} key={row.label}>
                          <Stack direction="row" spacing={1.25} sx={{ px: 2, py: 1.5 }}>
                            <Iconify icon={row.icon} width={20} sx={{ color: 'text.disabled', mt: 0.25 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="caption" color="text.secondary">
                                {row.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, wordBreak: 'break-word' }}
                                title={row.value}
                              >
                                {row.value || '—'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      ))}

                      <Grid item xs={12}>
                        <Divider />
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.25}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          justifyContent="space-between"
                          sx={{ px: 2, py: 1.5 }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Iconify icon="solar:calendar-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Thời hạn hiệu lực
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {certFormValues.validFrom || '—'} ➔ {certFormValues.validTo || '—'}
                              </Typography>
                            </Box>
                          </Stack>
                          {validityInfo && (
                            <Chip size="small" color={validityInfo.color} variant="soft" label={validityInfo.label} sx={{ fontWeight: 600 }} />
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCertEditor(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmitCert}
            disabled={!certFormValues.unitCode || !certFormValues.fileName || isParsingCert}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Cert Confirmation */}
      <Dialog open={Boolean(deletingCertId)} onClose={() => setDeletingCertId(null)}>
        <DialogTitle>Xác nhận xóa chứng thư số</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Bạn có chắc chắn muốn xóa chứng thư số này khỏi hệ thống?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCertId(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={() => deletingCertId && deleteCertMutation.mutate(deletingCertId)}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
});

export default CertificateTab;