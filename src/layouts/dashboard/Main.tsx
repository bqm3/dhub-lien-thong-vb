// @mui
import { Box, BoxProps } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// config
import { HEADER, NAV } from '../../config';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, ...other }: BoxProps) {
  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const isDesktop = useResponsive('up', 'lg');

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          background: 'rgba(243, 246, 254, 1)',
          height: `calc(100vh - ${HEADER.H_DASHBOARD_DESKTOP + 48}px)`,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 1.5,
          pt: 3,
          pb: 3,
          mt: `${HEADER.H_DASHBOARD_DESKTOP + 48}px`,
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        background: 'rgba(243, 246, 254, 1)',
        height: `calc(100vh - ${HEADER.H_DASHBOARD_DESKTOP}px)`,
        overflowY: 'auto',
        overflowX: 'hidden',
        borderTopLeftRadius: { lg: 12 },
        px: 1.5,
        pt: 3,
        pb: 3,
        mt: `${HEADER.H_DASHBOARD_DESKTOP}px`,
        ...(isDesktop && {
          width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
