/**
 * Các Hằng số Trạng thái Văn bản & Giao dịch Liên thông
 */

export const DOCUMENT_STATUS_ACCEPT = 'ACCEPT';
export const DOCUMENT_STATUS_ACCEPT_NOTE = 'Tiếp nhận văn bản';
export const DOCUMENT_STATUS_CREATED = 'CREATED';
export const DOCUMENT_STATUS_CREATED_NOTE = 'Tạo văn bản';
export const DOCUMENT_STATUS_DRAFT = 'DRAFT';
export const DOCUMENT_STATUS_DRAFT_NOTE = 'Đang chỉnh sửa';
export const DOCUMENT_STATUS_SIGNED = 'SIGNED';
export const DOCUMENT_STATUS_SIGNED_NOTE = 'Ký văn bản';
export const DOCUMENT_STATUS_VALIDATED = 'VALIDATED';
export const DOCUMENT_STATUS_VALIDATED_NOTE = 'Kiểm tra văn bản';
export const DOCUMENT_STATUS_SENT = 'SENT';
export const DOCUMENT_STATUS_SENT_NOTE = 'Gửi văn bản';
export const DOCUMENT_STATUS_ROUTED = 'ROUTED';
export const DOCUMENT_STATUS_ROUTED_NOTE = 'Điều phối văn bản';
export const DOCUMENT_STATUS_RECEIVED = 'RECEIVED';
export const DOCUMENT_STATUS_RECEIVED_NOTE = 'Nhận văn bản';
export const DOCUMENT_STATUS_PROCESSING = 'PROCESSING';
export const DOCUMENT_STATUS_PROCESSING_NOTE = 'Văn bản đang xử lý';
export const DOCUMENT_STATUS_ACK_RECEIVED = 'ACK_RECEIVED';
export const DOCUMENT_STATUS_ACK_RECEIVED_NOTE = 'Xác nhận ACK';
export const DOCUMENT_STATUS_COMPLETED = 'COMPLETED';
export const DOCUMENT_STATUS_COMPLETED_NOTE = 'Hoàn thành';
export const DOCUMENT_STATUS_FAILED = 'FAILED';
export const DOCUMENT_STATUS_FAILED_NOTE = 'Lỗi';
export const DOCUMENT_STATUS_CANCELLED = 'CANCELLED';
export const DOCUMENT_STATUS_CANCELLED_NOTE = 'Thu hồi';

/**
 * Bản đồ tra cứu nhãn Tiếng Việt tương ứng theo mã trạng thái
 */
export const DOCUMENT_STATUS_MAP: Record<string, { label: string; note: string; color: string }> = {
  [DOCUMENT_STATUS_ACCEPT]: { label: 'ACCEPT', note: DOCUMENT_STATUS_ACCEPT_NOTE, color: 'success' },
  [DOCUMENT_STATUS_CREATED]: { label: 'CREATED', note: DOCUMENT_STATUS_CREATED_NOTE, color: 'info' },
  [DOCUMENT_STATUS_DRAFT]: { label: 'DRAFT', note: DOCUMENT_STATUS_DRAFT_NOTE, color: 'default' },
  [DOCUMENT_STATUS_SIGNED]: { label: 'SIGNED', note: DOCUMENT_STATUS_SIGNED_NOTE, color: 'primary' },
  [DOCUMENT_STATUS_VALIDATED]: { label: 'VALIDATED', note: DOCUMENT_STATUS_VALIDATED_NOTE, color: 'info' },
  [DOCUMENT_STATUS_SENT]: { label: 'SENT', note: DOCUMENT_STATUS_SENT_NOTE, color: 'primary' },
  [DOCUMENT_STATUS_ROUTED]: { label: 'ROUTED', note: DOCUMENT_STATUS_ROUTED_NOTE, color: 'info' },
  [DOCUMENT_STATUS_RECEIVED]: { label: 'RECEIVED', note: DOCUMENT_STATUS_RECEIVED_NOTE, color: 'success' },
  [DOCUMENT_STATUS_PROCESSING]: { label: 'PROCESSING', note: DOCUMENT_STATUS_PROCESSING_NOTE, color: 'warning' },
  [DOCUMENT_STATUS_ACK_RECEIVED]: { label: 'ACK_RECEIVED', note: DOCUMENT_STATUS_ACK_RECEIVED_NOTE, color: 'success' },
  [DOCUMENT_STATUS_COMPLETED]: { label: 'COMPLETED', note: DOCUMENT_STATUS_COMPLETED_NOTE, color: 'success' },
  [DOCUMENT_STATUS_FAILED]: { label: 'FAILED', note: DOCUMENT_STATUS_FAILED_NOTE, color: 'error' },
  [DOCUMENT_STATUS_CANCELLED]: { label: 'CANCELLED', note: DOCUMENT_STATUS_CANCELLED_NOTE, color: 'error' },
};

/**
 * Hàm lấy tên mô tả Tiếng Việt của trạng thái văn bản
 */
export function getDocumentStatusNote(status?: string): string {
  if (!status) return '—';
  const upperStatus = status.toUpperCase();
  return DOCUMENT_STATUS_MAP[upperStatus]?.note || status;
}

export const ACK_SUCCESS_STATUSES = [
  DOCUMENT_STATUS_ACK_RECEIVED,
  DOCUMENT_STATUS_RECEIVED,
  DOCUMENT_STATUS_ACCEPT,
  DOCUMENT_STATUS_COMPLETED,
  'ACK',
  'SUCCESS',
];

export const FAILED_STATUSES = [
  DOCUMENT_STATUS_FAILED,
  DOCUMENT_STATUS_CANCELLED,
  'ERROR',
  'NACK',
];