import React, { useState, useEffect } from 'react';
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  Paper,
  Avatar,
} from '@mui/material';
import { useMemo } from 'react';
import Iconify from '../../components/iconify';
import { DataTable, StatusChip } from '../../sections/interoperability/components';
import { ExchangeTransaction } from '../../sections/interoperability/mockData';
import { documentAttachmentsApi, documentsApi } from '../../services/documentsApi';
import { FileViewerItem, FileViewerPanel } from '../../components/file-viewer';
import { getS3AttachmentUrl } from '../../services/storageS3Api';
import { formatTime } from '../../utils/formatTime';

type AttachmentPreview = { fileName: string; type: string; size: string };

function safeFormatTime(val: any, fallback = '—'): string {
  if (!val || val === '—') return fallback;
  const formatted = formatTime(val);
  return formatted || fallback;
}

/* ────────────────────────────────────────────────────────────────────── */
/* Small presentational helpers                                          */
/* ────────────────────────────────────────────────────────────────────── */

function FieldBlock({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '8px',
          bgcolor: 'action.hover',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.1,
        }}
      >
        <Iconify icon={icon} width={16} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600, fontSize: '0.68rem' }}
        >
          {label}
        </Typography>
        <Box sx={{ mt: 0.25 }}>{children}</Box>
      </Box>
    </Stack>
  );
}

