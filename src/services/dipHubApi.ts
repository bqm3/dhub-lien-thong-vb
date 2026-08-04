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
  issue_Date: string;
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
  status: string;
}

/**
 * Service API gửi, tiếp nhận, xác nhận message liên thông (DIP_HubController)
 */
export const dipHubApi = {
  /**
   * Gửi văn bản liên thông (Send Service)
   */
  async sendDocument(request: DocSendRequest) {
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
    return response.data;
  },

  /**
   * Tiếp nhận văn bản liên thông (Receive Service)
   */
  async receiveDocument(request: DocReceiveRequest) {
    const response = await axiosInstance.post('/DIP_Hub/Receive', {
      Document_Id: request.document_Id,
      Sender_Code: request.sender_Code,
      Receiver_Code: request.receiver_Code,
    });
    return response.data;
  },

  /**
   * Phản hồi / Xác nhận giao dịch (ACK Service)
   */
  async ackDocument(request: DocACKRequest) {
    const response = await axiosInstance.post('/DIP_Hub/Ack', {
      Document_Id: request.document_Id,
      Receiver_Code: request.receiver_Code,
      Status: request.status,
    });
    return response.data;
  },
};
