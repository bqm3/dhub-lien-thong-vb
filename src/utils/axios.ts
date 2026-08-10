import axios from 'axios';
import { enqueueSnackbar } from '../components/snackbar';
// config
import { HOST_API_KEY } from '../config';
import { refreshKeycloakToken } from '../auth/keycloak';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: HOST_API_KEY,
});

// Cờ và hàng đợi phục vụ xử lý đồng thời nhiều API cùng gặp 401 khi đang refresh token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Tự động đính kèm token Keycloak từ localStorage vào Header Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Kiểm tra xem kết quả API Backend trả về có thành công hay không.
 * Thành công khi ResultCode === 1, "1", 200, "200" hoặc success === true.
 */
export function isApiSuccess(resData: any): boolean {
  if (!resData) return false;
  const code = resData.ResultCode !== undefined ? resData.ResultCode : resData.resultCode;
  return code === 0 || code === '0' || code === 1 || code === '1' || code === 200 || code === '200' || resData.success === true;
}

/**
 * Lấy thông điệp phản hồi từ Backend (Message / message).
 */
export function getApiMessage(resData: any, fallback = 'Thao tác không thành công'): string {
  if (!resData) return fallback;
  return resData.Message || resData.message || fallback;
}

// Interceptor xử lý phản hồi API, tự động Refresh Token Keycloak khi gặp 401 và hiển thị Toast thông báo
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
  async (error) => {
    const originalRequest = error.config;

    // Tự động Refresh Token Keycloak khi nhận HTTP Status 401 (Unauthorized)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      const realm = (typeof window !== 'undefined' && localStorage.getItem('authRealm')) || 'INTERNAL';

      if (refreshToken && realm !== 'LOCAL') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await refreshKeycloakToken(refreshToken, realm);
          const newAccessToken = res?.access_token;
          const newRefreshToken = res?.refresh_token;

          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('idToken');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

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
