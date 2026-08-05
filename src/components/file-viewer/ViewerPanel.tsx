import React, { memo, useRef, useEffect, useState, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Pagination,
  CircularProgress,
  Skeleton,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DownloadIcon from '@mui/icons-material/Download';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RefreshIcon from '@mui/icons-material/Refresh';

// React PDF
import { pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker using local bundle
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
}

// DocViewer
import { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';

import { renderAsync } from 'docx-preview';

import { IOpenedDoc } from '../../hooks/usePdfViewer';

// Lazy-load heavy rendering components
const LazyDocument = lazy(() => import('react-pdf').then((mod) => ({ default: mod.Document })));
const LazyPage = lazy(() => import('react-pdf').then((mod) => ({ default: mod.Page })));
const LazyDocViewer = lazy(() => import('@cyntler/react-doc-viewer'));

export interface DocViewerFile {
  uri: string;
  fileName?: string;
  fileType?: string;
}

function DocxViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Không thể nạp tệp Word');
        return res.arrayBuffer();
      })
      .then(async (buffer) => {
        if (isCancelled || !containerRef.current) return;
        containerRef.current.innerHTML = '';
        await renderAsync(buffer, containerRef.current, undefined, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          experimental: true,
        });
        if (!isCancelled) setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Lỗi khi render docx-preview:', err);
        setError('Không thể hiển thị xem trước tệp Word (.docx). Vui lòng tải về máy để xem.');
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#f8fafc',
        borderRadius: 1.5,
        border: '1px solid #e2e8f0',
        overflow: 'auto',
        position: 'relative',
        p: 2.5,
      }}
    >
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Đang nạp xem trước tệp Word (.docx)...
          </Typography>
        </Box>
      )}
      {error && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, color: 'error.main' }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
      <Box
        ref={containerRef}
        sx={{
          display: loading || error ? 'none' : 'flex',
          justifyContent: 'center',
          width: '100%',
          '& .docx-wrapper': {
            bgcolor: 'transparent',
            padding: '0 !important',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
            width: '100%',
          },
          '& .docx-wrapper > section.docx': {
            bgcolor: 'white !important',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1) !important',
            borderRadius: '4px !important',
            margin: '0 auto 16px auto !important',
            maxWidth: '100%',
          },
        }}
      />
    </Box>
  );
}

