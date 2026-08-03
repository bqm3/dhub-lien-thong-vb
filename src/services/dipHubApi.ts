import axiosInstance from '../utils/axios';

export interface DocAttachmentItem {
  file_Name: string;
  data_Type: string;
  content_Type: string;
  file_URL?: string;
  base64_Data?: string;
}

export interface DocSendHeader {
  document_No: string;
  document_Type: string;
  subject: string;
  sender_Code: string;
  receiver_Code: string[];
  priority: string;
  issue_Date: string; // "yyyy-MM-dd" or "yyyy-MM-dd HH:mm:ss"
}

export interface DocSendRequest {
  header: DocSendHeader;
  body: DocAttachmentItem[];
}

export interface DocReceiveRequest {
  document_Id: string;
  sender_Code: string;
  receiver_Code: string;
}

export interface DocACKRequest {
  document_Id: string;
  receiver_Code: string;
  status: string; // "ACK" | "NACK" | "WAITING"
}

export interface DipHubResponse {
  resultCode: number | string;
  ResultCode?: number | string;
  message: string;
  Message?: string;
  timestamp?: number;
  data?: any;
}

/**
 * Service API gửi, tiếp nhận, xác nhận message liên thông (DIP_HubController)
 */
export const dipHubApi = {
  /**
   * Gửi văn bản liên thông (Send Service)
   */
  async sendDocument(request: DocSendRequest): Promise<DipHubResponse> {
    try {
      const response = await axiosInstance.post('/DIP_Hub/Send', {
        Header: {
          Document_No: request.header.document_No,
          Document_Type: request.header.document_Type,
          Subject: request.header.subject,
          Sender_Code: request.header.sender_Code,
          Receiver_Code: request.header.receiver_Code,
          Priority: request.header.priority,
          Issue_Date: request.header.issue_Date,
        },
        Body: request.body.map((b) => ({
          File_Name: b.file_Name,
          Data_Type: b.data_Type,
          Content_Type: b.content_Type,
          File_URL: b.file_URL,
          Base64_Data: b.base64_Data,
        })),
      });
      const resData = response.data || {};
      return {
        resultCode: resData.ResultCode !== undefined ? resData.ResultCode : resData.resultCode ?? 0,
        ResultCode: resData.ResultCode,
        message: resData.Message || resData.message || '',
        Message: resData.Message,
        timestamp: resData.Timestamp || resData.timestamp,
        data: resData.Data || resData.data,
      };
    } catch (error: any) {
      console.warn('Backend /DIP_Hub/Send API unavailable.', error);
      return {
        resultCode: 0,
        message: typeof error === 'string' ? error : 'Gửi văn bản thất bại hoặc mất kết nối máy chủ',
      };
    }
  },

  /**
   * Tiếp nhận văn bản liên thông (Receive Service)
   */
  async receiveDocument(request: DocReceiveRequest): Promise<DipHubResponse> {
    try {
      const response = await axiosInstance.post('/DIP_Hub/Receive', {
        Document_Id: request.document_Id,
        Sender_Code: request.sender_Code,
        Receiver_Code: request.receiver_Code,
      });
      const resData = response.data || {};
      return {
        resultCode: resData.ResultCode !== undefined ? resData.ResultCode : resData.resultCode ?? 0,
        ResultCode: resData.ResultCode,
        message: resData.Message || resData.message || '',
        Message: resData.Message,
        timestamp: resData.Timestamp || resData.timestamp,
        data: resData.Data || resData.data,
      };
    } catch (error: any) {
      console.warn('Backend /DIP_Hub/Receive API unavailable.', error);
      return {
        resultCode: 0,
        message: typeof error === 'string' ? error : 'Tiếp nhận văn bản thất bại',
      };
    }
  },

  /**
   * Phản hồi / Xác nhận giao dịch (ACK Service)
   */
  async ackDocument(request: DocACKRequest): Promise<DipHubResponse> {
    try {
      const response = await axiosInstance.post('/DIP_Hub/Ack', {
        Document_Id: request.document_Id,
        Receiver_Code: request.receiver_Code,
        Status: request.status,
      });
      const resData = response.data || {};
      return {
        resultCode: resData.ResultCode !== undefined ? resData.ResultCode : resData.resultCode ?? 0,
        ResultCode: resData.ResultCode,
        message: resData.Message || resData.message || '',
        Message: resData.Message,
        timestamp: resData.Timestamp || resData.timestamp,
        data: resData.Data || resData.data,
      };
    } catch (error: any) {
      console.warn('Backend /DIP_Hub/Ack API unavailable.', error);
      return {
        resultCode: 0,
        message: typeof error === 'string' ? error : 'Xác nhận ACK thất bại',
      };
    }
  },
};
