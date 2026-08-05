import axiosInstance from '../utils/axios';

export function isAttachmentLink(value?: string) {
  if (!value) return false;
  const trimmed = value.trim().toLowerCase();
  return trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0;
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getS3AttachmentUrl(objectKeyOrName?: string, bucketName?: string) {
  if (!objectKeyOrName) return undefined;
  if (isAttachmentLink(objectKeyOrName)) return objectKeyOrName.trim();
  const baseUrl = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');
  let url = `${baseUrl}/STORAGS3/Download?objectName=${encodeURIComponent(objectKeyOrName)}`;
  if (bucketName) {
    url += `&bucketName=${encodeURIComponent(bucketName)}`;
  }
  return url;
}

export function getDemoAttachmentUrl(code: string, fileName?: string) {
  return getS3AttachmentUrl(fileName || code);
}

export const storageS3Api = {
  /**
   * Lấy URL để xem hoặc tải xuống file từ MinIO / S3
   */
  getDownloadUrl(objectName?: string, bucketName?: string) {
    return getS3AttachmentUrl(objectName, bucketName);
  },

  /**
   * Tải file từ MinIO qua Stream
   */
  async download(objectName: string, bucketName?: string) {
    const res = await axiosInstance.get('/STORAGS3/Download', {
      params: { objectName, bucketName },
      responseType: 'blob',
    });
    return res.data;
  },

  /**
   * Tải file qua Axios có đính kèm Token Authorization và trả về URL dạng blob:
   */
  async getBlobUrl(objectName: string, bucketName?: string) {
    if (isAttachmentLink(objectName)) return objectName.trim();
    const blob = await this.download(objectName, bucketName);
    return URL.createObjectURL(blob);
  },

  /**
   * Lấy file từ MinIO dưới dạng chuỗi Base64
   */
  async getFileAsBase64(objectName: string, bucketName?: string) {
    const res = await axiosInstance.get('/STORAGS3/GetFile', {
      params: { objectName, bucketName },
    });
    return res.data;
  },

  /**
   * Tạo Bucket mới trên MinIO
   */
  async createBucket(bucketName: string) {
    const res = await axiosInstance.post(`/STORAGS3/CreateBucket?bucketName=${encodeURIComponent(bucketName)}`);
    return res.data;
  },

  /**
   * Lấy danh sách Buckets trên MinIO
   */
  async listBuckets() {
    const res = await axiosInstance.get('/STORAGS3/GetListBucket');
    return res.data;
  },
};

export default storageS3Api;
