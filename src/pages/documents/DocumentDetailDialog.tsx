import { useEffect, useMemo, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FileViewerPanel } from '../../components/file-viewer';
import Iconify from '../../components/iconify';
import { DataTable, StatusChip } from '../../sections/interoperability/components';
import SignatureStudio from '../../sections/workflow/components/SignatureStudio';
import { fakeAudit, fakeVersions, getAttachmentDisplayName, getDemoAttachmentUrl, saveDocumentToDemoStorage } from './documentHelpers';
import { ManagedDocumentRecord } from './types';

type Props = {
  doc: ManagedDocumentRecord | null;
  onClose: () => void;
  onDocumentUpdated: (doc: ManagedDocumentRecord) => void;
};

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'text.disabled',
          fontSize: 11,
          lineHeight: 1.2,
          mb: 0.35,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function DocumentDetailDialog({ doc, onClose, onDocumentUpdated }: Props) {
  const [detailTab, setDetailTab] = useState(0);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // Quyết định breakpoint để hiển thị 2 cột (Metadata + Viewer) sớm hơn,
  // và chỉnh "width giữa 2 phần" theo kích thước màn hình.
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const dividerWidth = 8;
  const minMetaWidth = 180;
  const minViewerWidth = 280;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [metaWidth, setMetaWidth] = useState(() => (isLgDown ? 220 : 260));
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ pointerId: number; rect: DOMRect } | null>(null);
  const prevIsMdUpRef = useRef<boolean>(false);

  useEffect(() => {
    // Chỉ reset khi chuyển từ mobile->desktop (mình tránh reset lúc thả chuột để giữ width vừa kéo).
    if (isMdUp && !prevIsMdUpRef.current) {
      setMetaWidth(isLgDown ? 220 : 260);
    }
    prevIsMdUpRef.current = isMdUp;
  }, [isMdUp, isLgDown]);

  useEffect(() => {
    if (!isResizing) return;

    const onPointerMove = (ev: PointerEvent) => {
      const st = resizeRef.current;
      if (!st) return;
      if (ev.pointerId !== st.pointerId) return;

      const raw = ev.clientX - st.rect.left;
      const next = Math.min(
        Math.max(raw, minMetaWidth),
        st.rect.width - minViewerWidth - dividerWidth
      );

      setMetaWidth(next);
    };

    const onPointerUp = (ev: PointerEvent) => {
      const st = resizeRef.current;
      if (st && ev.pointerId === st.pointerId) {
        resizeRef.current = null;
        setIsResizing(false);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isResizing]);

  const handleDividerPointerDown = (ev: React.PointerEvent) => {
    if (!isMdUp) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    resizeRef.current = { pointerId: ev.pointerId, rect };
    setIsResizing(true);
  };

  const viewerFiles = useMemo(
    () =>
      (doc?.attachments ?? [])
        .map((item) => {
          const url = getDemoAttachmentUrl(doc!.code, item);
          return url ? { name: getAttachmentDisplayName(item), url } : null;
        })
        .filter((item): item is { name: string; url: string } => Boolean(item)),
    [doc]
  );

  return (
    <Dialog
      open={Boolean(doc)}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{ sx: { height: { md: '90vh' }, maxHeight: { md: 900 } } }}
      TransitionProps={{
        onExited: () => setDetailTab(0),
      }}
    >
      {doc && (
        <>
          <DialogTitle sx={{ pb: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8 }}>
                  {doc.type} · {doc.classification}
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.25, lineHeight: 1.3 }}>
                  {doc.code}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {doc.title}
                </Typography>
              </Box>
              <StatusChip status={doc.status} />
            </Stack>
          </DialogTitle>

          <DialogContent
            sx={{
              pt: 0,
              pb: 2,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={detailTab}
              onChange={(_, v) => setDetailTab(v)}
              sx={{
                minHeight: 40,
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
                '& .MuiTab-root': { minHeight: 40, py: 1 },
              }}
            >
              <Tab
                label="Thông tin & File"
                icon={<Iconify icon="solar:document-text-bold" width={16} />}
                iconPosition="start"
              />
              <Tab
                label="Ký số"
                icon={<Iconify icon="solar:shield-check-bold" width={16} />}
                iconPosition="start"
              />
              <Tab
                label="Version"
                icon={<Iconify icon="solar:history-bold" width={16} />}
                iconPosition="start"
              />
              <Tab
                label="Audit Trail"
                icon={<Iconify icon="solar:clipboard-list-bold" width={16} />}
                iconPosition="start"
              />
            </Tabs>

            {detailTab === 0 && (
              <Box
                ref={containerRef}
                sx={{
                  flex: 1,
                  minHeight: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: isMdUp ? 'row' : 'column',
                }}
              >
                <Box
                  sx={{
                    width: isMdUp ? metaWidth : '100%',
                    flex: isMdUp ? `0 0 ${metaWidth}px` : '0 0 auto',
                    borderRight: isMdUp ? '1px solid' : 'none',
                    borderBottom: isMdUp ? 'none' : '1px solid',
                    borderColor: 'divider',
                    p: isMdUp ? 2.5 : 2,
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack spacing={2.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                    <Stack spacing={1.75}>
                      <MetaField label="Nơi gửi" value={doc.sender} />
                      <MetaField label="Nơi nhận" value={doc.receiver} />
                    </Stack>

                    <Stack spacing={1.75}>
                      <MetaField label="Ký số" value={doc.signStatus} />
                      <MetaField label="Nhà cung cấp" value={doc.signProvider} />
                      {doc.signedPositions > 0 && (
                        <MetaField label="Vị trí đã ký" value={`${doc.signedPositions}`} />
                      )}
                      <MetaField label="Phiên bản" value={doc.version} />
                    </Stack>

                    <Stack spacing={1.75}>
                      <MetaField label="Ngày tạo" value={doc.createdAt} />
                      <MetaField
                        label="Đính kèm"
                        value={doc.attachments.length > 0 ? `${doc.attachments.length} tệp` : 'Không có'}
                      />
                    </Stack>
                  </Stack>
                </Box>

                {isMdUp && (
                  <Box
                    role="separator"
                    aria-orientation="vertical"
                    onPointerDown={handleDividerPointerDown}
                    sx={{
                      width: dividerWidth,
                      flex: `0 0 ${dividerWidth}px`,
                      cursor: isResizing ? 'col-resize' : 'col-resize',
                      bgcolor: isResizing ? 'primary.lighter' : 'transparent',
                      transition: 'background-color 0.12s',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                    }}
                  />
                )}

                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minHeight: isMdUp ? 0 : 400,
                    height: isMdUp ? '100%' : undefined,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? 'grey.50' : 'background.default',
                  }}
                >
                  {viewerFiles.length > 0 ? (
                    <FileViewerPanel files={viewerFiles} height="100%" showFileList embedded />
                  ) : (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      spacing={1}
                      sx={{ height: '100%', color: 'text.secondary', px: 3 }}
                    >
                      <Iconify icon="solar:file-remove-bold-duotone" width={40} />
                      <Typography variant="body2">Chưa có tệp đính kèm để xem</Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            )}

            {detailTab === 1 && (
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Nhà cung cấp: <strong>{doc.signProvider}</strong>
                    {' · '}
                    Trạng thái: <strong>{doc.signStatus}</strong>
                    {' · '}
                    Vị trí ký: <strong>{doc.signedPositions}</strong>
                  </Typography>

                  <SignatureStudio
                    files={doc.attachments.map((item) => ({
                      fileName: getAttachmentDisplayName(item),
                      fileUrl: getDemoAttachmentUrl(doc.code, item),
                    }))}
                    onSignComplete={async (signatures) => {
                      const updatedDoc: ManagedDocumentRecord = {
                        ...doc,
                        signStatus: 'Đã ký số',
                        status: doc.status === 'Đang xử lý' ? 'Chờ ký số' : doc.status,
                        signedPositions: signatures.length,
                      };

                      try {
                        await saveDocumentToDemoStorage(updatedDoc);
                        onDocumentUpdated(updatedDoc);
                        enqueueSnackbar('Đã cập nhật trạng thái ký số cho văn bản', { variant: 'success' });
                      } catch (e) {
                        const message = e instanceof Error ? e.message : 'Lỗi không xác định';
                        enqueueSnackbar(`Cập nhật ký số thất bại: ${message}`, { variant: 'error' });
                      }
                    }}
                  />
                </Stack>
              </Box>
            )}

            {detailTab === 2 && (
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'version', label: 'Phiên bản', align: 'center' },
                    { key: 'changedBy', label: 'Người thay đổi' },
                    { key: 'changedAt', label: 'Thời điểm' },
                    { key: 'note', label: 'Ghi chú' },
                  ]}
                  rows={fakeVersions(doc)}
                />
              </Box>
            )}

            {detailTab === 3 && (
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <DataTable
                  columns={[
                    { key: 'action', label: 'Hành động' },
                    { key: 'actor', label: 'Người thực hiện' },
                    { key: 'time', label: 'Thời gian' },
                    { key: 'detail', label: 'Chi tiết' },
                  ]}
                  rows={fakeAudit(doc)}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>Đóng</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
