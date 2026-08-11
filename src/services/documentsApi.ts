import axiosInstance from '../utils/axios';
import { BaseSearchRequest, buildBaseBody } from './types';

export type DocumentSearchRequest = BaseSearchRequest;
export type { BaseSearchRequest };

/**
 * Service API danh sách văn bản (DOCUMENTSController)
 */
export const documentsApi = {
  /**
   * Truy vấn danh sách văn bản (DOCUMENTSController)
   */
  async getList(params: DocumentSearchRequest = {}) {
    const body = buildBaseBody(params);
    const response = await axiosInstance.post('/DOCUMENTS/GetList', body);
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
  async getRoutes(params: {
    SearchField?: Record<string, any>;
    searchField?: Record<string, any>;
    PageIndex?: number;
    pageIndex?: number;
    PageSize?: number;
    pageSize?: number;
    cdateStart?: string;
    cdateEnd?: string;
    [key: string]: any;
  } = {}) {
    const body = buildBaseBody({
      pageIndex: params.PageIndex ?? params.pageIndex,
      pageSize: params.PageSize ?? params.pageSize,
      searchField: params.SearchField || params.searchField,
      cdateStart: params.cdateStart || (params as any).CDATE_START,
      cdateEnd: params.cdateEnd || (params as any).CDATE_END,
    });

    const response = await axiosInstance.post('/DOCUMENT_ROUTE/GetList', body);
    return response.data;
  },

  /**
   * Lấy chi tiết route giao dịch (DOCUMENT_ROUTEController/GetInfo/{id})
   */
  async getRouteInfo(id: number | string) {
    const response = await axiosInstance.get(`/DOCUMENT_ROUTE/GetInfo/${id}`);
    return response.data;
  },

  /**
   * Truy vấn lịch sử giao dịch thông điệp (MESSAGE_TRANSACTIONController)
   */
  async getTransactions(searchField: Record<string, any> = {}) {
    const response = await axiosInstance.post('/MESSAGE_TRANSACTION/GetListBy', searchField);
    return response.data;
  },

  /**
   * Gửi văn bản liên thông giữa các đơn vị (IN_DIP_HubController/Send)
   */
  async sendDocument(payload: {
    header: {
      documentId?: any;
      documentNo: any;
      documentType: string;
      subject: string;
      senderCode: string;
      receiverCode: string[];
      priority?: string;
      sendTime?: string;
      issueDate?: string;
    };
    body?: Array<{
      fileName: string;
      dataType?: string;
      contentType?: string;
      fileUrl?: string;
      base64Data?: string;
    }>;
  }) {
    const sendTimeVal = payload.header.sendTime || payload.header.issueDate || new Date().toISOString().split('T')[0];
    const apiPayload = {
      Header: {
        Document_Id: payload.header.documentId ? String(payload.header.documentId) : '',
        Document_No: payload.header.documentNo,
        Document_Type: payload.header.documentType,
        Subject: payload.header.subject,
        Sender_Code: payload.header.senderCode,
        Receiver_Code: payload.header.receiverCode,
        Priority: payload.header.priority || 'NORMAL',
        Send_Time: sendTimeVal,
        Issue_Date: sendTimeVal,
      },
      Body: (payload.body || []).map((file) => ({
        File_Name: file.fileName,
        Data_Type: file.dataType || 'PDF',
        Content_Type: file.contentType || 'application/pdf',
        File_URL: file.fileUrl || '',
        Base64_Data: file.base64Data || '',
      })),
    };

    const response = await axiosInstance.post('/IN_DIP_Hub/Send', apiPayload);
    return response.data;
  },

  /**
   * Phản hồi trạng thái ACK/NACK (IN_DIP_HubController/Ack)
   */
  async ackDocument(payload: { documentId: string; receiverCode: string; status: string }) {
    const apiPayload = {
      Document_Id: payload.documentId,
      Receiver_Code: payload.receiverCode,
      Status: payload.status,
    };
    const response = await axiosInstance.post('/IN_DIP_Hub/Ack', apiPayload);
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
  async getListByDocument(documentId: string) {
    const response = await axiosInstance.post('/DOCUMENT_ATTACHMENT/GetListBy', {
      DOCUMENT_ID: documentId,
    });
    return response.data;
  },

  async getAuditsByDocument(documentId: string) {
    const response = await axiosInstance.post('/DOCUMENT_AUDIT/GetListBy', {
      DOCUMENT_ID: documentId,
    });
    return response.data;
  },

  async getTrackingsByDocument(documentId: string) {
    const response = await axiosInstance.post('/DOCUMENT_TRACKING/GetListBy', {
      DOCUMENT_ID: documentId,
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
