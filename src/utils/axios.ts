import axios from 'axios';
// config
import { HOST_API_KEY } from '../config';

// ----------------------------------------------------------------------

const DEFAULT_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlIjoiTklGUzA4Iiwic2lkIjoiTklGUzA4IiwiZXhwIjo0OTM5MTU5NTg0LCJuYW1lIjoiVOG7lSBjaOG7qWMgTklGUzA4IiwibG9jYWxlIjoiVU5MSU1JVEVEIiwiZW1haWxfdmVyaWZpZWQiOiJOSUZTMDhAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyIjoiMDk3MTEyMzQ1MiIsImFkZHJlc3MiOiJOSUZTMDgiLCJ0eXAiOiJETiIsInByZWZlcnJlZF91c2VybmFtZSI6Ik5JRlMwOC5OSUZTMDgiLCJpc3MiOiJqTURSdGhpYVl2RUVvcFRValVsQ25ac09pYkkyWVhvYyIsImF1ZCI6ImpNRFJ0aGlhWXZFRW9wVFZqVWxDblpzT2liSTJZWG9jIn0.sfNmtJOI-InoZ6JzWQcr5Qh6EkmZKONaIbm67anBmxY';

const axiosInstance = axios.create({
  baseURL: HOST_API_KEY,
  headers: {
    Authorization: DEFAULT_TOKEN,
  },
});

axiosInstance.defaults.headers.common.Authorization = DEFAULT_TOKEN;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

/**
 * Kiểm tra xem kết quả API Backend trả về có thành công hay không.
 * Backend .NET luôn trả về Status Code 200, thành công khi ResultCode === 1 hoặc "1".
 * Các giá trị ResultCode khác (e.g. 404, "404", 0, 2) là LỖI / CẢNH BÁO.
 */
export function isApiSuccess(resData: any): boolean {
  if (!resData) return false;
  const code = resData.ResultCode !== undefined ? resData.ResultCode : resData.resultCode;
  return code === 1 || code === '1';
}

/**
 * Lấy thông điệp phản hồi từ Backend (Message / message).
 */
export function getApiMessage(resData: any, fallback = 'Thao tác không thành công'): string {
  if (!resData) return fallback;
  return resData.Message || resData.message || fallback;
}

export default axiosInstance;
