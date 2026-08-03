import axiosInstance from '../utils/axios';
import { getDefaultDateRange } from './dmCategoryApi';

export interface DocumentRecord {
  id?: number;
  code?: string;
  messageId: string;
  documentNo: string;
  documentType: string;
  subject: string;
  senderCode: string;
  senderName: string;
  status: string;
  org?: string;
  cdate?: string;
}

export interface DocumentSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  searchField?: Record<string, any>;
  cdateStart?: string;
  cdateEnd?: string;
}

export interface DocumentRouteRecord {
  id?: number;
  code?: string;
  documentId: string;
  messageId: string;
  documentNo: string;
  documentType: string;
  subject: string;
  senderCode: string;
  receiverCode: string;
  status?: string;
}

export interface MessageTransactionRecord {
  id?: number;
  messageId: string;
  documentId: string;
  documentNo: string;
  documentType: string;
  topicName: string;
  sourceSystem: string;
  targetSystem: string;
  status: string;
  creator?: string;
  cdate?: string;
}

/**
 * Service API danh sách văn bản, luồng định tuyến và lịch sử giao dịch (DIP_INTERNAL Controllers)
 */
export const documentsApi = {
  /**
   * Truy vấn danh sách văn bản (DOCUMENTSController)
   */
  async getList(params: DocumentSearchRequest = {}): Promise<{ data: DocumentRecord[]; totalRecords: number }> {
    try {
      const defaultDates = getDefaultDateRange();
      const startDate = params.cdateStart || defaultDates.cdateStart;
      const endDate = params.cdateEnd || defaultDates.cdateEnd;

      const response = await axiosInstance.post('/DOCUMENTS/GetList', {
        PageIndex: params.pageIndex || 1,
        PageSize: params.pageSize || 100,
        SearchField: params.searchField || {},
        CDATE_START: startDate,
        CDATE_END: endDate,
      });

      const resData = response.data;
      if (resData && (resData.ResultCode === 1 || resData.resultCode === 1 || Array.isArray(resData.Data || resData.data))) {
        const rawList = resData.Data || resData.data || [];
        const mappedList: DocumentRecord[] = rawList.map((item: any) => ({
          id: item.ID || item.id,
          code: item.CODE || item.code,
          messageId: item.MESSAGE_ID || item.messageId || '',
          documentNo: item.DOCUMENT_NO || item.documentNo || '',
          documentType: item.DOCUMENT_TYPE || item.documentType || '',
          subject: item.SUBJECT || item.subject || '',
          senderCode: item.SENDER_CODE || item.senderCode || '',
          senderName: item.SENDER_NAME || item.senderName || '',
          status: item.STATUS || item.status || 'Active',
          org: item.ORG || item.org || '',
          cdate: item.CDATE || item.cdate || '',
        }));

        return {
          data: mappedList,
          totalRecords: resData.TotalRecords || resData.totalRecords || mappedList.length,
        };
      }
    } catch (error) {
      console.warn('Backend API /DOCUMENTS/GetList unavailable.', error);
    }
    return { data: [], totalRecords: 0 };
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
  }): Promise<boolean> {
    try {
      const payload = {
        ID: item.id || null,
        CODE: item.code || item.documentNo,
        MESSAGE_ID: item.messageId || `MSG-${Date.now()}`,
        DOCUMENT_NO: item.documentNo,
        DOCUMENT_TYPE: item.documentType,
        SUBJECT: item.subject,
        SENDER_CODE: item.senderCode,
        SENDER_NAME: item.senderName,
        STATUS: item.status || 'Active',
      };
      const response = await axiosInstance.post('/DOCUMENTS/Create', payload);
      const resData = response.data;
      return resData && (resData.ResultCode === 1 || resData.resultCode === 1);
    } catch (error) {
      console.error('Error creating document:', error);
      return false;
    }
  },

  /**
   * Truy vấn danh sách định tuyến văn bản (DOCUMENT_ROUTEController)
   */
  async getRoutes(searchField: Record<string, any> = {}): Promise<DocumentRouteRecord[]> {
    try {
      const response = await axiosInstance.post('/DOCUMENT_ROUTE/GetListBy', searchField);
      const resData = response.data;
      if (resData && (resData.Data || resData.data)) {
        const rawList = resData.Data || resData.data || [];
        return rawList.map((item: any) => ({
          id: item.ID || item.id,
          code: item.CODE || item.code,
          documentId: item.DOCUMENT_ID || item.documentId || '',
          messageId: item.MESSAGE_ID || item.messageId || '',
          documentNo: item.DOCUMENT_NO || item.documentNo || '',
          documentType: item.DOCUMENT_TYPE || item.documentType || '',
          subject: item.SUBJECT || item.subject || '',
          senderCode: item.SENDER_CODE || item.senderCode || '',
          receiverCode: item.RECEIVER_CODE || item.receiverCode || '',
          status: item.STATUS || item.status || '',
        }));
      }
    } catch (error) {
      console.warn('Backend API /DOCUMENT_ROUTE/GetListBy unavailable.', error);
    }
    return [];
  },

  /**
   * Truy vấn lịch sử giao dịch thông điệp (MESSAGE_TRANSACTIONController)
   */
  async getTransactions(searchField: Record<string, any> = {}): Promise<MessageTransactionRecord[]> {
    try {
      const response = await axiosInstance.post('/MESSAGE_TRANSACTION/GetListBy', searchField);
      const resData = response.data;
      if (resData && (resData.Data || resData.data)) {
        const rawList = resData.Data || resData.data || [];
        return rawList.map((item: any) => ({
          id: item.ID || item.id,
          messageId: item.MESSAGE_ID || item.messageId || '',
          documentId: item.DOCUMENT_ID || item.documentId || '',
          documentNo: item.DOCUMENT_NO || item.documentNo || '',
          documentType: item.DOCUMENT_TYPE || item.documentType || '',
          topicName: item.TOPIC_NAME || item.topicName || '',
          sourceSystem: item.SOURCE_SYSTEM || item.sourceSystem || '',
          targetSystem: item.TARGET_SYSTEM || item.targetSystem || '',
          status: item.STATUS || item.status || '',
          creator: item.CREATOR || item.creator || '',
          cdate: item.CDATE || item.cdate || '',
        }));
      }
    } catch (error) {
      console.warn('Backend API /MESSAGE_TRANSACTION/GetListBy unavailable.', error);
    }
    return [];
  },
};
