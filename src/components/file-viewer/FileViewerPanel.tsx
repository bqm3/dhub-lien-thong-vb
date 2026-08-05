import { memo, useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Iconify from '../iconify';
import { usePdfViewer } from '../../hooks/usePdfViewer';
import ViewerPanel from './ViewerPanel';

import { formatFileSize } from '../../services/storageS3Api';

export type FileViewerItem = {
  name: string;
  url: string;
  size?: number;
};

type FileViewerPanelProps = {
  files: FileViewerItem[];
  height?: number | string;
  showFileList?: boolean;
  headers?: Record<string, string>;
  embedded?: boolean;
};

function FileViewerPanel({ files, height = 620, showFileList = true, headers, embedded = false }: FileViewerPanelProps) {
  const viewer = usePdfViewer(files, headers);
  const [isListCollapsed, setIsListCollapsed] = useState(false);

  const renderFileList = Boolean(showFileList && !isListCollapsed);

  const gridTemplateColumns = !showFileList
    ? '1fr'
    : renderFileList
      ? { xs: '1fr', md: '240px 1fr' }
      : '1fr';

  const tabBarRightAction =
    showFileList && isListCollapsed ? (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          bgcolor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          px: 0.5,
        }}
      >
        <Tooltip title="Mở danh sách file">
          <IconButton
            size="small"
            onClick={() => setIsListCollapsed(false)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns,
        gap: renderFileList ? 2 : 0,
        minHeight: height,
        height,
      }}
    >
      {renderFileList && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 1.5,
            maxHeight: height,
            overflow: 'auto',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
            <Typography variant="subtitle2">Danh sách file ({files.length})</Typography>
            <Tooltip title="Thu gọn danh sách file">
              <IconButton size="small" onClick={() => setIsListCollapsed(true)}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack spacing={1}>
            {files.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Không có file đính kèm.
              </Typography>
            )}
            {files.map((file) => {
              const isActive = viewer.activePdfUrl === file.url;
              return (
                <Box
                  key={file.url}
                  onClick={() => viewer.handleSelectPdf(file.url, file.name)}
                  sx={{
                    p: 1.25,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isActive ? 'primary.main' : 'divider',
                    bgcolor: isActive ? 'primary.lighter' : 'background.neutral',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Iconify
                      icon={file.name.toLowerCase().endsWith('.pdf') ? 'solar:file-text-bold' : 'solar:document-bold'}
                      width={18}
                      sx={{ mt: 0.25, color: isActive ? 'primary.main' : 'text.secondary' }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          wordBreak: 'break-word',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'primary.darker' : 'text.primary',
                        }}
                      >
                        {file.name}
                      </Typography>
                      {file.size !== undefined && file.size !== null && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem', display: 'block', mt: 0.25 }}
                        >
                          {formatFileSize(file.size)}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      <Box sx={{ minHeight: height, height, minWidth: 0 }}>
        <ViewerPanel
          embedded={embedded}
          tabBarLeftAction={tabBarRightAction}
          openedDocs={viewer.openedDocs}
          activePdfUrl={viewer.activePdfUrl}
          activePdfName={viewer.activePdfName}
          securedPdfUrl={viewer.securedPdfUrl}
          fileExt={viewer.fileExt}
          isPdf={viewer.isPdf}
          isDocViewerSupported={viewer.isDocViewerSupported}
          docs={viewer.docs}
          headers={viewer.headers}
          scale={viewer.scale}
          rotation={viewer.rotation}
          pdfBaseRotation={viewer.pdfBaseRotation}
          numPages={viewer.numPages}
          currentPage={viewer.currentPage}
          pdfError={viewer.pdfError}
          loadTimeout={viewer.loadTimeout}
          pdfContainerRef={viewer.pdfContainerRef}
          zoomIn={viewer.zoomIn}
          zoomOut={viewer.zoomOut}
          rotateClockwise={viewer.rotateClockwise}
          handleDownload={viewer.handleDownload}
          handleSelectPdf={viewer.handleSelectPdf}
          handleCloseTab={viewer.handleCloseTab}
          handlePageChange={viewer.handlePageChange}
          onDocumentLoadSuccess={viewer.onDocumentLoadSuccess}
          onPageLoadSuccess={viewer.onPageLoadSuccess}
          onDocumentLoadError={viewer.onDocumentLoadError}
          onRetry={viewer.retryLoad}
        />
      </Box>
    </Box>
  );
}

export default memo(FileViewerPanel);
