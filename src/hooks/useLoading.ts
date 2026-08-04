import { useLoadingScreen } from '../components/loading-screen';

/**
 * Custom hook quản lý trạng thái hiển thị màn hình LoadingScreen toàn trang.
 * Trả về: { isLoading, showLoading, hideLoading, setLoading }
 */
export function useLoading() {
  return useLoadingScreen();
}

export default useLoading;
