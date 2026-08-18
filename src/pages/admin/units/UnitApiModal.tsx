import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axiosInstance from '../../../utils/axios';
import Iconify from '../../../components/iconify';
import { sysShareCorpTokenApi, sysShareServicesApi, SysShareCorpTokenItem, SysShareServiceItem } from '../../../services/sysShareApi';
import { formatTime } from '../../../utils/formatTime';
import { HOST_API_KEY } from '../../../config';
import { DMCategoryItem } from '../../../services/dmCategoryApi';

const INTEGRATION_APIS = [
  {
    code: 'DOC_CREATE',
    name: 'Tạo văn bản gốc & Upload tệp đính kèm',
    method: 'POST',
    endpoint: '/DOCUMENTS/CreateBundle',
    description: 'Khởi tạo hồ sơ văn bản liên thông mới và tải lên toàn bộ các tệp tài liệu đính kèm (PDF, DOCX).',
    fields: [
      { name: 'Code', type: 'String', required: true, desc: 'Số / Ký hiệu văn bản (Ví dụ: VB-2026/001)' },
      { name: 'Name', type: 'String', required: true, desc: 'Trích yếu nội dung / Tên văn bản' },
      { name: 'Type', type: 'String', required: false, desc: 'Loại văn bản (Quyết định, Công văn, Thông báo...)' },
      { name: 'Org', type: 'String', required: true, desc: 'Mã đơn vị phát hành (CORP_CODE)' },
      { name: 'Attachments', type: 'Array', required: false, desc: 'Danh sách tệp đính kèm: [{ FileName, FileBase64 }]' },
    ],
    samplePayload: `{
  "Code": "VB-2026/001",
  "Name": "Văn bản chỉ đạo liên thông",
  "Type": "Quyết định",
  "Org": "<CORP_CODE>",
  "Attachments": [
    {
      "FileName": "vaban.pdf",
      "FileBase64": "JVBERi0xLjQK..."
    }
  ]
}`,
    responseFields: [
      { name: 'ResultCode', type: 'String', required: true, desc: 'Mã kết quả xử lý (200: Thành công, 400: Lỗi dữ liệu, 500: Lỗi hệ thống)' },
      { name: 'Message', type: 'String', required: true, desc: 'Thông điệp thông báo kết quả xử lý' },
      { name: 'Timestamp', type: 'Number', required: true, desc: 'Thời điểm hệ thống phản hồi (Unix Timestamp)' },
      { name: 'Data.ID', type: 'Number', required: false, desc: 'ID bản ghi văn bản khởi tạo trong CSDL' },
      { name: 'Data.Code', type: 'String', required: false, desc: 'Số / Ký hiệu văn bản được lưu' },
      { name: 'Data.Status', type: 'Number', required: false, desc: 'Trạng thái bản ghi văn bản' },
    ],
    sampleResponse: `{
  "ResultCode": "200",
  "Message": "Tạo văn bản và đính kèm tệp thành công.",
  "Timestamp": 1787052170,
  "Data": {
    "ID": 1024,
    "Code": "VB-2026/001",
    "Status": 1
  }
}`,
  },
  {
    code: 'DOC_SEND',
    name: 'Gửi văn bản liên thông',
    method: 'POST',
    endpoint: '/IN_DIP_Hub/Send',
    description: 'Phát hành thông điệp liên thông và gửi văn bản từ đơn vị gửi sang đơn vị nhận.',
    fields: [
      { name: 'Document_Id', type: 'String', required: true, desc: 'Mã / ID định danh văn bản cần gửi' },
      { name: 'Sender_Code', type: 'String', required: true, desc: 'Mã đơn vị gửi (CORP_CODE)' },
      { name: 'Receiver_Code', type: 'String', required: true, desc: 'Mã đơn vị nhận văn bản' },
      { name: 'Content', type: 'String', required: false, desc: 'Ghi chú / Trích yếu nội dung chuyển giao' },
    ],
    samplePayload: `{
  "Document_Id": "DOC_2026_001",
  "Sender_Code": "<CORP_CODE>",
  "Receiver_Code": "RECEIVER_UNIT",
  "Content": "Gửi văn bản liên thông xử lý công việc"
}`,
    responseFields: [
      { name: 'ResultCode', type: 'String', required: true, desc: 'Mã kết quả gửi văn bản (200: Gửi thành công)' },
      { name: 'Message', type: 'String', required: true, desc: 'Thông điệp kết quả gửi văn bản' },
      { name: 'Timestamp', type: 'Number', required: true, desc: 'Thời điểm phản hồi (Unix Timestamp)' },
      { name: 'Data.Document_Id', type: 'String', required: false, desc: 'Mã ID định danh văn bản được gửi' },
      { name: 'Data.Status', type: 'String', required: false, desc: 'Trạng thái phát hành (SENT)' },
    ],
    sampleResponse: `{
  "ResultCode": "200",
  "Message": "Gửi văn bản liên thông thành công.",
  "Timestamp": 1787052170,
  "Data": {
    "Document_Id": "DOC_2026_001",
    "Status": "SENT"
  }
}`,
  },
  {
    code: 'DOC_ACK',
    name: 'Phản hồi biên nhận ACK / NACK',
    method: 'POST',
    endpoint: '/IN_DIP_Hub/Ack',
    description: 'Phản hồi trạng thái tiếp nhận hoặc xử lý văn bản cho đơn vị gửi.',
    fields: [
      { name: 'Document_Id', type: 'String', required: true, desc: 'Mã / ID định danh văn bản tiếp nhận' },
      { name: 'Receiver_Code', type: 'String', required: true, desc: 'Mã đơn vị gửi phản hồi (CORP_CODE)' },
      { name: 'Status', type: 'String', required: true, desc: 'Trạng thái: "ACK" (Đã nhận thành công) hoặc "NACK" (Từ chối / Lỗi)' },
    ],
    samplePayload: `{
  "Document_Id": "DOC_2026_001",
  "Receiver_Code": "<CORP_CODE>",
  "Status": "ACK"
}`,
    responseFields: [
      { name: 'ResultCode', type: 'String', required: true, desc: 'Mã kết quả phản hồi (200: Cập nhật thành công)' },
      { name: 'Message', type: 'String', required: true, desc: 'Thông điệp thông báo kết quả ghi nhận biên nhận' },
      { name: 'Timestamp', type: 'Number', required: true, desc: 'Thời điểm phản hồi (Unix Timestamp)' },
      { name: 'Data.Document_Id', type: 'String', required: false, desc: 'Mã ID định danh văn bản tiếp nhận' },
      { name: 'Data.Status', type: 'String', required: false, desc: 'Trạng thái biên nhận được cập nhật (ACK / NACK)' },
    ],
    sampleResponse: `{
  "ResultCode": "200",
  "Message": "Cập nhật trạng thái biên nhận ACK thành công.",
  "Timestamp": 1787052170,
  "Data": {
    "Document_Id": "DOC_2026_001",
    "Status": "ACK"
  }
}`,
  },
  {
    code: 'DOC_GET_LIST',
    name: 'Tra cứu danh sách văn bản liên thông',
    method: 'POST',
    endpoint: '/DM_CATEGORY/GetListUnits',
    description: 'Lấy danh sách văn bản đến và đi theo bộ lọc thời gian và trạng thái.',
    fields: [
      { name: 'PageIndex', type: 'Number', required: false, desc: 'Số trang cần lấy (Mặc định: 1)' },
      { name: 'PageSize', type: 'Number', required: false, desc: 'Số bản ghi / trang (Mặc định: 20)' },
      { name: 'SearchField', type: 'Object', required: false, desc: 'Bộ lọc: { STATUS, CORP_CODE, DATE_START, DATE_END }' },
    ],
    samplePayload: `{
  "PageIndex": 1,
  "PageSize": 20,
  "SearchField": {
    "STATUS": "RECEIVED"
  }
}`,
    responseFields: [
      { name: 'ResultCode', type: 'String', required: true, desc: 'Mã kết quả tra cứu (200: Thành công)' },
      { name: 'Message', type: 'String', required: true, desc: 'Thông điệp phản hồi kết quả' },
      { name: 'PageIndex', type: 'Number', required: true, desc: 'Trang hiện tại' },
      { name: 'PageSize', type: 'Number', required: true, desc: 'Kích thước trang' },
      { name: 'TotalRecords', type: 'Number', required: true, desc: 'Tổng số văn bản thỏa mãn điều kiện' },
      { name: 'Data', type: 'Array', required: true, desc: 'Danh sách văn bản: [{ Document_Id, Sender_Code, Receiver_Code, Status, Cdate }]' },
    ],
    sampleResponse: `{
  "ResultCode": "200",
  "Message": "Thực hiện thành công.",
  "Timestamp": 1787052170,
  "PageIndex": 1,
  "PageSize": 20,
  "TotalRecords": 1,
  "Data": [
    {
      "Document_Id": "DOC_2026_001",
      "Sender_Code": "SENDER_UNIT",
      "Receiver_Code": "<CORP_CODE>",
      "Status": "ACK",
      "Cdate": "2026-08-18T10:00:00"
    }
  ]
}`,
  },
];

