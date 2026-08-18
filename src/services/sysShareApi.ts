import axiosInstance from '../utils/axios';
import { BaseSearchRequest, buildBaseBody } from './types';

export interface SysShareCorpTokenItem {
  id?: number;
  code?: string;
  corpCode: string;
  corpName?: string;
  serviceCode?: string;
  serviceName?: string;
  token?: string;
  expired?: string;
  isActive?: number;
  status?: number;
  isDelete?: number;
  org?: string;
  cdate?: string;
  ldate?: string;
  cuser?: string;
  luser?: string;
  description?: string;
}

export interface SysShareServiceItem {
  id?: number;
  code?: string;
  name?: string;
  parentCode?: string;
  parentName?: string;
  description?: string;
  isActive?: number;
  status?: number;
  isDelete?: number;
  org?: string;
  cdate?: string;
  ldate?: string;
  cuser?: string;
  luser?: string;
  // Giao diện hỗ trợ
  serviceCode?: string;
  serviceName?: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Service API cho Quản lý Token đơn vị (SYS_SHARE_CORP_TOKENController)
 */
export const sysShareCorpTokenApi = {
  /**
   * Lấy danh sách Token với bộ lọc & phân trang
   */
  async getList(params: BaseSearchRequest = {}) {
    const body = buildBaseBody(params);
    const response = await axiosInstance.post('/SYS_SHARE_CORP_TOKEN/GetList', body);
    return response.data;
  },

  /**
   * Lấy danh sách Token theo CORP_CODE (Mã đơn vị)
   */
  async getByCorpCode(corpCode: string, params: BaseSearchRequest = {}) {
    const body = buildBaseBody({
      ...params,
      searchField: {
        CORP_CODE: corpCode,
        ...(params.searchField || {}),
      },
    });
    const response = await axiosInstance.post('/SYS_SHARE_CORP_TOKEN/GetList', body);
    return response.data;
  },

  /**
   * Cấp mới hoặc cập nhật Token đơn vị (POST /SYS_SHARE_CORP_TOKEN/Create)
   */
  async createOrUpdate(item: SysShareCorpTokenItem) {
    const payload = {
      ID: item.id || null,
      CORP_CODE: item.corpCode,
      CORP_NAME: item.corpName || '',
      SERVICE_CODE: item.serviceCode || 'UNLIMITED',
      SERVICE_NAME: item.serviceName || 'Gói vô thời hạn',
      IS_ACTIVE: item.isActive !== undefined ? item.isActive : 1,
      STATUS: item.status !== undefined ? item.status : 1,
      DESCRIPTION: item.description || '',
    };
    const response = await axiosInstance.post('/SYS_SHARE_CORP_TOKEN/Create', payload);
    return response.data;
  },

  /**
   * Thu hồi Token (POST /SYS_SHARE_CORP_TOKEN/Revoke hoặc status=0)
   */
  async revoke(id: number) {
    try {
      const response = await axiosInstance.post('/SYS_SHARE_CORP_TOKEN/Delete', { ID: id, id });
      return response.data;
    } catch {
      const response = await axiosInstance.post(`/SYS_SHARE_CORP_TOKEN/Delete/${id}`);
      return response.data;
    }
  },
};

/**
 * Service API cho Quản lý Danh mục Dịch vụ liên thông (SYS_SHARE_SERVICESController)
 */
export const sysShareServicesApi = {
  /**
   * Lấy danh sách Dịch vụ chia sẻ
   */
  async getList(params: BaseSearchRequest = {}) {
    const body = buildBaseBody({
      cdateStart: params.cdateStart || '2025-01-01 00:00:00',
      cdateEnd: params.cdateEnd || '2026-08-31 23:59:59',
      ...params,
      searchField: {
        PARENT_CODE: 'SERVICE',
        ...(params.searchField || {}),
      },
    });
    const response = await axiosInstance.post('/SYS_SHARE_SERVICES/GetList', body);
    return response.data;
  },

  /**
   * Tạo mới hoặc cập nhật Dịch vụ chia sẻ
   */
  async createOrUpdate(item: SysShareServiceItem) {
    const payload = {
      ID: item.id || null,
      SERVICE_CODE: item.serviceCode,
      SERVICE_NAME: item.serviceName,
      ENDPOINT: item.endpoint,
      METHOD: item.method || 'POST',
      DESCRIPTION: item.description || '',
      STATUS: item.status !== undefined ? item.status : 1,
    };
    const response = await axiosInstance.post('/SYS_SHARE_SERVICES/Create', payload);
    return response.data;
  },
};
