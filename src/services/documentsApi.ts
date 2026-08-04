import axiosInstance from '../utils/axios';
import { getDefaultDateRange } from './getDefaultDateRange';

export interface DocumentSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  searchField?: Record<string, any>;
  cdateStart?: string;
  cdateEnd?: string;
}

/**
 * Service API danh sách văn bản (DOCUMENTSController)
 */
export const documentsApi = {
  /**
   * Truy vấn danh sách văn bản (DOCUMENTSController)
   */
  async getList(params: DocumentSearchRequest = {}) {
    const defaultDates = getDefaultDateRange();
    const response = await axiosInstance.post('/DOCUMENTS/GetList', {
      PageIndex: params.pageIndex || 1,
      PageSize: params.pageSize || 100,
      SearchField: params.searchField || {},
      CDATE_START: params.cdateStart || defaultDates.cdateStart,
      CDATE_END: params.cdateEnd || defaultDates.cdateEnd,
    });
    return response.data;
  },

  /**
   * Tạo mới hoặc Cập nhật Văn bản (DOCUMENTSController)
   */
  async createOrUpdate(item: {
    id?: number;
    code?: string;
    messageId?: string;
    documentNo: string;
    documentType: string;
    subject: string;
    senderCode: string;
    senderName: string;
    status: string;
  }) {
    const payload = {
      ID: item.id || null,
      CODE: item.code || item.documentNo,
      MESSAGE_ID: item.messageId || `MSG-${Date.now()}`,
      DOCUMENT_NO: item.documentNo,
      DOCUMENT_TYPE: item.documentType,
      SUBJECT: item.subject,
      SENDER_CODE: item.senderCode,
      SENDER_NAME: item.senderName,
      STATUS: item.status || '1',
    };
    const response = await axiosInstance.post('/DOCUMENTS/Create', payload);
    return response.data;
  },

  /**
   * Tạo bundle: tạo Document + upload file lên MinIO + lưu DOCUMENT_ATTACHMENT trong 1 request.
   * Gửi multipart/form-data.
   */
  async createBundle(item: {
    documentId?: number;
    messageId?: string;
    documentNo: string;
    documentType: string;
    subject: string;
    senderCode: string;
    senderName: string;
    status?: string;
    files?: File[];
  }) {
    const formData = new FormData();
    if (item.documentId) formData.append('DOCUMENT_ID', String(item.documentId));
    formData.append('MESSAGE_ID', item.messageId || `MSG-${Date.now()}`);
    formData.append('DOCUMENT_NO', item.documentNo);
    formData.append('DOCUMENT_TYPE', item.documentType);
    formData.append('SUBJECT', item.subject);
    formData.append('SENDER_CODE', item.senderCode);
    formData.append('SENDER_NAME', item.senderName);
    formData.append('STATUS', item.status || '1');
    if (item.files && item.files.length > 0) {
      item.files.forEach((file) => formData.append('Files', file));
    }
    const response = await axiosInstance.post('/DOCUMENTS/CreateBundle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Xóa văn bản (DOCUMENTSController)
   */
  async delete(id: number) {
    const response = await axiosInstance.delete(`/DOCUMENTS/Delete/${id}`);
    return response.data;
  },

  /**
   * Lấy chi tiết văn bản kèm danh sách tệp đính kèm (DOCUMENTSController)
   */
  async getInfo(id: number) {
    const response = await axiosInstance.get(`/DOCUMENTS/GetInfo/${id}`);
    return response.data;
  },

  /**
   * Truy vấn danh sách định tuyến văn bản (DOCUMENT_ROUTEController)
   */
  async getRoutes(searchField: Record<string, any> = {}) {
    const response = await axiosInstance.post('/DOCUMENT_ROUTE/GetListBy', searchField);
    return response.data;
  },

  /**
   * Truy vấn lịch sử giao dịch thông điệp (MESSAGE_TRANSACTIONController)
   */
  async getTransactions(searchField: Record<string, any> = {}) {
    const response = await axiosInstance.post('/MESSAGE_TRANSACTION/GetListBy', searchField);
    return response.data;
  },
};

/**
 * Service API quản lý tệp đính kèm văn bản (DOCUMENT_ATTACHMENTController)
 */
export const documentAttachmentsApi = {
  /**
   * Lấy danh sách tệp đính kèm theo DOCUMENT_ID
   */
  async getListByDocument(code: string) {
    const response = await axiosInstance.post('/DOCUMENT_ATTACHMENT/GetListBy', {
      CODE: code,
    });
    return response.data;
  },

  /**
   * Lưu thông tin tệp đính kèm văn bản
   */
  async create(item: {
    documentId: string;
    messageId?: string;
    originalFileName: string;
    contentType?: string;
    objectKey: string;
    fileSize?: number;
    fileHash?: string;
  }) {
    const response = await axiosInstance.post('/DOCUMENT_ATTACHMENT/Create', {
      DOCUMENT_ID: item.documentId,
      MESSAGE_ID: item.messageId || `MSG-${Date.now()}`,
      ORIGINAL_FILE_NAME: item.originalFileName,
      CONTENT_TYPE: item.contentType || 'application/pdf',
      OBJECT_KEY: item.objectKey,
      FILE_SIZE: item.fileSize || 1024,
      FILE_HASH: item.fileHash || 'TEMP_HASH',
      STATUS: '1',
    });
    return response.data;
  },
};

/**
 * Service API Cổng giao tiếp gửi/nhận liên thông (DIP_HubController)
 */
export const dipHubApi = {
  /**
   * Gửi văn bản liên thông trực tiếp (Upload MinIO S3 + Kafka Event Stream)
   */
  async send(params: {
    header: {
      documentNo: string;
      documentType: string;
      subject: string;
      senderCode: string;
      receiverCode: string[];
      priority?: string;
      issueDate?: string;
    };
    body: {
      fileName: string;
      dataType?: string;
      contentType?: string;
      base64Data?: string;
      fileUrl?: string;
    }[];
  }) {
    const response = await axiosInstance.post('/DIP_Hub/Send', {
      Header: {
        Document_No: params.header.documentNo,
        Document_Type: params.header.documentType,
        Subject: params.header.subject,
        Sender_Code: params.header.senderCode,
        Receiver_Code: params.header.receiverCode,
        Priority: params.header.priority || '1',
        Issue_Date: params.header.issueDate || new Date().toISOString().slice(0, 10),
      },
      Body: params.body.map((b) => ({
        File_Name: b.fileName,
        Data_Type: b.dataType || 'pdf',
        Content_Type: b.contentType || 'application/pdf',
        Base64_Data: b.base64Data || '',
        File_URL: b.fileUrl || '',
      })),
    });
    return response.data;
  },
};
