import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '../../utils/axios';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSnackbar } from 'notistack';
import Iconify from '../iconify';
import { signLocalCert, updateSignedFileBackend } from '../../services/localSignApi';
import { BUCKET_MINIO } from '../../config';



if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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

export function generateSignatureStampImage(params?: {
  unitName?: string;
  signDate?: string;
  statusText?: string;
}): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 377;
  canvas.height = 144;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const unitName = params?.unitName || 'Công TY TNHH';
  const signDate = params?.signDate || `${day}/${month}/${year}`;
  const statusText = params?.statusText || 'Signature Valid';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Viền ngoài #00C85C
  ctx.strokeStyle = '#00C85C';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Vẽ khối tích xanh lục lá cây chuẩn vector theo Figma M75...
  ctx.save();
  const p = new Path2D(
    'M151.156 57.979L181.797 83.6906L225.508 31.5994L237.764 41.884L183.77 106.232L140.871 70.2358L151.156 57.979Z'
  );
  ctx.fillStyle = '#00A619';
  ctx.fill(p);
  ctx.strokeStyle = 'rgba(26, 132, 87, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke(p);
  ctx.restore();

  // Text màu #D11B0E font 'Times New Roman'
  ctx.fillStyle = '#D11B0E';
  ctx.font = 'bold 24px "Times New Roman", Times, serif';

  // Dòng 1: Signature Valid (top 6.28px -> Y ~ 34px)
  ctx.fillText(statusText, 20, 34);

  // Dòng 2: Ký bởi: [unitName] (top 20.15px -> Y ~ 68px)
  ctx.fillText(`Ký bởi: ${unitName}`, 20, 68);

  // Dòng 3: Ký ngày: [signDate] (top 48.28px -> Y ~ 122px)
  ctx.fillText(`Ký ngày: ${signDate}`, 20, 122);

  return canvas.toDataURL('image/png');
}

export type SignatureType = 'initial' | 'main' | 'stamp';

type PlacedSignature = {
  id: string;
  type: SignatureType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
};

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

type SignatureFileItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  objectKey?: string;
  attachmentCode?: string;
};

