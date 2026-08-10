import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// @mui
import { Box } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import { useSettingsContext } from '../../components/settings';
//
import Main from './Main';
import Header from './header';
import NavMini from './nav/NavMini';
import NavVertical from './nav/NavVertical';
import NavHorizontal from './nav/NavHorizontal';

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const { themeLayout } = useSettingsContext();

  const isDesktop = useResponsive('up', 'lg');

  const [open, setOpen] = useState(false);

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderNavVertical = <NavVertical openNav={open} onCloseNav={handleClose} />;

  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #004982 0%, #00355E 80.52%)',
      }}
    >
      {isNavHorizontal ? (
        <>
          <Header onOpenNav={handleOpen} />
          {isDesktop ? <NavHorizontal /> : renderNavVertical}
          <Main>
            <Outlet />
          </Main>
        </>
      ) : isNavMini ? (
        <>
          <Header onOpenNav={handleOpen} />
          <Box sx={{ display: { lg: 'flex' }, minHeight: { lg: 1 } }}>
            {isDesktop ? <NavMini /> : renderNavVertical}
            <Main>
              <Outlet />
            </Main>
          </Box>
        </>
      ) : (
        <>
          <Header onOpenNav={handleOpen} />
          <Box sx={{ display: { lg: 'flex' }, minHeight: { lg: 1 } }}>
            {renderNavVertical}
            <Main>
              <Outlet />
            </Main>
          </Box>
        </>
      )}
    </Box>
  );
}
