import { useState } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment, Button, ToggleButtonGroup, ToggleButton, Divider, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
import { KEYCLOAK_CONFIG, KeycloakRealm } from '../../auth/keycloak';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  afterSubmit?: string;
};

export default function AuthLoginForm({ defaultRealm = 'INTERNAL' }: { defaultRealm?: KeycloakRealm }) {
  const { login, loginWithKeycloakSSO } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);
  const [realm, setRealm] = useState<KeycloakRealm>(defaultRealm);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Tài khoản / Email không được để trống'),
    password: Yup.string().required('Mật khẩu không được để trống'),
  });

  const defaultValues = {
    email: 'admin@local',
    password: 'admin123',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await login(data.email, data.password, realm);
    } catch (error: any) {
      console.error(error);

      reset();

      setError('afterSubmit', {
        ...error,
        message: error?.message || 'Đăng nhập thất bại',
      });
    }
  };

  const handleSSOLogin = () => {
    if (loginWithKeycloakSSO) {
      loginWithKeycloakSSO(realm);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Chọn miền xác thực (Keycloak Realm):
          </Typography>
          <ToggleButtonGroup
            value={realm}
            exclusive
            onChange={(_, val) => val && setRealm(val)}
            fullWidth
            size="small"
            color="primary"
          >
            <ToggleButton value="INTERNAL" sx={{ py: 0.75, fontWeight: 600 }}>
              <Iconify icon="solar:shield-user-bold" width={18} sx={{ mr: 1 }} />
              Nội bộ ({KEYCLOAK_CONFIG.realmInternal})
            </ToggleButton>
            <ToggleButton value="EXTERNAL" sx={{ py: 0.75, fontWeight: 600 }}>
              <Iconify icon="solar:global-bold" width={18} sx={{ mr: 1 }} />
              Bên ngoài ({KEYCLOAK_CONFIG.realmExternal})
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <RHFTextField name="email" label="Tài khoản / Email Keycloak" />

        <RHFTextField
          name="password"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack alignItems="flex-end" sx={{ my: 1.5 }}>
        <Link variant="body2" color="inherit" underline="always" sx={{ cursor: 'pointer' }}>
          Quên mật khẩu?
        </Link>
      </Stack>

      <Stack spacing={1.5}>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitSuccessful || isSubmitting}
          startIcon={<Iconify icon="solar:key-minimalistic-bold" />}
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
        </LoadingButton>

        <Divider sx={{ my: 0.5, typography: 'caption', color: 'text.disabled' }}>HOẶC SSO REDIRECT</Divider>

        <Button
          fullWidth
          size="large"
          variant="outlined"
          color="info"
          startIcon={<Iconify icon="solar:user-rounded-bold-duotone" />}
          onClick={handleSSOLogin}
          sx={{
            height: 44,
            borderRadius: '30px',
            fontWeight: 600,
          }}
        >
          Đăng nhập qua Keycloak SSO Page
        </Button>
      </Stack>
    </FormProvider>
  );
}
