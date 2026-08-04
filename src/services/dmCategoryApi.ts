import axiosInstance from '../utils/axios';
import { getDefaultDateRange } from './getDefaultDateRange';

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

export interface DMCategorySearchRequest {
  pageIndex?: number;
  pageSize?: number;
  searchField?: Record<string, any>;
  cdateStart?: string;
  cdateEnd?: string;
}

/**
 * Trả về dải ngày mặc định: cdateStart = hiện tại - 1 năm, cdateEnd = ngày hiện tại (yyyy-MM-dd)
 */


/**
 * Service API cho Danh mục / Đơn vị / Phân quyền (DM_CATEGORYController)
 */
export const dmCategoryApi = {
  /**
   * Lấy danh sách DM_CATEGORY theo tìm kiếm & phân trang
   */
  async getList(params: DMCategorySearchRequest = {}) {
    const defaultDates = getDefaultDateRange();
    const response = await axiosInstance.post('/DM_CATEGORY/GetList', {
      PageIndex: params.pageIndex || 1,
      PageSize: params.pageSize || 100,
      SearchField: params.searchField || {},
      CDATE_START: params.cdateStart || defaultDates.cdateStart,
      CDATE_END: params.cdateEnd || defaultDates.cdateEnd,
    });
    return response.data;
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
