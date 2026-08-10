// @mui
import { useTheme } from '@mui/material/styles';
import { Stack, AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// hooks
import useOffSetTop from '../../../hooks/useOffSetTop';
import useResponsive from '../../../hooks/useResponsive';
// config
import { HEADER, NAV } from '../../../config';
// components
import Logo from '../../../components/logo';
import SvgColor from '../../../components/svg-color';
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import ContactsPopover from './ContactsPopover';
import NotificationsPopover from './NotificationsPopover';
import navConfig from '../nav/config';

// ----------------------------------------------------------------------

function getActiveTitle(pathname: string): string {
  const cleanPath = (pathname || '').replace(/\/$/, '').toLowerCase();

  for (const group of navConfig) {
    if (group.items) {
      for (const item of group.items) {
        if (item.path && item.path.replace(/\/$/, '').toLowerCase() === cleanPath) {
          return (item as any).titleHeader || item.title;
        }
        const children = (item as any).children;
        if (children && Array.isArray(children)) {
          for (const child of children) {
            if (child.path && child.path.replace(/\/$/, '').toLowerCase() === cleanPath) {
              return child.titleHeader || child.title;
            }
          }
        }
      }
    }
  }

  if (cleanPath === '' || cleanPath === '/' || cleanPath === '/dashboard') {
    return 'Tổng quan hệ thống';
  }

  return 'Lưu trữ dữ liệu';
}

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const { pathname } = useLocation();

  const currentTitle = getActiveTitle(pathname);

  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const isDesktop = useResponsive('up', 'lg');

  const isOffset = useOffSetTop(HEADER.H_DASHBOARD_DESKTOP) && !isNavHorizontal;

  const renderContent = (
    <>
      {isDesktop && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {/* {!isDesktop && (
        <IconButton onClick={onOpenNav} sx={{ mr: 1, color: '#FFFFFF' }}>
          <SvgColor src="/logo/ic_menu.svg" />
        </IconButton>
      )} */}

      {/* Frame 427323768 - Header Title Dynamic */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          mr: 'auto',
          gap: '8px',
          height: 49,
        }}
      >
        <Box
          component="img"
          src="/logo/ic_header.svg"
          alt="Header Icon"
          sx={{
            width: 20,
            height: 20,
            flexShrink: 0,
            cursor: !isDesktop ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (!isDesktop && onOpenNav) {
              onOpenNav();
            }
          }}
        />
        <Typography
          sx={{
            fontFamily: "'Averta CY', sans-serif",
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: { xs: '15px', sm: '18px', md: '20px' },
            lineHeight: '28px',
            letterSpacing: '0.25px',
            color: '#FFCC0A',
            whiteSpace: 'nowrap',
          }}
        >
          {currentTitle.toUpperCase()}
        </Typography>
      </Stack>

      <Searchbar />

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1.5 }}
      >
        {/* <LanguagePopover /> */}

        <NotificationsPopover />

        {/* <ContactsPopover /> */}

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        background: 'transparent',
        zIndex: theme.zIndex.appBar + 1,
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(isDesktop && {
          width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
          height: HEADER.H_DASHBOARD_DESKTOP,
          ...(isOffset && {
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            background: 'transparent',
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
            borderBottom: 'none',
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { xs: 2, lg: 3 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
