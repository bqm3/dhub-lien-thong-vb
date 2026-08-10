import { useEffect } from 'react';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import { getKeycloakSSOUrl } from '../../auth/keycloak';

export default function InternalLoginRedirectPage() {
  useEffect(() => {
    localStorage.setItem('authRealm', 'INTERNAL');
    const ssoUrl = getKeycloakSSOUrl('INTERNAL');
    window.location.href = ssoUrl;
  }, []);

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
        <CircularProgress size={48} color="primary" />
        <Typography variant="h6">Đang chuyển hướng sang Keycloak Nội bộ...</Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng chờ trong giây lát. Hệ thống đang chuyển hướng tới trang đăng nhập Keycloak (Realm INTERNAL).
        </Typography>
      </Stack>
    </Box>
  );
}
