import axiosInstance from '../utils/axios';
import { BaseSearchRequest, buildBaseBody } from './types';

export interface UserItem {
  id?: number;
  username: string;
  fullName: string;
  password?: string;
  email?: string;
  phone?: string;
  unitCode?: string;
  unitName?: string;
  roleCode?: string;
  roleName?: string;
  position?: string;
  avatar?: string;
  isActive?: number;
  status?: number;
  isDelete?: number;
  org?: string;
  cdate?: string;
  cuser?: string;
  ldate?: string;
  luser?: string;
}

export type UserSearchRequest = BaseSearchRequest;

export const usersApi = {
  /**
   * Lấy danh sách USERS theo tìm kiếm & phân trang từ Backend / Database
   */
  async getList(params: UserSearchRequest = {}) {
    const body = buildBaseBody(params);
    const response = await axiosInstance.post('/USERS/GetList', body);
    return response.data;
  },

  /**
   * Lấy chi tiết USERS theo ID
   */
  async getInfo(id: number) {
    const response = await axiosInstance.get(`/USERS/GetInfo/${id}`);
    return response.data;
  },

  /**
   * Tạo mới hoặc cập nhật USERS trong Database
   */
  async createOrUpdate(item: UserItem) {
    const payload = {
      ID: item.id || null,
      USERNAME: item.username,
      FULL_NAME: item.fullName,
      PASSWORD: item.password || '',
      EMAIL: item.email || '',
      PHONE: item.phone || '',
      UNIT_CODE: item.unitCode || '',
      UNIT_NAME: item.unitName || '',
      ROLE_CODE: item.roleCode || 'USER',
      ROLE_NAME: item.roleName || 'Người dùng',
      POSITION: item.position || '',
      AVATAR: item.avatar || '',
      IS_ACTIVE: item.isActive !== undefined ? item.isActive : 1,
      STATUS: item.status !== undefined ? item.status : 1,
      ORG: item.org || item.unitCode || item.unitName || '',
      REMOVED: item.isDelete || 0,
    };
    const response = await axiosInstance.post('/USERS/Create', payload);
    return response.data;
  },

  /**
   * Xóa mềm USERS theo ID
   */
  async delete(id: number) {
    const response = await axiosInstance.delete(`/USERS/Delete/${id}`);
    return response.data;
  },
};
