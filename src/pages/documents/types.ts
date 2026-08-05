export type ManagedDocumentRecord = {
  numericId?: number;
  id?: number;
  code: string;           // CODE
  messageId?: string;      // MESSAGE_ID
  documentNo: string;      // DOCUMENT_NO
  documentType: string;    // DOCUMENT_TYPE
  subject: string;         // SUBJECT
  senderCode: string;      // SENDER_CODE
  senderName: string;      // SENDER_NAME
  status: string;          // STATUS
  createdAt: string;       // CDATE
  attachments?: any[];
};

export const emptyDocumentForm: ManagedDocumentRecord = {
  code: '',
  documentNo: '',
  documentType: '',
  subject: '',
  senderCode: '',
  senderName: '',
  status: '1',
  createdAt: '',
};
