import { ManagedDocumentRecord } from './types';

function pad2(value: number) {
  return value < 10 ? `0${value}` : String(value);
}

export function formatDocumentDate(input: Date | number | string) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);

  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())} ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function parseDocumentDate(value: string) {
  const trimmed = value.trim();
  const isoTime = Date.parse(trimmed);
  if (!Number.isNaN(isoTime)) return isoTime;

  const match = trimmed.match(
    /^(?:(\d{1,2}):(\d{2})(?::(\d{2}))?[,\s]+)?(\d{1,2})\/(\d{1,2})\/(\d{4})$|^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (!match) return 0;

  if (match[1] || match[4]) {
    const [, hh = '0', min = '0', ss = '0', dd = '1', mm = '1', yyyy = '1970'] = match;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss)).getTime();
  }

  const [, , , , , , dd = '1', mm = '1', yyyy = '1970', hh = '0', min = '0', ss = '0'] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss)).getTime();
}

export function normalizeManagedDocument(input: Partial<ManagedDocumentRecord>): ManagedDocumentRecord | null {
  if (!input.code || !input.title || !input.sender || !input.receiver) return null;

  const normalizedCreatedAt = input.createdAt
    ? formatDocumentDate(parseDocumentDate(String(input.createdAt)))
    : formatDocumentDate(new Date());

  return {
    code: String(input.code),
    title: String(input.title),
    type: String(input.type ?? 'CONG_VAN'),
    sender: String(input.sender),
    receiver: String(input.receiver),
    version: String(input.version ?? 'v1'),
    classification: String(input.classification ?? 'Thường'),
    status: String(input.status ?? 'Đang xử lý'),
    createdAt: normalizedCreatedAt,
    attachments: Array.isArray(input.attachments) ? input.attachments.map((x) => String(x)) : [],
    signProvider: String(input.signProvider ?? 'USB Token / HSM'),
    signStatus: String(input.signStatus ?? 'Chưa ký'),
    signedPositions: Number.isFinite(input.signedPositions) ? Number(input.signedPositions) : 0,
  };
}

export function isAttachmentLink(value?: string) {
  if (!value) return false;
  const trimmed = value.trim().toLowerCase();
  return trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0;
}

export function getAttachmentDisplayName(value: string) {
  if (!isAttachmentLink(value)) return value;
  try {
    const parsed = new URL(value);
    const last = parsed.pathname.split('/').filter(Boolean).pop();
    return decodeURIComponent(last || parsed.hostname);
  } catch {
    return value;
  }
}

/** Link http(s) dùng trực tiếp; còn lại lấy từ API demo storage */
export function getDemoAttachmentUrl(code: string, fileName?: string) {
  if (!fileName) return undefined;
  if (isAttachmentLink(fileName)) return fileName.trim();
  return `/api/demo-documents/file?code=${encodeURIComponent(code)}&fileName=${encodeURIComponent(fileName)}`;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    let chunkBinary = '';
    for (let j = 0; j < slice.length; j += 1) {
      chunkBinary += String.fromCharCode(slice[j]);
    }
    binary += chunkBinary;
  }
  return btoa(binary);
}

export async function fileToBase64(file: File) {
  const buf = await file.arrayBuffer();
  return arrayBufferToBase64(buf);
}

export async function saveDocumentToDemoStorage(
  document: ManagedDocumentRecord,
  attachmentsPayload: { fileName: string; contentType: string; base64: string }[] = []
) {
  const resp = await fetch('/api/demo-documents/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document,
      attachments: attachmentsPayload,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `HTTP ${resp.status}`);
  }

  return resp.json();
}

export function fakeVersions(doc: ManagedDocumentRecord) {
  const n = parseInt(doc.version.replace('v', ''), 10);
  return Array.from({ length: n }, (_, i) => ({
    version: `v${i + 1}`,
    changedBy: i === 0 ? doc.sender : 'Hệ thống',
    changedAt: doc.createdAt,
    note: i === 0 ? 'Tạo mới' : `Cập nhật lần ${i}`,
  }));
}

export function fakeAudit(doc: ManagedDocumentRecord) {
  return [
    { action: 'Tạo mới', actor: doc.sender, time: doc.createdAt, detail: `Khởi tạo văn bản ${doc.code}` },
    { action: 'Tải tệp', actor: doc.sender, time: doc.createdAt, detail: `${doc.attachments.length} tệp đính kèm đã được thêm vào hồ sơ` },
    {
      action: 'Ký số',
      actor: doc.sender,
      time: doc.createdAt,
      detail: `${doc.signStatus} qua ${doc.signProvider}`,
    },
    { action: 'Phát hành', actor: doc.sender, time: doc.createdAt, detail: `Chuyển trạng thái sang ${doc.status}` },
    { action: 'Gửi liên thông', actor: 'Hệ thống', time: doc.createdAt, detail: `Điểm đến ${doc.receiver}` },
  ];
}
