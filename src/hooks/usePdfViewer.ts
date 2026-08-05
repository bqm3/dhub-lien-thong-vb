import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axiosInstance from '../utils/axios';

export interface IOpenedDoc {
  url: string;
  name: string;
}

export const usePdfViewer = (selectedContractDetail: any | null, customHeaders?: Record<string, string>) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfBaseRotation, setPdfBaseRotation] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState<boolean>(false);

  const [openedDocs, setOpenedDocs] = useState<IOpenedDoc[]>([]);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfName, setActivePdfName] = useState<string>('');
  const [securedPdfUrl, setSecuredPdfUrl] = useState<string | null>(null);

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const isManualPageChangeRef = useRef<boolean>(false);
  const manualScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousBlobUrlRef = useRef<string | null>(null);

  const scrollToPage = useCallback((pageNum: number) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el && pdfContainerRef.current) {
      const container = pdfContainerRef.current;
      const offsetTop = el.offsetTop - container.offsetTop;
      container.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    isManualPageChangeRef.current = true;
    setCurrentPage(page);
    scrollToPage(page);

    if (manualScrollTimerRef.current) {
      clearTimeout(manualScrollTimerRef.current);
    }
    manualScrollTimerRef.current = setTimeout(() => {
      isManualPageChangeRef.current = false;
    }, 800);
  }, [scrollToPage]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const onPageLoadSuccess = useCallback((page: any) => {
    const pdfRotation = page.rotate ?? 0;
    setPdfBaseRotation(pdfRotation);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setPdfError(error.message || 'Không thể tải file PDF');
  }, []);

  // IntersectionObserver to sync currentPage when scrolling
  useEffect(() => {
    if (!pdfContainerRef.current || numPages === 0) return;

    const container = pdfContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualPageChangeRef.current) return;
        let maxRatio = 0;
        let visiblePage = 0;
        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const pageNum = parseInt(entry.target.id.replace('pdf-page-', ''));
            if (!isNaN(pageNum)) visiblePage = pageNum;
          }
        });
        if (visiblePage > 0) setCurrentPage(visiblePage);
      },
      { root: container, threshold: [0.1, 0.3, 0.5, 0.7, 1.0] }
    );

    const timeoutId = setTimeout(() => {
      for (let i = 1; i <= numPages; i++) {
        const el = document.getElementById(`pdf-page-${i}`);
        if (el) observer.observe(el);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [numPages, activePdfUrl]);

  // Set default PDF when selectedContractDetail or files array loads
  useEffect(() => {
    let docsList: IOpenedDoc[] = [];
    if (Array.isArray(selectedContractDetail)) {
      docsList = selectedContractDetail
        .map((item: any) => ({
          url: item.url || item.link || '',
          name: item.name || item.ten_tailieu || 'Tài liệu',
        }))
        .filter((item) => Boolean(item.url));
    } else if (selectedContractDetail?.tailieu && Array.isArray(selectedContractDetail.tailieu)) {
      docsList = selectedContractDetail.tailieu
        .map((item: any) => ({
          url: item.url || item.duongdan_file || item.duongdan || '',
          name: item.ten_tailieu || item.name || 'Tài liệu',
        }))
        .filter((item: any) => Boolean(item.url));
    }

    if (docsList.length > 0) {
      setOpenedDocs(docsList);
      setActivePdfUrl(docsList[0].url);
      setActivePdfName(docsList[0].name);
      setSecuredPdfUrl(null);
      setNumPages(0);
      setPdfError(null);
    } else {
      setOpenedDocs([]);
      setActivePdfUrl(null);
      setActivePdfName('');
      setSecuredPdfUrl(null);
      setNumPages(0);
      setPdfError(null);
    }
  }, [selectedContractDetail]);

  const [retryTrigger, setRetryTrigger] = useState(0);

  const retryLoad = useCallback(() => {
    setPdfError(null);
    setSecuredPdfUrl(null);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  // Fetch file via axiosInstance blob so Authorization header and ORG context are sent properly
  useEffect(() => {
    if (!activePdfUrl) {
      setSecuredPdfUrl(null);
      setPdfError(null);
      return;
    }

    setPdfError(null);

    if (activePdfUrl.startsWith('blob:') || activePdfUrl.startsWith('data:')) {
      setSecuredPdfUrl(activePdfUrl);
      return;
    }

    let isCancelled = false;

    axiosInstance
      .get(activePdfUrl, { responseType: 'blob' })
      .then(async (res) => {
        if (isCancelled) return;
        const blob = res.data;

        if (!blob || blob.size === 0) {
          setPdfError('Tệp tin rỗng hoặc không tải được dữ liệu.');
          setSecuredPdfUrl(null);
          return;
        }

        // Nếu Backend trả về JSON lỗi (VD: {"ResultCode":"404","Message":"NOT_FOUND"}) đóng gói dạng Blob
        if (blob.type === 'application/json' || blob.type === 'text/json') {
          try {
            const text = await blob.text();
            const json = JSON.parse(text);
            if (json.ResultCode && json.ResultCode !== '200') {
              setPdfError(json.Message || json.message || 'Không tìm thấy tệp hoặc bị từ chối truy cập.');
              setSecuredPdfUrl(null);
              return;
            }
          } catch {
            // Không phải JSON, tiếp tục xử lý tệp
          }
        }

        // Kiểm tra magic header %PDF- đối với các tệp PDF
        const isPdfFile =
          !activePdfUrl ||
          activePdfUrl.split('?')[0].toLowerCase().endsWith('.pdf') ||
          Boolean(activePdfName && activePdfName.toLowerCase().endsWith('.pdf'));

        if (isPdfFile) {
          try {
            const headerBuffer = await blob.slice(0, 5).arrayBuffer();
            const headerText = new TextDecoder().decode(headerBuffer);
            if (!headerText.startsWith('%PDF')) {
              let errorMessage = 'Tệp tin không đúng cấu trúc PDF hợp lệ.';
              try {
                const text = await blob.text();
                if (text.trim().startsWith('{')) {
                  const json = JSON.parse(text);
                  errorMessage = json.Message || json.message || json.ResultDescription || errorMessage;
                } else if (text.includes('AccessDenied') || text.includes('NoSuchKey')) {
                  errorMessage = 'Không tìm thấy tệp hoặc bị từ chối truy cập từ máy chủ lưu trữ (MinIO/S3).';
                }
              } catch {
                // ignore
              }
              setPdfError(errorMessage);
              setSecuredPdfUrl(null);
              return;
            }
          } catch (e) {
            console.warn('Lỗi kiểm tra magic header PDF:', e);
          }
        }

        const objectUrl = URL.createObjectURL(blob);
        if (previousBlobUrlRef.current && previousBlobUrlRef.current !== objectUrl) {
          URL.revokeObjectURL(previousBlobUrlRef.current);
        }
        previousBlobUrlRef.current = objectUrl;

        setPdfError(null);
        setSecuredPdfUrl(objectUrl);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Lỗi khi tải file qua axiosInstance:', err);
        setPdfError('Không thể kết nối đến máy chủ lưu trữ file.');
        setSecuredPdfUrl(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [activePdfUrl, activePdfName, retryTrigger]);

  useEffect(() => {
    if (!securedPdfUrl) {
      setLoadTimeout(false);
      return;
    }
    setLoadTimeout(false);
    const t = setTimeout(() => {
      setLoadTimeout(true);
    }, 15000); // 15s timeout
    return () => clearTimeout(t);
  }, [securedPdfUrl]);

  const handleDownload = useCallback(() => {
    if (securedPdfUrl) {
      window.open(securedPdfUrl, '_blank');
    }
  }, [securedPdfUrl]);

  const fileExt = useMemo(() => {
    if (!activePdfUrl) return '';
    try {
      const cleanUrl = activePdfUrl.split('?')[0];
      const lastDotIdx = cleanUrl.lastIndexOf('.');
      const lastSlashIdx = cleanUrl.lastIndexOf('/');
      if (lastDotIdx > lastSlashIdx && lastDotIdx !== -1) {
        return cleanUrl.substring(lastDotIdx).toLowerCase();
      }
      if (activePdfName) {
        const nameDotIdx = activePdfName.lastIndexOf('.');
        if (nameDotIdx !== -1) {
          return activePdfName.substring(nameDotIdx).toLowerCase();
        }
      }
      return '';
    } catch {
      return '';
    }
  }, [activePdfUrl, activePdfName]);

  const isPdf = useMemo(() => !activePdfUrl || fileExt === '.pdf', [activePdfUrl, fileExt]);

  const isDocViewerSupported = useMemo(() => {
    const supportedExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.txt', '.csv', '.xlsx', '.xls', '.docx', '.doc'];
    return supportedExts.includes(fileExt);
  }, [fileExt]);

  const docs = useMemo(() => {
    if (!securedPdfUrl) return [];
    const type = fileExt ? fileExt.replace('.', '') : 'pdf';
    return [
      {
        uri: securedPdfUrl,
        fileName: activePdfName || 'document',
        fileType: type,
      },
    ];
  }, [securedPdfUrl, activePdfName, fileExt]);

  const headers = useMemo<Record<string, string> | undefined>(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const handleSelectPdf = useCallback((url: string, name: string) => {
    setOpenedDocs((prev) => {
      const exists = prev.some((doc) => doc.url === url);
      if (exists) return prev;
      return [...prev, { url, name }];
    });
    setActivePdfUrl(url);
    setActivePdfName(name);
    setCurrentPage(1);
    setNumPages(0);
    setPdfError(null);
  }, []);

  const handleCloseTab = useCallback((urlToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenedDocs((prev) => {
      const filtered = prev.filter((doc) => doc.url !== urlToRemove);
      if (activePdfUrl === urlToRemove) {
        if (filtered.length > 0) {
          const nextActive = filtered[filtered.length - 1];
          setActivePdfUrl(nextActive.url);
          setActivePdfName(nextActive.name);
        } else {
          setActivePdfUrl(null);
          setActivePdfName('');
        }
      }
      return filtered;
    });
  }, [activePdfUrl]);

  const resetAll = useCallback(() => {
    setOpenedDocs([]);
    setActivePdfUrl(null);
    setActivePdfName('');
    setNumPages(0);
    setCurrentPage(1);
    setScale(1.0);
    setRotation(0);
    setPdfBaseRotation(0);
    setPdfError(null);
  }, []);

  const rotateClockwise = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  return {
    numPages,
    currentPage,
    scale,
    rotation,
    pdfBaseRotation,
    pdfError,
    loadTimeout,
    openedDocs,
    activePdfUrl,
    activePdfName,
    pdfContainerRef,
    securedPdfUrl,
    fileExt,
    isPdf,
    isDocViewerSupported,
    docs,
    headers,
    handlePageChange,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    onDocumentLoadError,
    handleDownload,
    handleSelectPdf,
    handleCloseTab,
    resetAll,
    retryLoad,
    rotateClockwise,
    zoomIn,
    zoomOut,
  };
};
