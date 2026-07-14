import { ReactNode } from 'react';
// @mui
import { Container, Typography } from '@mui/material';
// assets
import { ForbiddenIllustration } from '../assets/illustrations';
// auth
import { useAuthContext } from './useAuthContext';
import { hasPermissions, PermissionCheckMode, PermissionCode, PATH_PERMISSIONS } from './permissions';

type PermissionGuardProps = {
  children: ReactNode;
  required?: PermissionCode[];
  mode?: PermissionCheckMode;
  hasContent?: boolean;
};

export default function PermissionGuard({
  children,
  required,
  mode = 'any',
  hasContent = true,
}: PermissionGuardProps) {
  const { user } = useAuthContext();

  const ok = hasPermissions({
    userPermissions: user?.permissions,
    required,
    mode,
  });

  if (!ok) {
    if (!hasContent) return null;

    return (
      <Container sx={{ textAlign: 'center', py: { xs: 6, sm: 10 } }}>
        <Typography variant="h3" paragraph>
          Permission Denied
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          You do not have permission to access this page
        </Typography>
        <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
      </Container>
    );
  }

  return <>{children}</>;
}

type GuardedPageProps = {
  path: string;
  element: ReactNode;
};

export function GuardedPage({ path, element }: GuardedPageProps) {
  const required = PATH_PERMISSIONS[path];
  if (!required) {
    return <>{element}</>;
  }
  return <PermissionGuard required={required}>{element}</PermissionGuard>;
}

