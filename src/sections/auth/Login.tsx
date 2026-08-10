import { Stack, Button } from '@mui/material';
import { useAuthContext } from '../../auth/useAuthContext';
import LoginLayout from '../../layouts/login';

// ----------------------------------------------------------------------

export default function Login() {
  const { loginWithKeycloakSSO } = useAuthContext();

  return (
    <LoginLayout>
      <Stack spacing={3} alignItems="center" sx={{ width: '100%', py: 2 }}>
        <Button
          fullWidth
          onClick={() => loginWithKeycloakSSO?.('EXTERNAL')}
          sx={{
            height: 50,
            borderRadius: '30px',
            bgcolor: '#2AA7DF',
            color: 'common.white',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            '&:hover': {
              bgcolor: '#1f93c5',
            },
          }}
        >
          Đăng nhập
        </Button>
      </Stack>
    </LoginLayout>
  );
}
