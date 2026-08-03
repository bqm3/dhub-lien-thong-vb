import axiosInstance, { getApiMessage, isApiSuccess } from '../utils/axios';

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

export interface ApiResponse<T> {
  resultCode: number | string;
  ResultCode?: number | string;
  message: string;
  Message?: string;
  timestamp?: number;
  totalRecords?: number;
  data?: T;
}

/**
 * Trả về dải ngày mặc định: cdateStart = hiện tại - 1 năm, cdateEnd = ngày hiện tại (yyyy-MM-dd)
 */
export function getDefaultDateRange() {
  const now = new Date();
  const endYear = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const cdateStart = `${endYear - 1}-${month}-${day}`;
  const cdateEnd = `${endYear}-${month}-${day}`;
  return { cdateStart, cdateEnd };
}

/**
 * Service API cho Danh mục / Đơn vị / Phân quyền (DM_CATEGORYController)
 */
export const dmCategoryApi = {
  /**
   * Lấy danh sách DM_CATEGORY theo tìm kiếm & phân trang
   */
  async getList(params: DMCategorySearchRequest = {}): Promise<{ data: DMCategoryItem[]; totalRecords: number }> {
    try {
      const defaultDates = getDefaultDateRange();
      const startDate = params.cdateStart || defaultDates.cdateStart;
      const endDate = params.cdateEnd || defaultDates.cdateEnd;

      const response = await axiosInstance.post('/DM_CATEGORY/GetList', {
        PageIndex: params.pageIndex || 1,
        PageSize: params.pageSize || 100,
        SearchField: params.searchField || {},
        CDATE_START: startDate,
        CDATE_END: endDate,
      });

      const resData = response.data;
      if (isApiSuccess(resData)) {
        const rawList = resData.Data || resData.data || [];
        const mappedList: DMCategoryItem[] = rawList.map((item: any) => ({
          id: item.ID || item.id,
          code: item.CODE || item.code || '',
          name: item.NAME || item.name || '',
          parentCode: item.PARENT_CODE !== undefined && item.PARENT_CODE !== null ? String(item.PARENT_CODE) : '0',
          parentName: item.PARENT_NAME || item.parentName || '',
          description: item.DESCRIPTION || item.description || '',
          isActive: item.IS_ACTIVE !== undefined ? item.IS_ACTIVE : 1,
          status: item.STATUS !== undefined ? item.STATUS : 1,
          org: item.ORG || item.org || '',
          isDelete: item.IS_DELETE !== undefined ? item.IS_DELETE : 0,
          cdate: item.CDATE || item.cdate || '',
          cuser: item.CUSER || item.cuser || '',
        }));

        return {
          data: mappedList,
          totalRecords: resData.TotalRecords || resData.totalRecords || mappedList.length,
        };
      }
    } catch (error) {
      console.warn('Backend API /DM_CATEGORY/GetList error', error);
    }
    return { data: [], totalRecords: 0 };
  },

  /**
   * Lấy chi tiết thông tin DM_CATEGORY theo ID
   */
  async getInfo(id: number): Promise<DMCategoryItem | null> {
    try {
      const response = await axiosInstance.get(`/DM_CATEGORY/GetInfo/${id}`);
      const resData = response.data;
      if (isApiSuccess(resData) && resData.Data) {
        const item = resData.Data;
        return {
          id: item.ID,
          code: item.CODE,
          name: item.NAME,
          parentCode: item.PARENT_CODE ? String(item.PARENT_CODE) : '0',
          parentName: item.PARENT_NAME,
          description: item.DESCRIPTION,
          isActive: item.IS_ACTIVE,
          status: item.STATUS,
          org: item.ORG,
        };
      }
    } catch (error) {
      console.error(`Error fetching DM_CATEGORY getInfo for id ${id}:`, error);
    }
    return null;
  },

  /**
   * Tạo mới hoặc Cập nhật DM_CATEGORY
   */
  async createOrUpdate(item: DMCategoryItem): Promise<{ success: boolean; message: string }> {
    try {
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
      const resData = response.data;
      const success = isApiSuccess(resData);
      const message = getApiMessage(resData, success ? 'Lưu thành công' : 'Thao tác không thành công');
      return { success, message };
    } catch (error: any) {
      console.error('Error creating/updating DM_CATEGORY:', error);
      return { success: false, message: typeof error === 'string' ? error : 'Lỗi kết nối API /DM_CATEGORY/Create' };
    }
  },

  /**
   * Xóa DM_CATEGORY theo ID
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(`/DM_CATEGORY/Delete/${id}`);
      const resData = response.data;
      const success = isApiSuccess(resData);
      const message = getApiMessage(resData, success ? 'Xóa thành công' : 'Thao tác không thành công');
      return { success, message };
    } catch (error: any) {
      console.error(`Error deleting DM_CATEGORY with id ${id}:`, error);
      return { success: false, message: typeof error === 'string' ? error : 'Lỗi kết nối API /DM_CATEGORY/Delete' };
    }
  },
};