export default function SignatureStudio({
  fileName,
  fileUrl,
  files,
  previewOnly = false,
  onSignComplete,
  onClose,
}: {
  fileName?: string;
  fileUrl?: string;
  files?: { fileName: string; fileUrl?: string; objectKey?: string; attachmentCode?: string }[];
  previewOnly?: boolean;
  onSignComplete?: (signatures: PlacedSignature[]) => void;
  onClose?: () => void;
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

  const initialFiles: SignatureFileItem[] = (() => {
    if (files && files.length > 0) {
      return files
        .filter((item) => item.fileName || item.objectKey)
        .map((item, index) => ({
          id: `prop_${index}_${item.fileName || item.objectKey}`,
          fileName: item.fileName || item.objectKey || '',
          fileUrl: item.fileUrl || '',
          objectKey: item.objectKey || item.fileName || '',
          attachmentCode: item?.attachmentCode || '',
        }));
    }
    if (fileName) {
      return [{ id: `prop_0_${fileName}`, fileName, fileUrl: fileUrl || '', objectKey: fileName }];
    }
    return [];
  })();

  const [fileList, setFileList] = useState<SignatureFileItem[]>(initialFiles);
  const [openTabIds, setOpenTabIds] = useState<string[]>(initialFiles[0] ? [initialFiles[0].id] : []);
  const [activeFileId, setActiveFileId] = useState<string | null>(initialFiles[0]?.id ?? null);
  const [uploadedName, setUploadedName] = useState(initialFiles[0]?.fileName ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialFiles[0]?.fileUrl || null);
  const [signatureLink, setSignatureLink] = useState<string | null>(null);
  const [signerUnit, setSignerUnit] = useState<string>('Công Ty TNHH');
  const [positionsList, setPositionsList] = useState<SignaturePosition[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(initialFiles[0]?.fileUrl));
  const [isUploading, setIsUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions>({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const handleGenerateStamp = useCallback((unitName?: string) => {
    const stampUrl = generateSignatureStampImage({ unitName: unitName || signerUnit });
    setSignatureLink(stampUrl);
  }, [signerUnit]);

  useEffect(() => {
    if (!signatureLink && typeof window !== 'undefined') {
      const stampUrl = generateSignatureStampImage({ unitName: signerUnit });
      setSignatureLink(stampUrl);
    }
  }, [signatureLink, signerUnit]);

  const handleConfirm = async () => {
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

    const rawBase64Image = signatureLink ? signatureLink.replace(/^data:image\/png;base64,/, '') : undefined;
    const firstPos = positionsList[0];

    const scaledWidth = firstPos ? Math.round(SIGNATURE_SIZE.width * firstPos.scale) : 0;
    const scaledHeight = firstPos ? Math.round(SIGNATURE_SIZE.height * firstPos.scale) : 0;

    const pdfAppearance = firstPos
      ? {
        page: firstPos.pageNumber,
        marginLeft: Math.max(0, Math.round(firstPos.x - scaledWidth / 2)),
        marginBottom: Math.max(0, Math.round(firstPos.y - scaledHeight / 2)),
        width: scaledWidth,
        height: scaledHeight,
        imageBase64: rawBase64Image,
      }
      : undefined;

    setIsSigning(true);
    try {
      const activeFile = fileList.find((item) => item.id === activeFileId);
      const rawObjectKey = activeFile?.objectKey || activeFile?.fileName || uploadedName || fileName || '';
      const inputPath = rawObjectKey.trim();
      const outputPath = inputPath ? inputPath.replace(/\.pdf$/i, '_sign.pdf') : undefined;
      const attachmentCode = activeFile?.attachmentCode;

      const signRes = await signLocalCert({
        inputPath,
        outputPath,
        reason: 'Ký văn bản liên thông DIP',
        pdfAppearance,
      });

      if (signRes && signRes.success === false) {
        throw new Error(signRes.message || 'Ký số chứng thư local thất bại.');
      }

      const finalSignedPath = signRes?.outputPath || outputPath || '';

      const payload = {
        Attachment_Code: attachmentCode || '',
        Input_Object_Key: inputPath,
        Signed_Object_Key: BUCKET_MINIO + "/" + finalSignedPath,
        Original_File_Name: activeFile?.fileName || '',
        Sign_Status: 'SIGNED',
      };

      // Chỉ gọi API C# Backend cập nhật sau khi signLocalCert ký xong thành công
      await updateSignedFileBackend(payload);

      enqueueSnackbar(signRes?.message || `Ký số bằng chứng thư local thành công! File ký: ${outputPath}`, { variant: 'success' });
      onSignComplete?.(signatures);
      onClose?.();
    } catch (err: any) {
      console.error('Local sign error:', err);

      onSignComplete?.(signatures);
      onClose?.();
    } finally {
      setIsSigning(false);
    }
  };

  const isPdf = uploadedName.toLowerCase().endsWith('.pdf');
  const isImage = Boolean(previewUrl && !isPdf && /\.(png|jpe?g|gif|webp)$/i.test(uploadedName));
  const openTabs = fileList.filter((item) => openTabIds.indexOf(item.id) !== -1);

  const pdfFileProp = useMemo(() => {
    if (!previewUrl) return null;
    if (previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')) {
      return previewUrl;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const authHeader = token && typeof token === 'string' && token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return {
      url: previewUrl,
      httpHeaders: { Authorization: authHeader },
      withCredentials: false,
    };
  }, [previewUrl]);

  const [securedImageUrl, setSecuredImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!previewUrl || isPdf) {
      setSecuredImageUrl(null);
      return;
    }
    if (previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')) {
      setSecuredImageUrl(previewUrl);
      return;
    }
    let isCancelled = false;
    axiosInstance
      .get(previewUrl, { responseType: 'blob' })
      .then((res) => {
        if (isCancelled) return;
        const blobUrl = URL.createObjectURL(res.data);
        setSecuredImageUrl(blobUrl);
      })
      .catch(() => {
        if (isCancelled) return;
        setSecuredImageUrl(previewUrl);
      });
    return () => {
      isCancelled = true;
    };
  }, [previewUrl, isPdf]);

  const loadFileContent = useCallback((item: SignatureFileItem) => {
    setActiveFileId(item.id);
    setUploadedName(item.fileName);
    setPreviewUrl(item.fileUrl || null);
    setPositionsList([]);
    setCurrentPage(1);
    setTotalPages(0);
    setPageDimensions({ width: 0, height: 0 });
    setRetryCount(0);

    const isPdfFile = item.fileName.toLowerCase().endsWith('.pdf');
    const isImageFile = /\.(png|jpe?g|gif|webp)$/i.test(item.fileName);
    setIsLoading(Boolean(item.fileUrl) && (isPdfFile || isImageFile));
  }, []);

  const openFileTab = useCallback(
    (item: SignatureFileItem) => {
      setOpenTabIds((prev) => (prev.indexOf(item.id) !== -1 ? prev : [...prev, item.id]));
      loadFileContent(item);
    },
    [loadFileContent]
  );

  const closeFileTab = useCallback(
    (fileId: string) => {
      setOpenTabIds((prev) => {
        const nextIds = prev.filter((id) => id !== fileId);
        const wasActive = activeFileId === fileId;

        if (wasActive) {
          if (nextIds.length > 0) {
            const fallback = fileList.find((item) => item.id === nextIds[nextIds.length - 1]);
            if (fallback) {
              loadFileContent(fallback);
            }
          } else {
            setActiveFileId(null);
            setUploadedName('');
            setPreviewUrl(null);
            setPositionsList([]);
            setCurrentPage(1);
            setTotalPages(0);
            setPageDimensions({ width: 0, height: 0 });
            setIsLoading(false);
          }
        }

        return nextIds;
      });
    },
    [activeFileId, fileList, loadFileContent]
  );

  useEffect(() => {
    const nextFiles =
      files && files.length > 0
        ? files
          .filter((item) => item.fileName)
          .map((item, index) => ({
            id: `prop_${index}_${item.fileName}`,
            fileName: item.fileName,
            fileUrl: item.fileUrl || '',
            objectKey: item.objectKey || '',
            attachmentCode: item?.attachmentCode || ''
          }))
        : fileName
          ? [{ id: `prop_0_${fileName}`, fileName, fileUrl: fileUrl || '' }]
          : [];

    setFileList(nextFiles);
    if (nextFiles.length > 0) {
      setOpenTabIds([nextFiles[0].id]);
      loadFileContent(nextFiles[0]);
    } else {
      setOpenTabIds([]);
      setActiveFileId(null);
      setUploadedName('');
      setPreviewUrl(null);
      setIsLoading(false);
    }
    // Intentionally sync when source file identity changes, not on every new array reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fileName,
    fileUrl,
    loadFileContent,
    JSON.stringify((files ?? []).map((item) => `${item.fileName}|${item.fileUrl ?? ''}`)),
  ]);

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
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    const nextItems: SignatureFileItem[] = selected.map((file, index) => ({
      id: `local_${Date.now()}_${index}_${file.name}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
    }));

    setFileList((prev) => [...prev, ...nextItems]);
    // Chỉ mở tab file đầu tiên trong lần chọn; các file còn lại nằm trong danh sách để mở khi cần.
    openFileTab(nextItems[0]);
    event.target.value = '';
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
  };

  const handleDocumentLoadError = (loadError: Error) => {
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

    setPositionsList([newPos]);
    enqueueSnackbar('Đã chọn vị trí chữ ký', { variant: 'success' });
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
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: 'common.white',
        maxWidth: `${PDF_BASE_WIDTH}px`,
        cursor: !previewOnly && signatureLink ? (isDragging ? 'grabbing' : 'crosshair') : 'default',
      }}
    >
      <Document
        file={pdfFileProp}
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
          onClick={(event: React.MouseEvent) => {
            if (previewOnly) return;
            handleDocumentClick(event, currentPage);
          }}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
        {!previewOnly && renderPositionMarker()}
      </Document>
    </Box>
  );

  const renderImageViewer = () => (
    <Box
      ref={pageRef}
      onClick={(event) => {
        if (previewOnly) return;
        handleDocumentClick(event, 1);
      }}
      sx={{
        position: 'relative',
        boxShadow: 3,
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: 'common.white',
        maxWidth: `${PDF_BASE_WIDTH * scale}px`,
        cursor: !previewOnly && signatureLink ? (isDragging ? 'grabbing' : 'crosshair') : 'default',
      }}
    >
      <img
        src={securedImageUrl || previewUrl || undefined}
        alt={uploadedName}
        onLoad={handleImageLoad}
        style={{
          display: 'block',
          width: PDF_BASE_WIDTH * scale,
          height: 'auto',
        }}
      />
      {!previewOnly && renderPositionMarker()}
    </Box>
  );

  return (
    <Grid container spacing={0} sx={{ minHeight: 560, border: '1px solid', borderColor: 'divider', borderRadius: 0, overflow: 'hidden' }}>
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
            {previewOnly ? 'File đính kèm' : 'Chữ ký của bạn'}
          </Typography>

          {!previewOnly && (
            <>
              <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" width={20} />}>
                Click vào vị trí bạn muốn đặt chữ ký trên tài liệu. Sau đó có thể kéo thả để di chuyển chữ ký đến vị trí mong muốn.
              </Alert>

              <Alert severity="info">
                <Typography variant="caption" component="div">
                  File đang mở: {uploadedName || '—'}
                  <br />
                  Tab đang mở: {openTabs.length}/{fileList.length}
                  <br />
                  Trang {currentPage}/{totalPages || 1}
                  <br />
                  Tỷ lệ: {Math.round(scale * 100)}%
                  {!previewOnly && positionsList.length > 0 && (
                    <>
                      <br />
                      Chữ ký đã đặt: {positionsList.length}
                    </>
                  )}
                </Typography>

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

              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <TextField
                  label="Tên đơn vị ký"
                  size="small"
                  fullWidth
                  value={signerUnit}
                  onChange={(e) => setSignerUnit(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  size="small"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  onClick={() => handleGenerateStamp(signerUnit)}
                >
                  Tạo con dấu chữ ký số
                </Button>
                <Button
                  component="label"
                  variant="outlined"
                  disabled={isUploading}
                  fullWidth
                  size="small"
                  startIcon={<Iconify icon="solar:upload-bold" />}
                >
                  Tải lên ảnh chữ ký khác
                  <input hidden type="file" accept="image/*" onChange={handleSignatureUpload} />
                </Button>
              </Stack>

              {/* <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<Iconify icon="solar:document-bold" />}
              >
                Chọn file văn bản
                <input hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" multiple onChange={handleDocumentUpload} />
              </Button> */}
            </>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Danh sách file ({fileList.length})
            </Typography>
            {fileList.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                Chưa có file.
              </Typography>
            ) : (
              <Stack spacing={1} sx={{ maxHeight: previewOnly ? 420 : 220, overflowY: 'auto' }}>
                {fileList.map((item) => {
                  const isOpen = openTabIds.indexOf(item.id) !== -1;
                  const isActive = item.id === activeFileId;
                  return (
                    <Box
                      key={item.id}
                      onClick={() => openFileTab(item)}
                      sx={{
                        p: 1.25,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: isActive ? 'primary.main' : 'divider',
                        bgcolor: isActive ? 'primary.lighter' : 'common.white',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Iconify
                        icon={item.fileName.toLowerCase().endsWith('.pdf') ? 'solar:file-text-bold' : 'solar:gallery-bold'}
                        width={18}
                        sx={{ mt: 0.25, color: isActive ? 'primary.main' : 'text.secondary', flexShrink: 0 }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            wordBreak: 'break-word',
                            color: isActive ? 'primary.darker' : 'text.primary',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {item.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isOpen ? (isActive ? 'Đang mở' : 'Đã mở tab') : 'Bấm để mở tab'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={9}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 560 }}>
          {openTabs.length > 0 && (
            <Tabs
              value={activeFileId ?? false}
              onChange={(_, value: string) => {
                const next = openTabs.find((item) => item.id === value);
                if (next) loadFileContent(next);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                px: 1,
                '& .MuiTab-root': {
                  minHeight: 44,
                  textTransform: 'none',
                  maxWidth: 280,
                },
              }}
            >
              {openTabs.map((item) => (
                <Tab
                  key={item.id}
                  value={item.id}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ maxWidth: 240 }}>
                      <Iconify
                        icon={item.fileName.toLowerCase().endsWith('.pdf') ? 'solar:file-text-bold' : 'solar:gallery-bold'}
                        width={16}
                      />
                      <Typography variant="body2" noWrap title={item.fileName} sx={{ maxWidth: 160 }}>
                        {item.fileName}
                      </Typography>
                      <Box
                        component="span"
                        role="button"
                        aria-label={`Đóng ${item.fileName}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          closeFileTab(item.id);
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                        sx={{
                          width: 18,
                          height: 18,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          color: 'text.secondary',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            color: 'error.main',
                          },
                        }}
                      >
                        <Iconify icon="eva:close-fill" width={14} />
                      </Box>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          )}

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
            {/* {error && (
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
            )} */}

            {!previewUrl && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">
                  {fileList.length === 0
                    ? 'Chưa có file để hiển thị. Vui lòng chọn file văn bản.'
                    : 'Chưa có tab nào đang mở. Bấm một file ở danh sách bên trái để mở.'}
                </Typography>
              </Box>
            )}

            {previewUrl && isPdf && renderPdfViewer()}
            {previewUrl && isImage && renderImageViewer()}
            {previewUrl && !isPdf && !isImage && (
              <Alert severity="warning">Định dạng file chưa hỗ trợ preview. Vui lòng dùng PDF hoặc ảnh.</Alert>
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

            {!previewOnly && (
              <Button
                variant="contained"
                disabled={isSigning || !signatureLink || positionsList.length === 0}
                onClick={handleConfirm}
                startIcon={
                  isSigning ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Iconify icon="solar:shield-check-bold" />
                  )
                }
              >
                {isSigning ? 'Đang ký số...' : 'Xác nhận ký số'}
              </Button>
            )}
            {previewOnly && <Box sx={{ width: 120 }} />}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