const DOC_VIEWER_SX = {
  width: '100%',
  height: '100%',
  flex: 1,
  alignSelf: 'stretch',
  bgcolor: 'white',
  borderRadius: 1.5,
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  '& .doc-viewer-wrapper': {
    height: '100%',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  '& .doc-viewer-wrapper #react-doc-viewer, .doc-viewer-wrapper #react-doc-viewer > div, .doc-viewer-wrapper #proxy-renderer, .doc-viewer-wrapper #msdoc-renderer, .doc-viewer-wrapper #pdf-renderer, .doc-viewer-wrapper #txt-renderer, .doc-viewer-wrapper #csv-renderer, .doc-viewer-wrapper #html-renderer':
  {
    height: '100% !important',
    width: '100% !important',
    flex: '1 !important',
    display: 'flex !important',
    flexDirection: 'column !important',
  },
  '& .doc-viewer-wrapper iframe, .doc-viewer-wrapper #msdoc-iframe, .doc-viewer-wrapper #pdf-iframe, .doc-viewer-wrapper #html-body':
  {
    height: '100% !important',
    width: '100% !important',
    border: 'none !important',
    flex: '1 !important',
  },
};

interface DocTabBarProps {
  openedDocs: IOpenedDoc[];
  activePdfUrl: string | null;
  onSelectTab: (url: string, name: string) => void;
  onCloseTab: (url: string, e: React.MouseEvent) => void;
}

const DocTabBar = memo<DocTabBarProps>(({ openedDocs, activePdfUrl, onSelectTab, onCloseTab }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let isDown = false;
    let startX = 0;
    let scrollLeftVal = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - scroller.offsetLeft;
      scrollLeftVal = scroller.scrollLeft;
      scroller.style.cursor = 'grabbing';
    };

    const onMouseLeave = () => {
      isDown = false;
      scroller.style.cursor = 'grab';
    };

    const onMouseUp = () => {
      isDown = false;
      scroller.style.cursor = 'grab';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scroller.offsetLeft;
      const walk = (x - startX) * 1.5;
      scroller.scrollLeft = scrollLeftVal - walk;
    };

    scroller.addEventListener('mousedown', onMouseDown);
    scroller.addEventListener('mouseleave', onMouseLeave);
    scroller.addEventListener('mouseup', onMouseUp);
    scroller.addEventListener('mousemove', onMouseMove);

    return () => {
      scroller.removeEventListener('mousedown', onMouseDown);
      scroller.removeEventListener('mouseleave', onMouseLeave);
      scroller.removeEventListener('mouseup', onMouseUp);
      scroller.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <Box
      ref={scrollRef}
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        bgcolor: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
        cursor: 'grab',
        userSelect: 'none',
        '&::-webkit-scrollbar': { height: '4px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '2px' },
      }}
    >
      {openedDocs.map((doc) => {
        const isActive = activePdfUrl === doc.url;
        return (
          <Box
            key={doc.url}
            onClick={() => onSelectTab(doc.url, doc.name)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              cursor: 'pointer',
              bgcolor: isActive ? 'background.paper' : 'transparent',
              borderRight: '1px solid #e2e8f0',
              borderBottom: isActive ? 'none' : '1px solid #e2e8f0',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: isActive ? 'background.paper' : '#e2e8f0' },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'primary.main' : 'text.secondary',
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {doc.name}
            </Typography>
            <IconButton
              size="small"
              aria-label={`Đóng ${doc.name}`}
              onClick={(e) => onCloseTab(doc.url, e)}
              sx={{
                p: 0.15,
                color: 'text.secondary',
                '&:hover': { bgcolor: '#cbd5e1', color: 'error.main' },
              }}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
});

interface ViewerToolbarProps {
  isPdf: boolean;
  scale: number;
  zoomIn: () => void;
  zoomOut: () => void;
  handleDownload: () => void;
  securedPdfUrl: string | null;
  rotateClockwise: () => void;
  numPages: number;
  currentPage: number;
  handlePageChange: (e: React.ChangeEvent<unknown>, page: number) => void;
}

const ViewerToolbar = memo<ViewerToolbarProps>(
  ({
    isPdf,
    scale,
    zoomIn,
    zoomOut,
    handleDownload,
    securedPdfUrl,
    rotateClockwise,
    numPages,
    currentPage,
    handlePageChange,
  }) => (
    <Box
      sx={{
        p: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isPdf && (
          <>
            <Tooltip title="Thu nhỏ" PopperProps={{ sx: { zIndex: 1800 } }}>
              <IconButton size="small" aria-label="Thu nhỏ" onClick={zoomOut}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </Typography>
            <Tooltip title="Phóng to" PopperProps={{ sx: { zIndex: 1800 } }}>
              <IconButton size="small" aria-label="Phóng to" onClick={zoomIn}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="Tải xuống" PopperProps={{ sx: { zIndex: 1800 } }}>
          <IconButton size="small" aria-label="Tải xuống" onClick={handleDownload} disabled={!securedPdfUrl}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {isPdf && (
          <Tooltip title="Xoay" PopperProps={{ sx: { zIndex: 1800 } }}>
            <IconButton size="small" aria-label="Xoay" onClick={rotateClockwise}>
              <RotateRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {isPdf && securedPdfUrl && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 32 }}>
          {numPages > 0 ? (
            <>
              <Pagination
                count={numPages}
                page={currentPage}
                onChange={handlePageChange}
                size="small"
                color="primary"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}
              >
                {`${numPages} trang`}
              </Typography>
            </>
          ) : (
            <Skeleton variant="rounded" width={130} height={26} animation="wave" />
          )}
        </Box>
      )}
    </Box>
  )
);

export interface ViewerPanelProps {
  openedDocs: IOpenedDoc[];
  activePdfUrl: string | null;
  activePdfName: string;
  securedPdfUrl: string | null;
  fileExt: string;
  isPdf: boolean;
  isDocViewerSupported: boolean;
  docs: DocViewerFile[];
  headers: Record<string, string> | undefined;
  scale: number;
  rotation: number;
  pdfBaseRotation: number;
  numPages: number;
  currentPage: number;
  pdfError: string | null;
  loadTimeout: boolean;
  pdfContainerRef: React.RefObject<HTMLDivElement | null>;
  zoomIn: () => void;
  zoomOut: () => void;
  rotateClockwise: () => void;
  handleDownload: () => void;
  handleSelectPdf: (url: string, name: string) => void;
  handleCloseTab: (url: string, e: React.MouseEvent) => void;
  handlePageChange: (e: React.ChangeEvent<unknown>, page: number) => void;
  onDocumentLoadSuccess: (data: { numPages: number }) => void;
  onPageLoadSuccess: (page: any) => void;
  onDocumentLoadError: (error: Error) => void;
  onRetry?: () => void;
  tabBarLeftAction?: React.ReactNode;
  embedded?: boolean;
}

const ViewerPanel: React.FC<ViewerPanelProps> = ({
  openedDocs,
  activePdfUrl,
  activePdfName,
  securedPdfUrl,
  fileExt,
  isPdf,
  isDocViewerSupported,
  docs,
  headers,
  scale,
  rotation,
  pdfBaseRotation,
  numPages,
  currentPage,
  pdfError,
  loadTimeout,
  pdfContainerRef,
  zoomIn,
  zoomOut,
  rotateClockwise,
  handleDownload,
  handleSelectPdf,
  handleCloseTab,
  handlePageChange,
  onDocumentLoadSuccess,
  onPageLoadSuccess,
  onDocumentLoadError,
  onRetry,
  tabBarLeftAction = null,
  embedded = false,
}) => {
  const theme = useTheme();
  const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(fileExt);

  const [firstPageHeight, setFirstPageHeight] = useState<number | null>(null);

  const handleFirstPageLoad = (page: any) => {
    try {
      const viewport = page.getViewport ? page.getViewport({ scale: 1 }) : null;
      const baseHeight = viewport?.height || page.height || page.originalHeight || 820;
      setFirstPageHeight(baseHeight);
    } catch {
      setFirstPageHeight(820);
    }
    onPageLoadSuccess(page);
  };

  const basePageHeight = firstPageHeight ?? 820;
  const estimatedPageHeight = basePageHeight * scale;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: embedded ? 0 : 560,
        border: embedded ? 'none' : '1px solid #e2e8f0',
        borderRadius: embedded ? 0 : '12px',
        overflow: 'hidden',
        backgroundColor: theme.palette.grey[50],
        boxShadow: embedded ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tab bar hiển thị các file đang mở */}
      {openedDocs.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
          {tabBarLeftAction}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DocTabBar
              openedDocs={openedDocs}
              activePdfUrl={activePdfUrl}
              onSelectTab={handleSelectPdf}
              onCloseTab={handleCloseTab}
            />
          </Box>
        </Box>
      )}
      {/* Toolbar */}
      <ViewerToolbar
        isPdf={isPdf}
        scale={scale}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        handleDownload={handleDownload}
        securedPdfUrl={securedPdfUrl}
        rotateClockwise={rotateClockwise}
        numPages={numPages}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
      {/* Content Area */}
      <Box
        ref={pdfContainerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {isImage && securedPdfUrl ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <img
              src={securedPdfUrl}
              alt={activePdfName}
              style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            />
          </Box>
        ) : fileExt === '.docx' && securedPdfUrl ? (
          <DocxViewer url={securedPdfUrl} />
        ) : isDocViewerSupported && securedPdfUrl && docs.length > 0 ? (
          <Box sx={DOC_VIEWER_SX}>
            <div className="doc-viewer-wrapper">
              <Suspense
                fallback={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={36} />
                  </Box>
                }
              >
                <LazyDocViewer
                  documents={docs}
                  pluginRenderers={DocViewerRenderers}
                  prefetchMethod="GET"
                  requestHeaders={headers}
                  config={{
                    header: {
                      disableHeader: true,
                      disableFileName: true,
                      retainURLParams: true,
                    },
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              </Suspense>
            </div>
          </Box>
        ) : isPdf && securedPdfUrl ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              width: '100%',
            }}
          >
            {pdfError ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'error.main',
                  p: 4,
                  gap: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {pdfError}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {onRetry && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={onRetry}
                      startIcon={<RefreshIcon />}
                      sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                      Thử tải lại
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={handleDownload}
                    startIcon={<DownloadIcon />}
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                  >
                    Tải xuống tệp
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Suspense
                fallback={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={36} />
                  </Box>
                }
              >
                <LazyDocument
                  file={securedPdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 6,
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={36} />
                      {loadTimeout && (
                        <Box sx={{ textAlign: 'center', px: 2 }}>
                          <Typography
                            variant="caption"
                            color="warning.main"
                            display="block"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            Tải tài liệu đang mất nhiều thời gian hơn bình thường...
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem' }}
                          >
                            Tải xuống trực tiếp để xem
                          </Button>
                        </Box>
                      )}
                    </Box>
                  }
                >
                  {Array.from({ length: numPages || 0 }, (_, i) => {
                    const page = i + 1;
                    const inBuffer = Math.abs(page - currentPage) <= 2;

                    return (
                      <Box
                        key={page}
                        id={`pdf-page-${page}`}
                        sx={{
                          mb: 1.5,
                          boxShadow: inBuffer ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                          borderRadius: 0.5,
                          overflow: 'hidden',
                          bgcolor: inBuffer ? 'white' : 'transparent',
                          display: 'flex',
                          justifyContent: 'center',
                          minHeight: inBuffer ? 'auto' : `${estimatedPageHeight}px`,
                          height: inBuffer ? 'auto' : `${estimatedPageHeight}px`,
                          width: '100%',
                        }}
                      >
                        {inBuffer ? (
                          <LazyPage
                            pageNumber={page}
                            scale={scale}
                            rotate={(pdfBaseRotation + rotation) % 360}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            onLoadSuccess={i === 0 ? handleFirstPageLoad : undefined}
                          />
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%',
                              bgcolor: '#f8fafc',
                              width: '100%',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '4px',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Đang tải trang {page}...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </LazyDocument>
              </Suspense>
            )}
          </Box>
        ) : securedPdfUrl ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 3,
              maxWidth: 420,
              alignSelf: 'center',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                mb: 2.5,
                bgcolor: '#f8fafc',
                color: '#64748b',
              }}
            >
              <InsertDriveFileIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
              Tài liệu {fileExt.replace('.', '').toUpperCase()}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3.5, px: 2, lineHeight: 1.5 }}
            >
              Định dạng tệp tin này không hỗ trợ xem trực tiếp trên trình duyệt. Vui lòng tải về máy
              tính để mở.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', px: 3, py: 1 }}
            >
              Tải xuống tài liệu
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <Typography>Không có tài liệu để hiển thị</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default memo(ViewerPanel);
