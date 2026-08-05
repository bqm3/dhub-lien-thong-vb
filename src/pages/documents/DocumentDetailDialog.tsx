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
import { FileViewerItem, FileViewerPanel } from '../../components/file-viewer';
import Iconify from '../../components/iconify';
import { DataTable, StatusChip } from '../../sections/interoperability/components';
import SignatureStudio from '../../components/file-viewer/SignatureStudio';
import { formatFileSize, getS3AttachmentUrl } from '../../services/storageS3Api';
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

  const viewerFiles = useMemo<FileViewerItem[]>(
    () =>
      (doc?.attachments ?? [])
        .map((item: any): FileViewerItem | null => {
          const fileName = typeof item === 'string' ? item : item?.originalFileName || item?.ORIGINAL_FILE_NAME || item?.name || '';
          const objectKey = typeof item === 'string' ? item : item?.objectKey || item?.OBJECT_KEY || fileName;
          const fileSize = typeof item === 'object' ? item?.FILE_SIZE ?? item?.fileSize ?? item?.size : undefined;
          if (!fileName && !objectKey) return null;
          const url = getS3AttachmentUrl(objectKey || fileName);
          return url ? { name: fileName, url, size: fileSize } : null;
        })
        .filter((item): item is FileViewerItem => item !== null),
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  Chi tiết văn bản: {doc.documentNo || doc.code}
                </Typography>
                {doc.subject && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {doc.subject}
                  </Typography>
                )}
              </Box>
              <StatusChip status={doc.status === '1' ? 'Active' : doc.status} />
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
              {/* <Tab
                label="File đính kèm"
                icon={<Iconify icon="solar:paperclip-bold" width={16} />}
                iconPosition="start"
              /> */}
              <Tab
                label="Ký số"
                icon={<Iconify icon="solar:shield-check-bold" width={16} />}
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
                      <MetaField label="Mã văn bản" value={doc.code} />
                      <MetaField label="Số ký hiệu" value={doc.documentNo} />
                      <MetaField label="Loại văn bản" value={doc.documentType} />
                      <MetaField
                        label="Cơ quan gửi"
                        value={doc.senderName ? `${doc.senderName} (${doc.senderCode})` : doc.senderCode}
                      />
                    </Stack>

                    <Stack spacing={1.75}>
                      <MetaField label="Trích yếu" value={doc.subject} />
                      <MetaField label="Thời gian tạo" value={doc.createdAt} />
                      <Box>
                        <MetaField
                          label="Tệp đính kèm"
                          value={`${doc.attachments?.length || 0} tệp`}
                        />
                      </Box>
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

            {/* {detailTab === 1 && (
              <Box sx={{ flex: 1, minHeight: 600, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
                {viewerFiles.length > 0 ? (
                  <FileViewerPanel files={viewerFiles} height="100%" showFileList embedded />
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ height: '100%', color: 'text.secondary', px: 3, py: 8 }}
                  >
                    <Iconify icon="solar:file-remove-bold-duotone" width={40} />
                    <Typography variant="body2">Chưa có tệp đính kèm để xem</Typography>
                  </Stack>
                )}
              </Box>
            )} */}

            {detailTab === 1 && (
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <Stack spacing={2}>
                  <SignatureStudio
                    files={((doc as any).attachments || []).map((item: any) => {
                      const fileName = typeof item === 'string' ? item : item?.originalFileName || item?.name || '';
                      const objectKey = typeof item === 'string' ? item : item?.objectKey || item?.OBJECT_KEY || fileName;
                      return {
                        fileName,
                        fileUrl: getS3AttachmentUrl(objectKey || fileName) || '',
                      };
                    })}
                    onSignComplete={async (signatures) => {
                      const updatedDoc = {
                        ...doc,
                        signStatus: 'Đã ký số',
                        signedPositions: signatures.length,
                      };
                      onDocumentUpdated(updatedDoc as any);
                      enqueueSnackbar('Đã cập nhật trạng thái ký số cho văn bản', { variant: 'success' });
                    }}
                  />
                </Stack>
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