interface UnitApiModalProps {
  unit: DMCategoryItem | null;
  onClose: () => void;
  cdateStart?: string;
  cdateEnd?: string;
}

export default function UnitApiModal({ unit, onClose, cdateStart, cdateEnd }: UnitApiModalProps) {
  const queryClient = useQueryClient();
  const [apiTab, setApiTab] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tokenMessage, setTokenMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [openCreateTokenDialog, setOpenCreateTokenDialog] = useState(false);
  const [selectedServiceCode, setSelectedServiceCode] = useState('UNLIMITED');

  // Test API Playground State
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [testEndpoint, setTestEndpoint] = useState('/IN_DIP_Hub/GetList');
  const [testMethod, setTestMethod] = useState('POST');
  const [testTokenInput, setTestTokenInput] = useState('');
  const [testPayloadInput, setTestPayloadInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number | string;
    durationMs: number;
    data: any;
  } | null>(null);

  // Fetch Danh mục Dịch vụ chia sẻ (SYS_SHARE_SERVICES)
  const { data: sharedServices = [] } = useQuery<SysShareServiceItem[]>({
    queryKey: ['sysShareServices', cdateStart, cdateEnd],
    queryFn: async () => {
      try {
        const res = await sysShareServicesApi.getList({
          pageIndex: 1,
          pageSize: 50,
        });
        const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          return rawList.map((s: any) => ({
            id: s.ID || s.id,
            code: s.CODE || s.code || '',
            name: s.NAME || s.name || '',
            parentCode: s.PARENT_CODE || s.parentCode || '',
            parentName: s.PARENT_NAME || s.parentName || '',
            description: s.DESCRIPTION || s.description || s.PARENT_NAME || '',
            isActive: s.IS_ACTIVE !== undefined ? Number(s.IS_ACTIVE) : 1,
            status: s.STATUS !== undefined ? Number(s.STATUS) : 1,
            isDelete: s.IS_DELETE !== undefined ? Number(s.IS_DELETE) : 0,
            org: s.ORG || s.org || '',
            cdate: formatTime(s.CDATE || s.cdate || new Date()),
            cuser: s.CUSER || s.cuser || '',
            serviceCode: s.CODE || s.SERVICE_CODE || s.serviceCode || '',
            serviceName: s.NAME || s.SERVICE_NAME || s.serviceName || '',
            endpoint: s.ENDPOINT || s.endpoint || (s.CODE ? `/api/${s.CODE}` : ''),
            method: s.METHOD || s.method || 'POST',
          }));
        }
      } catch (err) {
        console.warn('Unable to load sysShareServices:', err);
      }
      return [
        { serviceCode: 'DOC_CREATE', serviceName: 'Tạo văn bản & Upload tệp', endpoint: '/DOCUMENTS/CreateBundle', method: 'POST', description: 'Đính kèm file & tạo văn bản gốc' },
        { serviceCode: 'DOC_SEND', serviceName: 'Gửi văn bản liên thông', endpoint: '/IN_DIP_Hub/Send', method: 'POST', description: 'Phát hành thông điệp sang đơn vị nhận' },
        { serviceCode: 'DOC_ACK', serviceName: 'Phản hồi biên nhận ACK', endpoint: '/IN_DIP_Hub/Ack', method: 'POST', description: 'Gửi trạng thái xử lý văn bản' },
        { serviceCode: 'DOC_GET_LIST', serviceName: 'Tra cứu danh sách văn bản', endpoint: '/IN_DIP_Hub/GetList', method: 'POST', description: 'Lấy danh sách văn bản đến/đi' },
      ];
    },
  });

  // Fetch danh sách Token đã cấp cho đơn vị (SYS_SHARE_CORP_TOKEN)
  const { data: unitTokens = [], refetch: refetchUnitTokens } = useQuery<SysShareCorpTokenItem[]>({
    queryKey: ['sysShareCorpTokens', unit?.code, cdateStart, cdateEnd],
    enabled: Boolean(unit?.code),
    queryFn: async () => {
      if (!unit?.code) return [];
      try {
        const res = await sysShareCorpTokenApi.getByCorpCode(unit.code, {
          pageIndex: 1,
          pageSize: 50,
          cdateStart: cdateStart ? (cdateStart.includes(':') ? cdateStart : `${cdateStart} 00:00:00`) : undefined,
          cdateEnd: cdateEnd ? (cdateEnd.includes(':') ? cdateEnd : `${cdateEnd} 23:59:59`) : undefined,
        });
        const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          return rawList.map((t: any) => ({
            id: t.ID || t.id,
            code: t.CODE || t.code || '',
            corpCode: t.CORP_CODE || t.corpCode || unit.code,
            corpName: t.CORP_NAME || t.corpName || unit.name,
            serviceCode: t.SERVICE_CODE || t.serviceCode || '—',
            serviceName: t.SERVICE_NAME || t.serviceName || '—',
            token: t.TOKEN || t.token || '',
            expired: t.EXPIRED || t.expired || '—',
            isActive: t.IS_ACTIVE !== undefined ? Number(t.IS_ACTIVE) : 1,
            status: t.STATUS !== undefined ? Number(t.STATUS) : 1,
            isDelete: t.IS_DELETE !== undefined ? Number(t.IS_DELETE) : 0,
            org: t.ORG || t.org || '',
            cdate: formatTime(t.CDATE || t.cdate || new Date()),
            cuser: t.CUSER || t.cuser || '',
          }));
        }
      } catch (err) {
        console.warn('Unable to fetch token list for unit:', err);
      }
      return [];
    },
  });

  // Tự động đồng bộ Token hiện tại khi unitTokens được tải xong
  useEffect(() => {
    if (unit && unitTokens && unitTokens.length > 0) {
      const activeTok = unitTokens.find((t) => t.isActive === 1 && t.isDelete !== 1) || unitTokens[0];
      if (activeTok) {
        setTokenId(activeTok.id || null);
        if (activeTok.token) setApiKey(activeTok.token);
      }
    }
  }, [unitTokens, unit]);

  // TanStack Mutation: Lưu/Cấp mới Token
  const saveTokenMutation = useMutation({
    mutationFn: (tokenItem: SysShareCorpTokenItem) => sysShareCorpTokenApi.createOrUpdate(tokenItem),
    onSuccess: (res) => {
      const code = res?.ResultCode || res?.resultCode || res?.code;
      if (code === '200' || code === 200 || code === '00' || res?.data) {
        queryClient.invalidateQueries({ queryKey: ['sysShareCorpTokens', unit?.code] });
        refetchUnitTokens();
        setTokenMessage({ type: 'success', text: 'Đã lưu và phát hành Token thành công!' });
      } else {
        setTokenMessage({ type: 'info', text: 'Đã gửi yêu cầu lưu Token.' });
      }
      setTimeout(() => setTokenMessage(null), 3500);
    },
    onError: () => {
      setTokenMessage({ type: 'error', text: 'Lỗi khi lưu Token lên server.' });
      setTimeout(() => setTokenMessage(null), 3500);
    },
  });

  const handleCreateNewToken = (serviceCode: string = 'UNLIMITED', serviceName: string = 'Gói vô thời hạn') => {
    if (!unit) return;

    saveTokenMutation.mutate({
      corpCode: unit.code,
      corpName: unit.name,
      serviceCode,
      serviceName,
      isActive: 1,
      status: 1,
      description: `Tạo mới Token kết nối API liên thông cho đơn vị ${unit.name}`,
    });
  };

  const handleToggleTokenActive = async (tokenItem: SysShareCorpTokenItem, currentIsActive: boolean) => {
    if (tokenItem.id) {
      const nextIsActive = currentIsActive ? 0 : 1;
      await sysShareCorpTokenApi.createOrUpdate({
        id: tokenItem.id,
        corpCode: tokenItem.corpCode,
        corpName: tokenItem.corpName,
        serviceCode: tokenItem.serviceCode || 'UNLIMITED',
        serviceName: tokenItem.serviceName || 'Gói dịch vụ',
        isActive: nextIsActive,
        status: 1,
      });
      refetchUnitTokens();
    }
  };

  const handleOpenApiTest = (srv?: typeof INTEGRATION_APIS[0], tokVal?: string) => {
    const targetSrv = srv || INTEGRATION_APIS[0];
    setTestEndpoint(targetSrv.endpoint);
    setTestMethod(targetSrv.method);
    const activeTok = unitTokens.find((t) => t.isActive === 1 && t.isDelete !== 1);
    const tokenToUse = tokVal || apiKey || activeTok?.token || '';
    setTestTokenInput(tokenToUse);
    setTestPayloadInput(targetSrv.samplePayload.replace(/<CORP_CODE>/g, unit?.code || ''));
    setTestResult(null);
    setOpenTestDialog(true);
  };

  const handleRunApiTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    const startTime = performance.now();
    try {
      let parsedPayload = {};
      if (testPayloadInput.trim()) {
        try {
          parsedPayload = JSON.parse(testPayloadInput);
        } catch {
          setTestResult({
            status: 'Lỗi JSON Payload',
            durationMs: 0,
            data: { message: 'Nội dung Payload JSON không đúng định dạng. Vui lòng kiểm tra cú pháp JSON.' },
          });
          setTestLoading(false);
          return;
        }
      }
      const response = await axiosInstance.post(testEndpoint, parsedPayload, {
        headers: {
          Authorization: `Bearer ${testTokenInput}`,
          'Sender-Code': unit?.code || '',
        },
      });
      const endTime = performance.now();
      setTestResult({
        status: response.status || 200,
        durationMs: Math.round(endTime - startTime),
        data: response.data,
      });
    } catch (err: any) {
      const endTime = performance.now();
      setTestResult({
        status: err.response?.status || 500,
        durationMs: Math.round(endTime - startTime),
        data: err.response?.data || { message: err.message || 'Kết nối máy chủ API thất bại hoặc bị chặn CORS.' },
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadDocx = () => {
    if (!unit) return;
    const content = `HƯỚNG DẪN TÍCH HỢP KẾT NỐI API LIÊN THÔNG VĂN BẢN
--------------------------------------------------
Đơn vị tích hợp : ${unit.name} (${unit.code})
Mã định danh    : ${unit.code}
Token hiện tại  : ${apiKey || 'Chưa cấp'}
Thời điểm xuất  : ${new Date().toLocaleString('vi-VN')}

1. ĐỊA CHỈ ENDPOINT HỆ THỐNG
- API Endpoint: ${HOST_API_KEY}

2. XÁC THỰC REQUEST
- Thêm Header Authorization: Bearer <TOKEN>
- Thêm Header Sender-Code: "${unit.code}"
- Content-Type: application/json

3. DANH SÁCH DỊCH VỤ API TÍCH HỢP (CREATE / SEND / ACK / GET LIST)
${INTEGRATION_APIS.map((api, idx) => `${idx + 1}. ${api.name} [${api.code}]
   Endpoint: ${api.method} ${HOST_API_KEY}${api.endpoint}
   Mô tả: ${api.description}
   Mẫu Body Request JSON:
${api.samplePayload.replace(/<CORP_CODE>/g, unit.code)}`).join('\n\n')}

Ghi chú: Token này thuộc quyền sở hữu của đơn vị ${unit.name}. Vui lòng bảo mật Token!`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Docx_HuongDan_API_${unit.code}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!unit) return null;

  const hasActiveToken = unitTokens.some((t) => t.isActive === 1 && t.isDelete !== 1);

  return (
    <Dialog
      open={Boolean(unit)}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Iconify icon="solar:key-minimalistic-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Thông tin kết nối API & Đặc tả Tích hợp Liên thông
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đơn vị: <strong>{unit.name}</strong> (Mã: <code>{unit.code}</code>)
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={hasActiveToken ? 'Token đang hoạt động' : 'Token đã khóa / Chưa cấp'}
            color={hasActiveToken ? 'success' : 'error'}
            size="small"
            variant="soft"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={apiTab} onChange={(_, val) => setApiTab(val)}>
          <Tab label="Cấp Token & Xác thực" icon={<Iconify icon="solar:key-bold" />} iconPosition="start" />
          <Tab label="Quy trình API (Tạo/Gửi/Ack)" icon={<Iconify icon="solar:code-bold" />} iconPosition="start" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2.5 }}>
        {copiedField && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Đã sao chép <strong>{copiedField}</strong> vào bộ nhớ tạm!
          </Alert>
        )}
        {tokenMessage && (
          <Alert severity={tokenMessage.type} sx={{ mb: 2 }}>
            {tokenMessage.text}
          </Alert>
        )}

        {apiTab === 0 && (
          <Stack spacing={2.5}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                    Danh sách Token kết nối API
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Đơn vị: <strong>{unit.name}</strong> (Mã: <code>{unit.code}</code>)
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip label={`${unitTokens.length} Token`} size="small" color="info" variant="soft" />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify icon="solar:add-circle-bold" />}
                    onClick={() => setOpenCreateTokenDialog(true)}
                    disabled={saveTokenMutation.isPending}
                  >
                    {saveTokenMutation.isPending ? 'Đang khởi tạo...' : 'Tạo mới Token'}
                  </Button>
                </Stack>
              </Stack>

              {unitTokens.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Mã đơn vị</TableCell>
                        <TableCell>Mã dịch vụ</TableCell>
                        <TableCell>Tên dịch vụ</TableCell>
                        <TableCell>TOKEN</TableCell>
                        <TableCell align="center">Ngày hết hạn</TableCell>
                        <TableCell align="center">Hoạt động</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unitTokens.map((t, idx) => {
                        const tokenVal = t.token || '';
                        const isAct = t.isActive === 1 && t.isDelete !== 1;
                        return (
                          <TableRow key={t.id || tokenVal} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell><code>{t.corpCode}</code></TableCell>
                            <TableCell>
                              <Chip label={t.serviceCode} size="small" variant="soft" color="info" />
                            </TableCell>
                            <TableCell>{t.serviceName}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {tokenVal.length > 25 ? `${tokenVal.slice(0, 25)}...` : tokenVal}
                                </Typography>
                                <Tooltip title="Sao chép Token">
                                  <IconButton size="small" color="primary" onClick={() => handleCopy(tokenVal, 'Token')}>
                                    <Iconify icon="solar:copy-bold" width={16} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={t.expired || '—'} size="small" variant="outlined" color="default" />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={isAct ? 'Đang bật (Click để tắt/khóa)' : 'Đang tắt (Click để bật/kích hoạt)'}>
                                <Switch
                                  size="small"
                                  color="success"
                                  checked={isAct}
                                  onChange={() => handleToggleTokenActive(t, isAct)}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Thử nghiệm kết nối với Token này">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenApiTest(INTEGRATION_APIS[3], tokenVal)}
                                >
                                  <Iconify icon="solar:play-circle-bold" width={18} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Alert
                  severity="info"
                  variant="outlined"
                  action={
                    <Button color="primary" size="small" onClick={() => setOpenCreateTokenDialog(true)} disabled={saveTokenMutation.isPending}>
                      Tạo mới ngay
                    </Button>
                  }
                >
                  Chưa có Token nào được phát hành cho đơn vị <strong>{unit.name}</strong>. Nhấn <strong>Tạo mới Token</strong> để phát hành ngay.
                </Alert>
              )}
            </Paper>
          </Stack>
        )}

        {apiTab === 1 && (
          <Stack spacing={2}>
            <Alert severity="info" icon={<Iconify icon="solar:info-square-bold" />}>
              Quy trình API Tích hợp Liên thông cho đơn vị <strong>{unit.name}</strong> (Tạo văn bản gốc, Upload tệp, Gửi liên thông, Biên nhận ACK)
            </Alert>
            {INTEGRATION_APIS.map((srv, index) => (
              <Paper key={srv.code} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                    {index + 1}. {srv.name} (<code>{srv.method} {srv.endpoint}</code>)
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Iconify icon="solar:play-bold" />}
                      onClick={() => handleOpenApiTest(srv)}
                    >
                      Thử nghiệm API
                    </Button>
                    <Chip label={srv.code} size="small" color="primary" variant="soft" />
                  </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary" paragraph>
                  {srv.description}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5, fontWeight: 600 }}>
                  Mô tả chi tiết các trường dữ liệu (Request Body):
                </Typography>
                <Table size="small" sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Tên trường</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Kiểu dữ liệu</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Yêu cầu</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Mô tả chi tiết</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {srv.fields.map((f) => (
                      <TableRow key={f.name} hover>
                        <TableCell><code>{f.name}</code></TableCell>
                        <TableCell><Chip label={f.type} size="small" variant="outlined" color="default" /></TableCell>
                        <TableCell align="center">
                          <Chip
                            label={f.required ? 'Bắt buộc' : 'Tùy chọn'}
                            size="small"
                            color={f.required ? 'error' : 'default'}
                            variant="soft"
                          />
                        </TableCell>
                        <TableCell>{f.desc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Mẫu Request & Payload JSON:
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    p: 1.5,
                    pt: 4,
                    mb: 1.5,
                    borderRadius: 1,
                    bgcolor: '#1e1e1e',
                    color: srv.code.includes('CREATE') ? '#4ec9b0' : srv.code.includes('SEND') ? '#ce9178' : '#dcdcaa',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  <Tooltip title="Sao chép Mẫu Request">
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        color: 'rgba(255, 255, 255, 0.7)',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                      }}
                      onClick={() => {
                        const reqStr = `${srv.method} ${HOST_API_KEY}${srv.endpoint}\nHeaders: Authorization: Bearer ${apiKey || '<YOUR_TOKEN>'} | Content-Type: application/json\nSender-Code: "${unit.code}"\n\nRequest Body:\n${srv.samplePayload.replace(/<CORP_CODE>/g, unit.code)}`;
                        handleCopy(reqStr, `Mẫu Request ${srv.code}`);
                      }}
                    >
                      <Iconify icon="solar:copy-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                  {`${srv.method} ${HOST_API_KEY}${srv.endpoint}
Headers: Authorization: Bearer ${apiKey || '<YOUR_TOKEN>'} | Content-Type: application/json
Sender-Code: "${unit.code}"

Request Body:
${srv.samplePayload.replace(/<CORP_CODE>/g, unit.code)}`}
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5, fontWeight: 600 }}>
                  Mô tả chi tiết các trường phản hồi (Response Body):
                </Typography>
                <Table size="small" sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Tên trường</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Kiểu dữ liệu</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Yêu cầu</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Mô tả chi tiết</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {srv.responseFields.map((f) => (
                      <TableRow key={f.name} hover>
                        <TableCell><code>{f.name}</code></TableCell>
                        <TableCell><Chip label={f.type} size="small" variant="outlined" color="info" /></TableCell>
                        <TableCell align="center">
                          <Chip
                            label={f.required ? 'Bắt buộc' : 'Tùy chọn'}
                            size="small"
                            color={f.required ? 'error' : 'default'}
                            variant="soft"
                          />
                        </TableCell>
                        <TableCell>{f.desc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Mẫu Kết quả phản hồi (Response JSON):
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    p: 1.5,
                    pt: 4,
                    borderRadius: 1,
                    bgcolor: '#18222d',
                    color: '#9cdcfe',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  <Tooltip title="Sao chép Mẫu Response JSON">
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        color: 'rgba(255, 255, 255, 0.7)',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                      }}
                      onClick={() => {
                        const resStr = srv.sampleResponse.replace(/<CORP_CODE>/g, unit.code);
                        handleCopy(resStr, `Mẫu Response ${srv.code}`);
                      }}
                    >
                      <Iconify icon="solar:copy-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                  {srv.sampleResponse.replace(/<CORP_CODE>/g, unit.code)}
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<Iconify icon="solar:document-bold" />}
          onClick={handleDownloadDocx}
        >
          Tải file DOCX Hướng dẫn API
        </Button>

        <Button variant="outlined" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>

      {/* Sub-Dialog Chọn Gói Dịch vụ khi tạo Token */}
      <Dialog
        open={openCreateTokenDialog}
        onClose={() => setOpenCreateTokenDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1 }}>Tạo mới Token - Chọn gói dịch vụ</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Vui lòng chọn Gói dịch vụ để cấp Token cho đơn vị <strong>{unit?.name}</strong>:
            </Typography>
            <TextField
              fullWidth
              size="small"
              select
              label="Gói Dịch vụ chia sẻ"
              value={selectedServiceCode}
              onChange={(e) => setSelectedServiceCode(e.target.value)}
            >
              {sharedServices.map((srv) => {
                const sCode = srv.code || srv.serviceCode || '';
                const sName = srv.name || srv.serviceName || '';
                return (
                  <MenuItem key={sCode} value={sCode}>
                    {sName} ({sCode})
                  </MenuItem>
                );
              })}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateTokenDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={saveTokenMutation.isPending}
            onClick={() => {
              const targetSrv = sharedServices.find((s) => (s.code || s.serviceCode) === selectedServiceCode);
              const sCode = selectedServiceCode;
              const sName = targetSrv ? (targetSrv.name || targetSrv.serviceName || 'Gói dịch vụ') : 'Gói dịch vụ';
              handleCreateNewToken(sCode, sName);
              setOpenCreateTokenDialog(false);
            }}
          >
            {saveTokenMutation.isPending ? 'Đang tạo...' : 'Xác nhận tạo Token'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sub-Dialog: Thử nghiệm API & Kiểm tra Token (API Playground) */}
      <Dialog
        open={openTestDialog}
        onClose={() => setOpenTestDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:play-circle-bold" color="success.main" width={26} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Thử nghiệm API & Kiểm tra Token (API Playground)
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setOpenTestDialog(false)}>
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2}>
            <Alert severity="info" icon={<Iconify icon="solar:info-square-bold" />}>
              Kiểm tra khả năng phản hồi thực tế của máy chủ API đối với đơn vị <strong>{unit?.name} ({unit?.code})</strong>
            </Alert>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                select
                size="small"
                label="Phương thức"
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value)}
                sx={{ width: 130 }}
              >
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="GET">GET</MenuItem>
              </TextField>
              <TextField
                fullWidth
                size="small"
                label="Endpoint API"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                helperText={`Host API: ${HOST_API_KEY}`}
              />
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Authorization Bearer Token (ApiKey)"
              value={testTokenInput}
              onChange={(e) => setTestTokenInput(e.target.value)}
              placeholder="Dán hoặc nhập mã Token vào đây..."
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Request Body (Payload JSON):
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={testPayloadInput}
              onChange={(e) => setTestPayloadInput(e.target.value)}
              sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            />

            {testResult && (
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Kết quả phản hồi thực tế (Response):
                  </Typography>
                  <Chip
                    label={`Status: ${testResult.status}`}
                    size="small"
                    color={String(testResult.status).startsWith('2') ? 'success' : 'error'}
                  />
                  <Chip
                    label={`${testResult.durationMs} ms`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                </Stack>

                <Box
                  sx={{
                    position: 'relative',
                    p: 1.5,
                    pt: 4,
                    borderRadius: 1,
                    bgcolor: '#1e1e1e',
                    color: String(testResult.status).startsWith('2') ? '#4ec9b0' : '#f44747',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: 280,
                    overflowY: 'auto',
                  }}
                >
                  <Tooltip title="Sao chép kết quả Response">
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        color: 'rgba(255, 255, 255, 0.7)',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                      }}
                      onClick={() => handleCopy(JSON.stringify(testResult.data, null, 2), 'Response Test')}
                    >
                      <Iconify icon="solar:copy-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                  {JSON.stringify(testResult.data, null, 2)}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenTestDialog(false)}>Đóng</Button>
          <Button
            variant="contained"
            color="success"
            startIcon={testLoading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:play-bold" />}
            onClick={handleRunApiTest}
            disabled={testLoading}
          >
            {testLoading ? 'Đang kiểm tra...' : 'Gửi Thử Nghiệm Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
