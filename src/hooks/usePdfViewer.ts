import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from 'react';

export type IOpenedDoc = {
  url: string;
  name: string;
};

export type PdfViewerFileItem = {
  name: string;
  url: string;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

const DOC_VIEWER_EXTS = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.txt', '.html', '.htm'];
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];

function getFileExt(fileName: string) {
  const idx = fileName.lastIndexOf('.');
  if (idx < 0) return '';
  return fileName.slice(idx).toLowerCase();
}

function toAbsoluteUrl(url: string) {
  if (!url) return url;
  if (
    url.indexOf('http://') === 0 ||
    url.indexOf('https://') === 0 ||
    url.indexOf('blob:') === 0 ||
    url.indexOf('data:') === 0
  ) {
    return url;
  }
  if (typeof window === 'undefined') return url;
  return new URL(url, window.location.origin).href;
}

export function usePdfViewer(files: PdfViewerFileItem[] = [], headers?: Record<string, string>) {
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

  const [openedDocs, setOpenedDocs] = useState<IOpenedDoc[]>([]);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfName, setActivePdfName] = useState('');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdfBaseRotation] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);

  const filesRef = useRef(files);
  filesRef.current = files;
  const filesKey = useMemo(() => files.map((item) => `${item.url}::${item.name}`).join('|'), [files]);

  const fileExt = getFileExt(activePdfName);
  const isPdf = fileExt === '.pdf';
  const isDocViewerSupported = DOC_VIEWER_EXTS.indexOf(fileExt) !== -1;
  const securedPdfUrl = activePdfUrl ? toAbsoluteUrl(activePdfUrl) : null;

  const docs = useMemo(() => {
    if (!securedPdfUrl) return [];
    return [
      {
        uri: securedPdfUrl,
        fileType: fileExt.replace('.', '') || undefined,
        fileName: activePdfName || undefined,
      },
    ];
  }, [securedPdfUrl, fileExt, activePdfName]);

  useEffect(() => {
    const currentFiles = filesRef.current;
    if (currentFiles.length === 0) {
      setOpenedDocs([]);
      setActivePdfUrl(null);
      setActivePdfName('');
      return;
    }

    const first = currentFiles[0];
    setOpenedDocs(currentFiles.map((item) => ({ url: item.url, name: item.name })));
    setActivePdfUrl(first.url);
    setActivePdfName(first.name);
    setScale(1);
    setRotation(0);
    setNumPages(0);
    setCurrentPage(1);
    setPdfError(null);
    setLoadTimeout(false);
  }, [filesKey]);

  useEffect(() => {
    if (!activePdfUrl || !isPdf) {
      setLoadTimeout(false);
      return undefined;
    }

    setLoadTimeout(false);
    const timer = window.setTimeout(() => setLoadTimeout(true), 8000);
    return () => window.clearTimeout(timer);
  }, [activePdfUrl, isPdf]);

  const handleSelectPdf = useCallback((url: string, name: string) => {
    setOpenedDocs((prev) => {
      if (prev.some((item) => item.url === url)) return prev;
      return [...prev, { url, name }];
    });
    setActivePdfUrl(url);
    setActivePdfName(name);
    setScale(1);
    setRotation(0);
    setNumPages(0);
    setCurrentPage(1);
    setPdfError(null);
  }, []);

  const handleCloseTab = useCallback(
    (url: string, e: MouseEvent) => {
      e.stopPropagation();
      setOpenedDocs((prev) => {
        const next = prev.filter((item) => item.url !== url);
        if (activePdfUrl === url) {
          const fallback = next[next.length - 1] ?? null;
          setActivePdfUrl(fallback?.url ?? null);
          setActivePdfName(fallback?.name ?? '');
          setNumPages(0);
          setCurrentPage(1);
          setPdfError(null);
        }
        return next;
      });
    },
    [activePdfUrl]
  );

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  }, []);

  const rotateClockwise = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleDownload = useCallback(() => {
    if (!securedPdfUrl) return;
    const link = document.createElement('a');
    link.href = securedPdfUrl;
    link.download = activePdfName || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [securedPdfUrl, activePdfName]);

  const handlePageChange = useCallback((_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    const pageEl = document.getElementById(`pdf-page-${page}`);
    pageEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setCurrentPage(1);
    setPdfError(null);
    setLoadTimeout(false);
  }, []);

  const onPageLoadSuccess = useCallback((_page: unknown) => {
    // reserved for page dimension sync if needed
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setPdfError(error.message || 'Không thể tải file PDF');
  }, []);

  return {
    openedDocs,
    activePdfUrl,
    activePdfName,
    securedPdfUrl,
    fileExt,
    isPdf,
    isDocViewerSupported,
    isImage: IMAGE_EXTS.indexOf(fileExt) !== -1,
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
    openFile: handleSelectPdf,
  };
}
