import axiosInstance from '../utils/axios';
import { BaseSearchRequest, buildBaseBody } from './types';

export interface CertificateItem {
  id?: number;
  unitCode: string;
  unitName?: string;
  serialNumber: string;
  issuer?: string;
  subjectName?: string;
  validFrom?: string;
  validTo?: string;
  status?: number;
  certType?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  certData?: string;
  isDelete?: number;
  org?: string;
  cdate?: string;
  cuser?: string;
  ldate?: string;
  luser?: string;
}

export type CertificateSearchRequest = BaseSearchRequest;

export const certificateApi = {
  /**
   * Tải file chứng thư số (.crt/.cer/.pem/.pfx) lên Backend để tự động giải mã thông tin
   */
  async parseFile(file: File, password?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (password !== undefined) {
      formData.append('password', password);
    }
    const response = await axiosInstance.post('/CERTIFICATE/Parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách CERTIFICATE theo tìm kiếm & phân trang
   */
  async getList(params: CertificateSearchRequest = {}) {
    const body = buildBaseBody(params);
    const response = await axiosInstance.post('/CERTIFICATE/GetList', body);
    return response.data;
  },

  /**
   * Lấy chi tiết CERTIFICATE theo ID
   */
  async getInfo(id: number) {
    const response = await axiosInstance.get(`/CERTIFICATE/GetInfo/${id}`);
    return response.data;
  },

  /**
   * Tạo mới hoặc cập nhật CERTIFICATE
   */
  async createOrUpdate(item: CertificateItem) {
    // Parse validFrom/validTo từ định dạng "dd/MM/yyyy HH:mm:ss" (trả về bởi Parse API)
    const parseDate = (dateStr?: string | null): string | null => {
      if (!dateStr) return null;
      // Thử parse dd/MM/yyyy HH:mm:ss
      const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}):(\d{2}))?$/);
      if (match) {
        const [, d, m, y, hh = '00', mm = '00', ss = '00'] = match;
        return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`).toISOString();
      }
      // Nếu đã là ISO string hoặc định dạng khác thì truyền thẳng
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString();
    };

    const payload = {
      ID: item.id || null,
      UNIT_CODE: item.unitCode,
      UNIT_NAME: item.unitName || '',
      SERIAL_NUMBER: item.serialNumber,
      ISSUER: item.issuer || '',
      SUBJECT_NAME: item.subjectName || '',
      VALID_FROM: parseDate(item.validFrom),
      VALID_TO: parseDate(item.validTo),
      STATUS: item.status !== undefined ? item.status : 1,
      CERT_TYPE: item.certType || 'SIGNING',
      FILE_PATH: item.filePath || '',
      FILE_NAME: item.fileName || '',
      FILE_SIZE: item.fileSize || 0,
      CERT_DATA: item.certData || '',
      ORG: item.org || 'SYSTEM',
      REMOVED: item.isDelete || 0,
    };
    const response = await axiosInstance.post('/CERTIFICATE/Create', payload);
    return response.data;
  },

  /**
   * Xóa CERTIFICATE theo ID
   */
  async delete(id: number) {
    const response = await axiosInstance.delete(`/CERTIFICATE/Delete/${id}`);
    return response.data;
  },
};
