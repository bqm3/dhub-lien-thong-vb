import axiosInstance from '../utils/axios';
import { BaseSearchRequest, buildBaseBody } from './types';

export interface DMCategoryItem {
  id?: number;
  code: string;
  name: string;
  parentCode?: string;
  parentName?: string;
  description?: string;
  isActive?: number;
  status?: number;
  org?: string;
  isDelete?: number;
  cdate?: string;
  cuser?: string;
  ldate?: string;
  luser?: string;
}

export type DMCategorySearchRequest = BaseSearchRequest;

/**
 * Service API cho Danh mục / Đơn vị / Phân quyền (DM_CATEGORYController)
 */
export const dmCategoryApi = {
  /**
   * Lấy danh sách DM_CATEGORY theo tìm kiếm & phân trang
   */
  async getList(params: DMCategorySearchRequest = {}) {
    const body = buildBaseBody(params);
    const response = await axiosInstance.post('/DM_CATEGORY/GetList', body);
    return response.data;
  },

  /**
   * Lấy danh sách Đơn vị (POST /DM_CATEGORY/GetListUnits)
   */
  async getUnitList(params: DMCategorySearchRequest = {}) {
    const body = buildBaseBody(params);
    const response = await axiosInstance.post('/DM_CATEGORY/GetListUnits', body);
    const resData = response.data;
    if (resData) {
      const rawList = resData.Data || resData.data || (Array.isArray(resData) ? resData : null);
      if (Array.isArray(rawList)) {
        const normalized = rawList.map((item: any) => ({
          ...item,
          id: item.ID ?? item.id,
          code: item.CODE ?? item.code ?? '',
          name: item.NAME ?? item.name ?? '',
          parentCode: item.PARENT_CODE ?? item.parentCode ?? '',
          parentName: item.PARENT_NAME ?? item.parentName ?? '',
          description: item.DESCRIPTION ?? item.description ?? '',
          isActive: item.IS_ACTIVE !== undefined ? Number(item.IS_ACTIVE) : (item.isActive !== undefined ? Number(item.isActive) : 1),
          status: item.STATUS !== undefined ? Number(item.STATUS) : (item.status !== undefined ? Number(item.status) : 1),
          org: item.ORG ?? item.org ?? '',
          cdate: item.CDATE ?? item.cdate ?? '',
        }));
        if (resData.Data) resData.Data = normalized;
        if (resData.data) resData.data = normalized;
      }
    }
    return resData;
  },

  /**
   * Lấy chi tiết thông tin DM_CATEGORY theo ID
   */
  async getInfo(id: number) {
    const response = await axiosInstance.get(`/DM_CATEGORY/GetInfo/${id}`);
    return response.data;
  },

  /**
   * Tạo mới hoặc Cập nhật DM_CATEGORY
   */
  async createOrUpdate(item: DMCategoryItem) {
    const payload = {
      ID: item.id || null,
      CODE: item.code,
      NAME: item.name,
      PARENT_CODE: item.parentCode || '0',
      PARENT_NAME: item.parentName || '',
      DESCRIPTION: item.description || '',
      IS_ACTIVE: item.isActive !== undefined ? item.isActive : 1,
      STATUS: item.status !== undefined ? item.status : 1,
      ORG: item.org || 'SYSTEM',
      REMOVED: item.isDelete || 0,
    };
    const response = await axiosInstance.post('/DM_CATEGORY/Create', payload);
    return response.data;
  },

  /**
   * Xóa DM_CATEGORY theo ID
   */
  async delete(id: number) {
    const response = await axiosInstance.delete(`/DM_CATEGORY/Delete/${id}`);
    return response.data;
  },
};
