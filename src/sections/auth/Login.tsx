// @mui
import { Alert, Tooltip, Stack, Typography, Link, Box } from '@mui/material';
// hooks
import { useAuthContext } from '../../auth/useAuthContext';
// layouts
import LoginLayout from '../../layouts/login';
//
import AuthLoginForm from './AuthLoginForm';
import AuthWithSocial from './AuthWithSocial';

// ----------------------------------------------------------------------

export default function Login() {
  const { method } = useAuthContext();

  return (
    <LoginLayout>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Đăng nhập Hệ thống</Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            Cổng thông tin Trục liên thông văn bản
          </Typography>
        </Stack>

        <Tooltip title={method} placement="left">
          <Box
            component="img"
            alt={method}
            src={`/assets/icons/auth/ic_${method}.png`}
            sx={{ width: 32, height: 32, position: 'absolute', right: 0 }}
          />
        </Tooltip>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Stack spacing={0.5}>
          <div><strong>1. Quản trị:</strong> admin@local / admin123</div>
          <div><strong>2. Văn thư:</strong> vanthu@local / vanthu123</div>
          <div><strong>3. Lãnh đạo:</strong> lanhdao@local / lanhdao123</div>
        </Stack>
      </Alert>

      <AuthLoginForm />
    </LoginLayout>
  );
}
