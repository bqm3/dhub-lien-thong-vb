import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Stack, Alert, Button } from '@mui/material';
import { useAuthContext } from '../../auth/useAuthContext';
import { PATH_AFTER_LOGIN } from '../../config';
import { PATH_AUTH } from '../../routes/paths';

export default function KeycloakCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithKeycloakCode } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const realm = searchParams.get('realm') || 'INTERNAL';

    if (!code) {
      setError('Không tìm thấy mã xác thực (authorization code) từ Keycloak.');
      return;
    }

    if (loginWithKeycloakCode) {
      loginWithKeycloakCode(code, realm)
        .then(() => {
          navigate(PATH_AFTER_LOGIN, { replace: true });
        })
        .catch((err: any) => {
          console.error('Keycloak code exchange error:', err);
          setError(err?.message || 'Xác thực với Keycloak SSO thất bại.');
        });
    }
  }, [searchParams, loginWithKeycloakCode, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 420, textAlign: 'center' }}>
        {error ? (
          <>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={() => navigate(PATH_AUTH.login, { replace: true })}>
              Quay lại màn hình đăng nhập
            </Button>
          </>
        ) : (
          <>
            <CircularProgress size={48} color="primary" />
            <Typography variant="h6">Đang xử lý đăng nhập với Keycloak SSO...</Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng chờ trong giây lát. Hệ thống đang xác thực tài khoản của bạn.
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}