function SectionHeader({ icon, title, endAdornment }: { icon: string; title: string; endAdornment?: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon={icon} width={18} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {endAdornment}
    </Stack>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Tracking timeline                                                     */
/* ────────────────────────────────────────────────────────────────────── */

function TrackingPipelineTimeline({ trackings, detailTx }: { trackings: any[]; detailTx: ExchangeTransaction | null }) {
  // Xây dựng đủ 4 bước thuộc luồng trao đổi liên thông chuẩn DIP Hub
  const steps = React.useMemo(() => {
    const senderName = detailTx?.sender || detailTx?.senderCode || 'Đơn vị gửi';
    const receivers = Array.isArray(detailTx?.receiverCode)
      ? detailTx.receiverCode.join(', ')
      : detailTx?.receiver || detailTx?.receiverCode || 'Đơn vị nhận';

    const txStatus = (detailTx?.status || detailTx?.ack || '').toUpperCase();
    const isTxReceived = ['RECEIVED', 'ACK', 'ACK_RECEIVED', 'COMPLETED', 'SUCCESS'].includes(txStatus);
    const isTxAck = ['ACK', 'ACK_RECEIVED', 'COMPLETED'].includes(txStatus);
    const isTxFailed = ['FAILED', 'NACK', 'ERROR', 'CANCELLED'].includes(txStatus);

    // Sắp xếp lịch sử thực tế theo thời gian tăng dần
    const sortedTrackings = [...(trackings || [])].sort((a, b) => {
      const ta = new Date(a.CDATE || a.cdate || a.ACTION_TIME || a.actionTime || 0).getTime();
      const tb = new Date(b.CDATE || b.cdate || b.ACTION_TIME || b.actionTime || 0).getTime();
      return ta - tb;
    });

    const sendLog = sortedTrackings.find((t) => {
      const s = (t.STATUS || t.status || t.ACTION || t.DESCRIPTION || '').toUpperCase();
      return s.includes('SEND') || s.includes('SENT') || s.includes('KHOI_TAO') || s.includes('PHAT_HANH');
    }) || sortedTrackings[0];

    const receiveLog = sortedTrackings.find((t) => {
      const s = (t.STATUS || t.status || t.ACTION || t.DESCRIPTION || '').toUpperCase();
      return s.includes('RECEIVE') || s.includes('RECEIVED') || s.includes('TIEP_NHAN') || s.includes('DA_NHAN');
    });

    const ackLog = sortedTrackings.find((t) => {
      const s = (t.STATUS || t.status || t.ACTION || t.DESCRIPTION || '').toUpperCase();
      return s.includes('ACK') || s.includes('NACK') || s.includes('XAC_NHAN');
    });

    // Bước 1: Gửi văn bản (SENT)
    const step1 = {
      stepNo: 1,
      title: 'Gửi văn bản (SENT)',
      shortLabel: '1. Gửi (SENT)',
      orgName: senderName,
      status: sendLog ? (sendLog.STATUS || sendLog.status || 'SENT') : 'SENT',
      timeStr: safeFormatTime(sendLog?.CDATE || sendLog?.cdate || sendLog?.ACTION_TIME || detailTx?.sentAt || detailTx?.sendTime),
      descStr: sendLog?.DESCRIPTION || sendLog?.description || `Đã gửi văn bản thành công từ ${senderName}.`,
      userStr: sendLog?.CREATOR || sendLog?.cuser || 'SENDER_SYSTEM',
      state: 'completed' as const,
    };

    // Bước 2: Nhận văn bản (RECEIVED)
    const step2Done = Boolean(receiveLog || isTxReceived);
    const step2 = {
      stepNo: 2,
      title: 'Nhận văn bản (RECEIVED)',
      shortLabel: '2. Nhận (RECEIVED)',
      orgName: receivers,
      status: receiveLog ? (receiveLog.STATUS || receiveLog.status || 'RECEIVED') : step2Done ? 'RECEIVED' : isTxFailed ? 'FAILED' : 'WAITING',
      timeStr: safeFormatTime(receiveLog?.CDATE || receiveLog?.cdate || receiveLog?.ACTION_TIME || (step2Done ? detailTx?.updatedAt : null)),
      descStr: receiveLog?.DESCRIPTION || receiveLog?.description || (step2Done ? `Đơn vị nhận (${receivers}) đã tiếp nhận thành công gói tin văn bản.` : isTxFailed ? 'Lỗi kết nối / Không thể chuyển gói tin đến Đơn vị nhận.' : 'Chờ Đơn vị nhận tiếp nhận văn bản.'),
      userStr: receiveLog?.CREATOR || receiveLog?.cuser || 'RECEIVER_SYSTEM',
      state: step2Done ? ('completed' as const) : isTxFailed ? ('failed' as const) : ('pending' as const),
    };

    // Bước 3: Xác nhận ACK (ACK_RECEIVED)
    const hasAckLog = Boolean(ackLog);
    const isAckSuccess = hasAckLog && !['NACK', 'FAILED', 'ERROR'].includes((ackLog?.STATUS || ackLog?.status || '').toUpperCase());
    const isAckFailed = isTxFailed || (hasAckLog && ['NACK', 'FAILED', 'ERROR'].includes((ackLog?.STATUS || ackLog?.status || '').toUpperCase()));
    const step3Done = Boolean((hasAckLog && isAckSuccess) || isTxAck);

    const step3 = {
      stepNo: 3,
      title: 'Xác nhận ACK (ACK_RECEIVED)',
      shortLabel: '3. Xác nhận ACK',
      orgName: receivers,
      status: ackLog ? (ackLog.STATUS || ackLog.status || 'ACK_RECEIVED') : step3Done ? 'ACK_RECEIVED' : isAckFailed ? 'NACK' : 'WAITING',
      timeStr: safeFormatTime(ackLog?.CDATE || ackLog?.cdate || ackLog?.ACTION_TIME || (step3Done ? detailTx?.updatedAt : null)),
      descStr: ackLog?.DESCRIPTION || ackLog?.description || (step3Done ? 'Đã nhận thông điệp phản hồi xác nhận (ACK_RECEIVED) thành công.' : isAckFailed ? 'Giao dịch bị từ chối / Phản hồi NACK từ đơn vị nhận.' : 'Chờ thông điệp phản hồi xác nhận (ACK_RECEIVED).'),
      userStr: ackLog?.CREATOR || ackLog?.cuser || 'RECEIVER_ACK',
      state: step3Done ? ('completed' as const) : isAckFailed ? ('failed' as const) : ('pending' as const),
    };

    return [step1, step2, step3];
  }, [trackings, detailTx]);

  const doneCount = steps.filter((s) => s.state === 'completed').length;
  const progressPercent = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;
  const hasFailure = steps.some((s) => s.state === 'failed');

  const STATE_STYLE: Record<
    'completed' | 'in_progress' | 'pending' | 'failed',
    { color: string; bg: string; icon: string; label: string }
  > = {
    completed: { color: '#10b981', bg: '#ecfdf5', icon: 'solar:check-circle-bold', label: 'Hoàn tất' },
    in_progress: { color: '#f59e0b', bg: '#fffbeb', icon: 'solar:clock-circle-bold', label: 'Đang xử lý' },
    pending: { color: '#94a3b8', bg: 'transparent', icon: 'solar:clock-circle-linear', label: 'Chờ xử lý' },
    failed: { color: '#f43f5e', bg: '#fff1f2', icon: 'solar:danger-bold', label: 'Thất bại' },
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Progress overview ── */}
      <Box
        sx={{
          mb: 3.5,
          p: { xs: 1.75, sm: 2.25 },
          borderRadius: 3,
          bgcolor: hasFailure ? '#fff1f2' : 'background.neutral',
          border: '1px solid',
          borderColor: hasFailure ? '#fecdd3' : 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify
              icon="solar:routing-2-bold"
              width={16}
              sx={{ color: hasFailure ? '#e11d48' : 'primary.main' }}
            />
            <Typography variant="subtitle2" fontWeight={700}>
              Tiến trình luân chuyển văn bản
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: hasFailure ? '#e11d48' : '#10b981', whiteSpace: 'nowrap' }}
          >
            {doneCount}/{steps.length} bước hoàn tất
          </Typography>
        </Stack>
        <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: 'grey.200', overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: `${progressPercent}%`,
              bgcolor: hasFailure ? '#f43f5e' : '#10b981',
              borderRadius: 3,
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </Box>
      </Box>

      {/* ── Vertical activity timeline ── */}
      <Stack spacing={0}>
        {steps.map((t, idx) => {
          const st = STATE_STYLE[t.state];
          const isLast = idx === steps.length - 1;
          const isPending = t.state === 'pending';

          return (
            <Box key={idx} sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 } }}>
              {/* rail */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                    bgcolor: isPending ? 'background.paper' : st.color,
                    color: isPending ? st.color : '#fff',
                    border: isPending ? `2px dashed ${st.color}90` : `2px solid ${st.color}`,
                    boxShadow: isPending ? 'none' : `0 2px 10px ${st.color}45`,
                  }}
                >
                  <Iconify icon={st.icon} width={18} />
                </Box>
                {!isLast && (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      minHeight: 26,
                      my: 0.5,
                      borderRadius: 1,
                      bgcolor: t.state === 'completed' ? st.color : 'grey.200',
                      transition: 'background-color 0.3s',
                    }}
                  />
                )}
              </Box>

              {/* content card */}
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  mb: isLast ? 0 : 2.5,
                  p: { xs: 1.75, sm: 2.25 },
                  borderRadius: 2.5,
                  borderColor: isPending ? 'divider' : st.color + '35',
                  bgcolor: isPending ? 'transparent' : st.bg,
                  opacity: isPending ? 0.85 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={0.75}
                  sx={{ mb: 0.75 }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ color: isPending ? 'text.secondary' : 'text.primary' }}
                  >
                    {t.title}
                  </Typography>
                  <Chip
                    label={st.label}
                    size="small"
                    sx={{
                      bgcolor: isPending ? 'action.hover' : st.color + '1f',
                      color: isPending ? 'text.secondary' : st.color,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 22,
                      flexShrink: 0,
                    }}
                  />
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    color: isPending ? 'text.secondary' : 'text.primary',
                    fontStyle: isPending ? 'italic' : 'normal',
                    lineHeight: 1.7,
                    mb: 1.5,
                  }}
                >
                  {t.descStr}
                </Typography>

                <Stack direction="row" spacing={2.5} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify icon="solar:buildings-2-bold" width={13} sx={{ color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                      {t.orgName}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify icon="solar:clock-circle-bold" width={13} sx={{ color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      {t.timeStr}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify icon="solar:user-bold" width={13} sx={{ color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      {t.userStr}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Main dialog                                                           */
/* ────────────────────────────────────────────────────────────────────── */

interface DocumentExchangeDetailDialogProps {
  open: boolean;
  detailTx: ExchangeTransaction | null;
  onClose: () => void;
  onAck: (tx: ExchangeTransaction, status?: 'ACK' | 'NACK') => void;
  onReplay: (id: string | number) => void;
}

export default function DocumentExchangeDetailDialog({
  open,
  detailTx,
  onClose,
  onAck,
  onReplay,
}: DocumentExchangeDetailDialogProps) {
  const [detailTab, setDetailTab] = React.useState(0);
  const [detailAttachments, setDetailAttachments] = React.useState<any[]>([]);
  const [detailTrackings, setDetailTrackings] = React.useState<any[]>([]);
  const [previewFile, setPreviewFile] = React.useState<AttachmentPreview | null>(null);

  useEffect(() => {
    if (detailTx) {
      const docIdStr = String(detailTx.documentId || detailTx.code || detailTx.id || '');

      // API 1: Chi tiết định tuyến (GetInfo/{id})
      if (detailTx.id) {
        documentsApi.getRouteInfo(detailTx.id).catch(() => {});
      }

      // API 2: Lịch sử theo dõi tracking riêng (/DOCUMENT_TRACKING/GetListBy)
      if (docIdStr) {
        documentAttachmentsApi
          .getTrackingsByDocument(docIdStr)
          .then((res) => {
            const list = res?.Data || res?.data || (Array.isArray(res) ? res : []);
            setDetailTrackings(Array.isArray(list) ? list : []);
          })
          .catch(() => setDetailTrackings([]));

        documentAttachmentsApi
          .getListByDocument(docIdStr)
          .then((res) => {
            const list = res?.Data || res?.data || (Array.isArray(res) ? res : []);
            setDetailAttachments(Array.isArray(list) ? list : []);
          })
          .catch(() => setDetailAttachments([]));
      }
    } else {
      setDetailAttachments([]);
      setDetailTrackings([]);
    }
  }, [detailTx]);

  const viewerFiles = useMemo<FileViewerItem[]>(() => {
    const txObj = detailTx as any;
    const rawList =
      detailAttachments && detailAttachments.length > 0
        ? detailAttachments
        : txObj?.attachments && txObj.attachments.length > 0
        ? txObj.attachments
        : txObj?.body && Array.isArray(txObj.body)
        ? txObj.body
        : [];

    return rawList
      .map((item: any): FileViewerItem | null => {
        const fileName =
          typeof item === 'string'
            ? item
            : item?.originalFileName || item?.ORIGINAL_FILE_NAME || item?.fileName || item?.File_Name || item?.name || '';
        const objectKey =
          typeof item === 'string'
            ? item
            : item?.objectKey || item?.OBJECT_KEY || item?.fileUrl || item?.File_URL || fileName;
        const fileSize = typeof item === 'object' ? item?.FILE_SIZE ?? item?.fileSize ?? item?.size : undefined;
        if (!fileName && !objectKey) return null;
        const url = getS3AttachmentUrl(objectKey || fileName);
        return url ? { name: fileName, url, size: fileSize } : null;
      })
      .filter((item: FileViewerItem | null): item is FileViewerItem => item !== null);
  }, [detailAttachments, detailTx]);

  if (!detailTx) return null;

  const routesCount = detailTx.routes?.length || 1;
  const routesList = detailTx.routes && detailTx.routes.length > 0 ? detailTx.routes : [detailTx];
  const ackCount = routesList.filter((r: any) => (r.status || '').toLowerCase() === 'ack').length;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            height: { md: '88vh' },
            maxHeight: { md: 880 },
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                variant="rounded"
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: 'primary.lighter',
                  color: 'primary.dark',
                  borderRadius: '10px',
                }}
              >
                <Iconify icon="solar:document-text-bold-duotone" width={24} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                  {detailTx.documentCode || 'Chi tiết văn bản trao đổi'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {detailTx.documentTitle}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5 }}>
              <StatusChip status={detailTx.status || 'sent'} />
              <IconButton size="small" onClick={onClose}>
                <Iconify icon="eva:close-fill" width={20} />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, px: 3 }}>
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              bgcolor: 'background.paper',
              pt: 2,
              pb: 1,
              mb: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Tabs
              value={detailTab}
              onChange={(_, v) => setDetailTab(v)}
              sx={{
                minHeight: 40,
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab
                label="Chi tiết"
                icon={<Iconify icon="solar:document-text-bold" width={16} />}
                iconPosition="start"
                sx={{ minHeight: 40, fontWeight: 600 }}
              />
              <Tab
                label={`File đính kèm${viewerFiles.length ? ` (${viewerFiles.length})` : ''}`}
                icon={<Iconify icon="solar:paperclip-2-bold" width={16} />}
                iconPosition="start"
                sx={{ minHeight: 40, fontWeight: 600 }}
              />
              <Tab
                label="Lịch sử"
                icon={<Iconify icon="solar:history-bold" width={16} />}
                iconPosition="start"
                sx={{ minHeight: 40, fontWeight: 600 }}
              />
              {Boolean(detailTx.errorReason) && (
                <Tab
                  label="Lỗi"
                  icon={<Iconify icon="solar:bug-bold" width={16} />}
                  iconPosition="start"
                  sx={{ minHeight: 40, fontWeight: 600, color: 'error.main' }}
                />
              )}
            </Tabs>
          </Box>

          {detailTab === 0 && (
            <Stack spacing={2.5}>
              {/* Thẻ Thông tin văn bản chính */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                <SectionHeader icon="solar:info-circle-bold" title="Thông tin văn bản" />
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FieldBlock icon="solar:hashtag-bold" label="Số ký hiệu văn bản">
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        {detailTx.documentCode || detailTx.documentNo || '—'}
                      </Typography>
                    </FieldBlock>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldBlock icon="solar:folder-bold" label="Loại văn bản">
                      <Chip
                        label={detailTx.documentType || 'VĂN BẢN'}
                        size="small"
                        color="info"
                        variant="soft"
                        sx={{ fontWeight: 600, borderRadius: '6px' }}
                      />
                    </FieldBlock>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldBlock icon="solar:buildings-2-bold" label="Đơn vị gửi (Phát hành)">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {detailTx.sender || '—'}
                      </Typography>
                    </FieldBlock>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldBlock icon="solar:calendar-bold" label="Thời gian phát hành / gửi">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {safeFormatTime(detailTx.sentAt || detailTx.sendTime)}
                      </Typography>
                    </FieldBlock>
                  </Grid>
                  <Grid item xs={12}>
                    <FieldBlock icon="solar:notes-bold" label="Trích yếu nội dung">
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.7 }}>
                        {detailTx.documentTitle || detailTx.subject || '—'}
                      </Typography>
                    </FieldBlock>
                  </Grid>
                </Grid>
              </Paper>

              {/* Bảng Danh sách đơn vị nhận */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                <SectionHeader
                  icon="solar:users-group-rounded-bold"
                  title={`Đơn vị tiếp nhận & Trạng thái (${routesCount} đơn vị)`}
                  endAdornment={
                    <Chip
                      size="small"
                      label={`${ackCount}/${routesCount} đã xác nhận`}
                      sx={{
                        bgcolor: ackCount === routesCount ? '#22c55e18' : 'action.hover',
                        color: ackCount === routesCount ? '#16a34a' : 'text.secondary',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  }
                />
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <DataTable
                    columns={[
                      { key: 'receiver', label: 'Đơn vị nhận' },
                      { key: 'status', label: 'Trạng thái', align: 'center' },
                      { key: 'sendTime', label: 'Thời gian gửi' },
                      { key: 'ackTime', label: 'Thời gian xác nhận' },
                    ]}
                    rows={routesList.map((r: any) => ({
                      receiver: (
                        <Typography variant="body2" fontWeight={600}>
                          {r.receiverName || r.receiverCode || r.receiver || '—'}
                        </Typography>
                      ),
                      status: <StatusChip status={r.status || 'waiting'} />,
                      sendTime: safeFormatTime(r.sendTime || detailTx.sentAt),
                      ackTime: safeFormatTime(r.ackTime || detailTx.updatedAt),
                    }))}
                  />
                </Box>
              </Paper>

              {/* Thông tin mã kỹ thuật hệ thống */}
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                  flexWrap: 'wrap',
                  rowGap: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  ID: <strong>{detailTx.id !== undefined && detailTx.id !== null ? String(detailTx.id) : '—'}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mã định danh (CODE): <strong>{detailTx.code || '—'}</strong>
                </Typography>
                {detailTx.messageId && (
                  <Typography variant="caption" color="text.secondary">
                    Message ID: <strong>{detailTx.messageId}</strong>
                  </Typography>
                )}
              </Stack>
            </Stack>
          )}

          {detailTab === 1 && (
            <Box
              sx={{
                flex: 1,
                minHeight: 500,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2.5,
                overflow: 'hidden',
              }}
            >
              {viewerFiles.length > 0 ? (
                <FileViewerPanel files={viewerFiles} height="100%" showFileList embedded />
              ) : (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={1.5}
                  sx={{ height: '100%', minHeight: 350, color: 'text.secondary', px: 3, py: 6 }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:file-remove-bold-duotone" width={32} />
                  </Box>
                  <Typography variant="body2">Chưa có tệp đính kèm để xem</Typography>
                </Stack>
              )}
            </Box>
          )}

          {detailTab === 2 && (
            <TrackingPipelineTimeline trackings={detailTrackings} detailTx={detailTx} />
          )}

          {detailTab === 3 && detailTx.errorReason && (
            <Stack spacing={2}>
              <Alert severity="error" variant="filled" icon={<Iconify icon="solar:bug-bold" />} sx={{ borderRadius: 2 }}>
                <Typography variant="subtitle2">{detailTx.errorReason}</Typography>
              </Alert>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: 'error.lighter',
                  borderColor: 'error.light',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Iconify icon="solar:danger-triangle-bold" width={16} sx={{ color: 'error.dark' }} />
                  <Typography variant="caption" fontWeight={700} color="error.darker" sx={{ textTransform: 'uppercase' }}>
                    Chi tiết lỗi
                  </Typography>
                </Stack>
                <Typography variant="body2" color="error.darker" sx={{ lineHeight: 1.7 }}>
                  {detailTx.errorDetail}
                </Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Đóng
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
            onClick={() => {
              onAck(detailTx, 'ACK');
              onClose();
            }}
            sx={{ borderRadius: 2 }}
          >
            Gửi xác nhận đã nhận văn bản
          </Button>
          {(detailTx.status === 'failed' || detailTx.status === 'retrying') && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<Iconify icon="solar:restart-bold" width={18} />}
              onClick={() => {
                onReplay(detailTx.id || detailTx.code || '');
                onClose();
              }}
              sx={{ borderRadius: 2 }}
            >
              Replay giao dịch
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 2 }}>Xem file đính kèm</DialogTitle>
        <DialogContent>
          {previewFile && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: 'primary.lighter',
                      color: 'primary.dark',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify
                      icon={previewFile.type.includes('pdf') ? 'solar:file-text-bold' : 'solar:code-file-bold'}
                      width={24}
                    />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap>
                      {previewFile.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {previewFile.type} · {previewFile.size}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}