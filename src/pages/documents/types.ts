import { DocumentRecord } from '../../sections/interoperability/mockData';

export type ManagedDocumentRecord = DocumentRecord & {
  attachments: string[];
  signProvider: string;
  signStatus: string;
  signedPositions: number;
};

export const emptyDocumentForm: ManagedDocumentRecord = {
  code: '',
  title: '',
  type: 'CONG_VAN',
  sender: '',
  receiver: '',
  version: 'v1',
  classification: 'Thường',
  status: 'Đang xử lý',
  createdAt: '02/07/2026 09:00',
  attachments: [],
  signProvider: 'USB Token / HSM',
  signStatus: 'Chưa ký',
  signedPositions: 0,
};

export const DOC_TYPES = ['', 'CONG_VAN', 'QUYET_DINH', 'BAO_CAO', 'THONG_BAO', 'KE_HOACH', 'BIEN_NHAN'];

export const CLASSIFICATIONS = ['Thường', 'Nội bộ', 'Mật', 'Tối mật'];

export const DOCUMENT_STATUSES = ['Đang xử lý', 'Chờ ký số', 'Đã phát hành', 'Đã nhận', 'Đang lưu trữ'];
