import axios from 'axios';
import { enqueueSnackbar } from '../components/snackbar';
// config
import { HOST_API_KEY } from '../config';

// ----------------------------------------------------------------------

export const DEFAULT_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJFMjIyLWdIa0VHLTMwc2FrQ2FIM01WZjZqd3hwMG5XVlpwSDZtVS1KYU93In0.eyJleHAiOjE3ODU4MzU5NzAsImlhdCI6MTc4NTgzMjM3MCwiYXV0aF90aW1lIjoxNzg1ODI5NTg5LCJqdGkiOiJlNWE1OTM4My03M2IyLWYxMWQtMmM3NC01ODk0NGE3M2VjYTMiLCJpc3MiOiJodHRwczovL2Rldi1pZC5jZHNkc2VydmljZS5jb20vcmVhbG1zL0lOVEVSTkFMIiwiYXVkIjoib3Blbi1tZXRhZGF0YS1uZXciLCJzdWIiOiJkYzVjYmRhZS1iNGNkLTQzY2UtOTlhMy0zMDI3YTMwNjNhNWIiLCJ0eXAiOiJJRCIsImF6cCI6Im9wZW4tbWV0YWRhdGEtbmV3Iiwibm9uY2UiOiI4MWMwOTY2ZTg2NGI0NjNjODA4MDg2Yjk3YzNhMzM5OSIsInNpZCI6IjUyZTgxMDAwLWViYzYtNDcxMS04NGZkLTZjOGFmMzQ3Njg2NiIsImFjciI6IjAiLCJzX2hhc2giOiJjSW55WkNfYkZWYTY0Q1FWOTJjdEh3IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzeXN0ZW0uYWRtaW4iLCJlbWFpbCI6InN5c3RlbS5hZG1pbkBlbWFpbC5jb20iLCJtYXBwZXJfcm9sZXMiOlsidmlld2VyIiwiZGV2Iiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1pbnRlcm5hbCJdfQ.FgNeiJMK11Pb3I5fbYOTGwJQUFQrTFGLI80qTMVcCW_cpASS4bM3NgfWUi_QGwc4b9mvy4OhxaKGBUoHqXQ1N2MEjta5mTtkT8HSkdMMpDQH34HrTOGy09y7nsyo-05C6cz4goQd-bBtzEijX9i-GypYp4OzHDvQ-DiNvlmR_zzLOoQSXarbXCuMqWCSxVq6m-1hbdG9hMC9fsPygN5rmLfxr-hq2h7hgJec7gziFmO-wcSwP7h94xU9h-lrdqt89oxV8Qnra6h3OkGTkxX8eTP9ckX_mqm-n2m2nsGEOFoLjFPdezg6GkxB-fmVQ_jkkpoqE0Zs3fh_JmfKGdKWEg';

const axiosInstance = axios.create({
  baseURL: HOST_API_KEY,
  headers: {
    Authorization: DEFAULT_TOKEN,
  },
});

axiosInstance.defaults.headers.common.Authorization = DEFAULT_TOKEN;

/**
 * Kiểm tra xem kết quả API Backend trả về có thành công hay không.
 * Thành công khi ResultCode === 1, "1", 200, "200" hoặc success === true.
 */
export function isApiSuccess(resData: any): boolean {
  if (!resData) return false;
  const code = resData.ResultCode !== undefined ? resData.ResultCode : resData.resultCode;
  return code === 1 || code === '1' || code === 200 || code === '200' || resData.success === true;
}

/**
 * Lấy thông điệp phản hồi từ Backend (Message / message).
 */
export function getApiMessage(resData: any, fallback = 'Thao tác không thành công'): string {
  if (!resData) return fallback;
  return resData.Message || resData.message || fallback;
}

// Interceptor xử lý phản hồi API và hiển thị Toast thông báo tự động
axiosInstance.interceptors.response.use(
  (response) => {
    const data = response?.data;
    const method = response?.config?.method?.toLowerCase();
    const url = (response?.config?.url || '').toLowerCase();

    if (data && typeof data === 'object') {
      const code = data.ResultCode !== undefined ? data.ResultCode : data.resultCode;
      const success = isApiSuccess(data);

      // Tự động bắt lỗi nghiệp vụ khi ResultCode báo lỗi
      if (code !== undefined && !success) {
        const msg = getApiMessage(data, 'Thao tác không thành công');
        enqueueSnackbar(msg, { variant: 'error' });
      }
      // Tự động bật thông báo THÀNH CÔNG cho các thao tác thêm/sửa/xóa (POST, PUT, DELETE, PATCH ngoại trừ API GetList/GetInfo)
      else if (method && method !== 'get' && success) {
        const isQueryEndpoint = url.includes('/getlist') || url.includes('/getinfo') || url.includes('/getlistby') || url.includes('/search');
        if (!isQueryEndpoint) {
          const msg = getApiMessage(data, 'Thao tác thành công!');
          enqueueSnackbar(msg, { variant: 'success' });
        }
      }
    }
    return response;
  },
  (error) => {
    // Tự động bắt lỗi kết nối / HTTP Error (400, 401, 403, 500...)
    const message =
      (error.response && error.response.data && (error.response.data.Message || error.response.data.message)) ||
      error.message ||
      'Không thể kết nối máy chủ';

    enqueueSnackbar(message, { variant: 'error' });
    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
);

export default axiosInstance;
