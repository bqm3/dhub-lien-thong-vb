import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSnackbar } from 'notistack';
import Iconify from '../../../components/iconify';
import { PlacedSignature } from '../workflowTypes';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

const SIGNATURE_SIZE = { width: 200, height: 100 };
const MAX_RETRY_COUNT = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const SIGNATURE_SCALE_STEP = 0.1;
const MIN_SIGNATURE_SCALE = 0.5;
const MAX_SIGNATURE_SCALE = 2;
const PDF_BASE_WIDTH = 595;

type PageDimensions = {
  width: number;
  height: number;
};

type SignaturePosition = {
  id: string;
  fieldName: string;
  x: number;
  y: number;
  pageNumber: number;
  scale: number;
};

export default function SignatureStudio({
  fileName,
  fileUrl,
  onSignComplete,
}: {
  fileName?: string;
  fileUrl?: string;
  onSignComplete?: (signatures: PlacedSignature[]) => void;
}) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const pageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    posX: number;
    posY: number;
    posId: string;
  } | null>(null);

  const [uploadedName, setUploadedName] = useState(fileName ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(fileUrl ?? null);
  const [signatureLink, setSignatureLink] = useState<string | null>(null);
  const [positionsList, setPositionsList] = useState<SignaturePosition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(fileUrl));
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions>({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isPdf = uploadedName.toLowerCase().endsWith('.pdf');
  const isImage = Boolean(previewUrl && !isPdf && /\.(png|jpe?g|gif|webp)$/i.test(uploadedName));

  useEffect(() => {
    setUploadedName(fileName ?? '');
  }, [fileName]);

  useEffect(() => {
    setPreviewUrl(fileUrl ?? null);
    setPositionsList([]);
    setCurrentPage(1);
    setTotalPages(0);
    setPageDimensions({ width: 0, height: 0 });
    setError(null);
    setRetryCount(0);

    if (!fileUrl) {
      setIsLoading(false);
      return;
    }

    const isPdfFile = (fileName ?? '').toLowerCase().endsWith('.pdf');
    const isImageFile = /\.(png|jpe?g|gif|webp)$/i.test(fileName ?? '');
    setIsLoading(isPdfFile || isImageFile);
  }, [fileUrl, fileName]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragMouseMove);
      window.removeEventListener('mouseup', handleDragMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    if (retryCount >= MAX_RETRY_COUNT) {
      enqueueSnackbar('Đã vượt quá số lần thử lại cho phép', { variant: 'error' });
      return;
    }
    setError(null);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      enqueueSnackbar('Kích thước file không được vượt quá 5MB', { variant: 'error' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Chỉ chấp nhận file ảnh chữ ký', { variant: 'error' });
      return;
    }

    setIsUploading(true);
    const url = URL.createObjectURL(file);
    setSignatureLink(url);
    setIsUploading(false);
    event.target.value = '';
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedName(file.name);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPositionsList([]);
    setCurrentPage(1);
    setTotalPages(0);
    setPageDimensions({ width: 0, height: 0 });
    setError(null);
    setIsLoading(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    event.target.value = '';
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (loadError: Error) => {
    setError(`Không thể tải file PDF. ${loadError.message}`);
    setIsLoading(false);
  };

  const handlePageLoadSuccess = (page: { getViewport: (opts: { scale: number }) => { width: number; height: number } }) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageDimensions({
      width: viewport.width,
      height: viewport.height,
    });
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const displayWidth = PDF_BASE_WIDTH;
    const displayHeight = img.naturalWidth
      ? (img.naturalHeight / img.naturalWidth) * displayWidth
      : PDF_BASE_WIDTH * 1.414;

    setPageDimensions({
      width: displayWidth,
      height: displayHeight,
    });
    setTotalPages(1);
    setIsLoading(false);
    setError(null);
  };

  const getCanvasRect = () => {
    if (isPdf) {
      return pageRef.current?.querySelector('canvas')?.getBoundingClientRect();
    }
    return pageRef.current?.getBoundingClientRect();
  };

  const handleDocumentClick = (event: React.MouseEvent, pageNumber: number) => {
    if (isDragging || !signatureLink || !pageDimensions.width) return;

    const rect = getCanvasRect();
    if (!rect) return;

    const scaleX = pageDimensions.width / rect.width;
    const scaleY = pageDimensions.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const yFromTop = (event.clientY - rect.top) * scaleY;

    const xIText = x;
    const yIText = pageDimensions.height - yFromTop;

    const newPos: SignaturePosition = {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      fieldName: 'signature',
      x: xIText,
      y: yIText,
      pageNumber,
      scale: 1,
    };

    setPositionsList((prev) => [...prev, newPos]);
    enqueueSnackbar('Đã chọn thêm vị trí chữ ký', { variant: 'success' });
  };

  const handleRemovePosition = (id: string) => {
    setPositionsList((prev) => prev.filter((pos) => pos.id !== id));
    enqueueSnackbar('Đã xóa vị trí chữ ký', { variant: 'info' });
  };

  const handleDragMouseMove = useCallback((moveEvent: MouseEvent) => {
    if (!dragStartRef.current || !pageDimensions.width) return;

    const rect = getCanvasRect();
    if (!rect) return;

    const scaleX = pageDimensions.width / rect.width;
    const scaleY = pageDimensions.height / rect.height;

    const deltaX = (moveEvent.clientX - dragStartRef.current.mouseX) * scaleX;
    const deltaY = (moveEvent.clientY - dragStartRef.current.mouseY) * scaleY;

    const newX = dragStartRef.current.posX + deltaX;
    const newY = dragStartRef.current.posY - deltaY;
    const targetId = dragStartRef.current.posId;

    setPositionsList((prev) => prev.map((pos) => (pos.id === targetId ? { ...pos, x: newX, y: newY } : pos)));
  }, [pageDimensions.width, pageDimensions.height, isPdf]);

  const handleDragMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    window.removeEventListener('mousemove', handleDragMouseMove);
    window.removeEventListener('mouseup', handleDragMouseUp);
  }, [handleDragMouseMove]);

  const handleSignatureDragStart = (event: React.MouseEvent, posId: string) => {
    event.preventDefault();
    event.stopPropagation();

    const pos = positionsList.find((p) => p.id === posId);
    if (!pos) return;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      posX: pos.x,
      posY: pos.y,
      posId,
    };

    window.addEventListener('mousemove', handleDragMouseMove);
    window.addEventListener('mouseup', handleDragMouseUp);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!Number.isNaN(value) && value >= 50 && value <= 300) {
      setScale(value / 100);
    }
  };

  const handleZoomBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (Number.isNaN(value) || value < 50) {
      setScale(MIN_ZOOM);
    } else if (value > 300) {
      setScale(MAX_ZOOM);
    }
  };

  const handleSignatureScale = (id: string, direction: 'in' | 'out') => {
    setPositionsList((prev) =>
      prev.map((pos) => {
        if (pos.id !== id) return pos;
        const nextScale =
          direction === 'in'
            ? Math.min(pos.scale + SIGNATURE_SCALE_STEP, MAX_SIGNATURE_SCALE)
            : Math.max(pos.scale - SIGNATURE_SCALE_STEP, MIN_SIGNATURE_SCALE);
        return { ...pos, scale: nextScale };
      })
    );
  };

  const handleConfirm = () => {
    if (!previewUrl || positionsList.length === 0) return;

    const signatures: PlacedSignature[] = positionsList.map((pos) => ({
      id: pos.id,
      type: 'main',
      label: 'Chữ ký',
      x: pos.x,
      y: pos.y,
      width: SIGNATURE_SIZE.width * pos.scale,
      height: SIGNATURE_SIZE.height * pos.scale,
      page: pos.pageNumber,
    }));

    onSignComplete?.(signatures);
  };

  const renderPositionMarker = () => {
    if (!signatureLink || positionsList.length === 0 || !pageDimensions.height) return null;

    return positionsList
      .filter((pos) => pos.pageNumber === currentPage)
      .map((pos) => {
        const scaledWidth = SIGNATURE_SIZE.width * pos.scale;
        const scaledHeight = SIGNATURE_SIZE.height * pos.scale;
        const displayX = pos.x - scaledWidth / 2;
        const displayY = pageDimensions.height - pos.y - scaledHeight / 2;

        return (
          <Box
            key={pos.id}
            onMouseDown={(e) => handleSignatureDragStart(e, pos.id)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              left: displayX,
              top: displayY,
              width: scaledWidth,
              height: scaledHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: isDragging && dragStartRef.current?.posId === pos.id ? 'secondary.main' : 'primary.main',
              borderRadius: 1,
              cursor: isDragging && dragStartRef.current?.posId === pos.id ? 'grabbing' : 'grab',
              userSelect: 'none',
              zIndex: 2,
              '&:hover .signature-controls': {
                opacity: 1,
              },
            }}
          >
            <img
              src={signatureLink}
              alt="Chữ ký"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
            <Box
              className="signature-controls"
              sx={{
                position: 'absolute',
                top: -40,
                right: -12,
                display: 'flex',
                gap: 1,
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <IconButton
                onClick={() => handleSignatureScale(pos.id, 'out')}
                size="small"
                sx={{ bgcolor: 'primary.main', color: 'white', width: 24, height: 24, '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <Iconify icon="solar:minus-circle-bold" width={16} />
              </IconButton>
              <IconButton
                onClick={() => handleSignatureScale(pos.id, 'in')}
                size="small"
                sx={{ bgcolor: 'primary.main', color: 'white', width: 24, height: 24, '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <Iconify icon="solar:add-circle-bold" width={16} />
              </IconButton>
              <IconButton
                onClick={() => handleRemovePosition(pos.id)}
                size="small"
                sx={{ bgcolor: 'error.main', color: 'white', width: 24, height: 24, '&:hover': { bgcolor: 'error.dark' } }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
              </IconButton>
            </Box>
          </Box>
        );
      });
  };

  const renderPdfViewer = () => (
    <Box
      ref={pageRef}
      sx={{
        position: 'relative',
        boxShadow: 3,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'common.white',
        maxWidth: `${PDF_BASE_WIDTH}px`,
        cursor: signatureLink ? (isDragging ? 'grabbing' : 'crosshair') : 'default',
      }}
    >
      <Document
        file={previewUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
            <CircularProgress size={40} />
            <Typography>Đang tải tài liệu...</Typography>
          </Box>
        }
        error={
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
            <Typography color="error.main">Không thể tải file PDF</Typography>
            <Button variant="outlined" onClick={handleRetry} size="small">
              Thử lại
            </Button>
          </Box>
        }
        key={`${previewUrl}-${retryCount}`}
      >
        <Page
          key={`page_${currentPage}`}
          pageNumber={currentPage}
          width={PDF_BASE_WIDTH * scale}
          scale={scale}
          onLoadSuccess={handlePageLoadSuccess}
          onClick={(event: React.MouseEvent) => handleDocumentClick(event, currentPage)}
          loading={
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
              <CircularProgress size={40} />
              <Typography>Đang tải trang...</Typography>
            </Box>
          }
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
        {renderPositionMarker()}
      </Document>
    </Box>
  );

  const renderImageViewer = () => (
    <Box
      ref={pageRef}
      onClick={(event) => handleDocumentClick(event, 1)}
      sx={{
        position: 'relative',
        boxShadow: 3,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'common.white',
        maxWidth: `${PDF_BASE_WIDTH * scale}px`,
        cursor: signatureLink ? (isDragging ? 'grabbing' : 'crosshair') : 'default',
      }}
    >
      <img
        src={previewUrl ?? undefined}
        alt={uploadedName}
        onLoad={handleImageLoad}
        style={{
          display: 'block',
          width: PDF_BASE_WIDTH * scale,
          height: 'auto',
        }}
      />
      {renderPositionMarker()}
    </Box>
  );

  return (
    <Grid container spacing={0} sx={{ minHeight: 560, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Grid item xs={12} md={3}>
        <Box
          sx={{
            height: '100%',
            borderRight: { md: '1px solid' },
            borderColor: 'divider',
            bgcolor: theme.palette.grey[50],
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6" color="primary.main">
            Chữ ký của bạn
          </Typography>

          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" width={20} />}>
            Click vào vị trí bạn muốn đặt chữ ký trên tài liệu. Sau đó có thể kéo thả để di chuyển chữ ký đến vị trí mong muốn.
          </Alert>

          {signatureLink && (
            <Box
              sx={{
                width: '100%',
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'common.white',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <img
                src={signatureLink}
                alt="Chữ ký"
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
              />
            </Box>
          )}

          <Button
            component="label"
            variant="outlined"
            disabled={isUploading}
            fullWidth
            startIcon={<Iconify icon="solar:upload-bold" />}
          >
            {signatureLink ? 'Cập nhật chữ ký' : 'Tải lên chữ ký'}
            <input hidden type="file" accept="image/*" onChange={handleSignatureUpload} />
          </Button>

          <Button
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<Iconify icon="solar:document-bold" />}
          >
            Chọn file văn bản
            <input hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleDocumentUpload} />
          </Button>

          {uploadedName && (
            <Typography variant="caption" color="text.secondary">
              File: {uploadedName}
            </Typography>
          )}

          <Alert severity="info" sx={{ mt: 'auto' }}>
            <Typography variant="caption" component="div">
              Trang {currentPage}/{totalPages || 1}
              <br />
              Kích thước: {Math.round(pageDimensions.width)} x {Math.round(pageDimensions.height)}px
              <br />
              Tỷ lệ: {Math.round(scale * 100)}%
              {positionsList.length > 0 && (
                <>
                  <br />
                  Chữ ký đã đặt: {positionsList.length}
                </>
              )}
            </Typography>
          </Alert>
        </Box>
      </Grid>

      <Grid item xs={12} md={9}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 560 }}>
          <Box
            ref={containerRef}
            sx={{
              flex: 1,
              overflow: 'auto',
              bgcolor: theme.palette.grey[100],
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            {error && (
              <Alert
                severity="error"
                sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, maxWidth: '80%' }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetry} disabled={retryCount >= MAX_RETRY_COUNT}>
                    Thử lại
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {!previewUrl && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Chưa có file để hiển thị. Vui lòng chọn file văn bản.</Typography>
              </Box>
            )}

            {previewUrl && isPdf && renderPdfViewer()}
            {previewUrl && isImage && renderImageViewer()}
            {previewUrl && !isPdf && !isImage && (
              <Alert severity="warning">Định dạng file chưa hỗ trợ preview. Vui lòng dùng PDF hoặc ảnh.</Alert>
            )}

            {previewUrl && isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  zIndex: 5,
                }}
              >
                <CircularProgress size={40} />
                <Typography>Đang tải tài liệu...</Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Thu nhỏ">
                <span>
                  <IconButton onClick={handleZoomOut} disabled={scale <= MIN_ZOOM}>
                    <Iconify icon="solar:minus-circle-bold" />
                  </IconButton>
                </span>
              </Tooltip>
              <TextField
                size="small"
                type="number"
                value={Math.round(scale * 100)}
                onChange={handleZoomChange}
                onBlur={handleZoomBlur}
                inputProps={{ min: 50, max: 300, style: { textAlign: 'center', width: 48 } }}
              />
              <Typography variant="body2">%</Typography>
              <Tooltip title="Phóng to">
                <span>
                  <IconButton onClick={handleZoomIn} disabled={scale >= MAX_ZOOM}>
                    <Iconify icon="solar:add-circle-bold" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            {isPdf && totalPages > 0 && (
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="small"
              />
            )}

            <Button
              variant="contained"
              disabled={!signatureLink || positionsList.length === 0}
              onClick={handleConfirm}
              startIcon={<Iconify icon="solar:shield-check-bold" />}
            >
              Xác nhận ký số
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
