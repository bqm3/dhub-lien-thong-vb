import { useState, memo, useEffect } from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useNavigate, useLocation } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import {
  Box,
  Slide,
  Popper,
  InputBase,
  PopperProps,
  InputAdornment,
  ClickAwayListener,
  Button,
} from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
// utils
import { bgBlur } from '../../../utils/cssStyles';
import flattenArray from '../../../utils/flattenArray';
// components
import Iconify from '../../../components/iconify';
import { NavListProps } from '../../../components/nav-section';
import { IconButtonAnimate } from '../../../components/animate';
import SearchNotFound from '../../../components/search-not-found';
import DocumentExchangeDetailDialog from '../../../pages/exchange/DocumentExchangeDetailDialog';
import { ExchangeTransaction } from '../../../sections/interoperability/mockData';
//
import NavConfig from '../nav/config';
import filterNavByPermission from '../nav/filterNavByPermission';
import { useAuthContext } from '../../../auth/useAuthContext';

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const StyledSearchbar = styled('div')(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  top: 0,
  left: 0,
  zIndex: 9999,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: APPBAR_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z24,
  backgroundColor: alpha(theme.palette.background.paper, 0.96),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

const StyledPopper = styled((props: PopperProps) => <Popper {...props} />)(({ theme }) => ({
  left: `8px !important`,
  top: `${APPBAR_MOBILE + 8}px !important`,
  width: 'calc(100% - 16px) !important',
  transform: 'none !important',
  zIndex: 9999,
  [theme.breakpoints.up('md')]: {
    top: `${APPBAR_DESKTOP + 8}px !important`,
  },
  '& .MuiAutocomplete-paper': {
    padding: theme.spacing(1, 0),
    boxShadow: theme.customShadows.z20,
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiListSubheader-root': {
    '&.MuiAutocomplete-groupLabel': {
      ...bgBlur({ color: theme.palette.background.neutral }),
      ...theme.typography.overline,
      top: 0,
      margin: 0,
      lineHeight: '40px',
      borderRadius: theme.shape.borderRadius,
      fontWeight: 700,
      color: theme.palette.primary.main,
      paddingLeft: theme.spacing(2),
    },
  },
  '& .MuiAutocomplete-listbox': {
    '& .MuiAutocomplete-option': {
      padding: theme.spacing(1, 2.5),
      margin: 0,
      display: 'block',
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:last-of-type': {
        borderBottomColor: 'transparent',
      },
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    },
  },
}));

// ----------------------------------------------------------------------

interface Option extends NavListProps {
  subheader: string;
}

function Searchbar() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredNavConfig = filterNavByPermission(NavConfig, user?.permissions, user);
  const reduceItems = filteredNavConfig.map((list) => handleLoop(list.items, (list as any).subheader)).flat();

  const allItems = flattenArray(reduceItems).map((option) => {
    const group = splitPath(reduceItems, option.path);

    return {
      group: group && group.length > 1 ? group[0] : (option as Option).subheader,
      title: option.title,
      path: option.path,
    };
  });

  useEffect(() => {
    if (open) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openDetail, setOpenDetail] = useState(false);
  const [searchDetailTx, setSearchDetailTx] = useState<ExchangeTransaction | null>(null);

  const handleOpenSearchDetail = (query: string) => {
    const codeStr = query.trim() || 'VB-2026/0811/LTVB';
    const mockTx: ExchangeTransaction = {
      id: `105`,
      code: codeStr.toUpperCase(),
      documentId: codeStr.toUpperCase(),
      sender: 'BỘ CÔNG THƯƠNG (MOIT)',
      senderCode: 'MOIT',
      receiver: 'Văn phòng BCT, UBND TP Hà Nội, UBND TP Hồ Chí Minh',
      receivers: [
        { code: 'BCT-01', name: 'Văn phòng Bộ Công Thương', status: 'RECEIVED' },
        { code: 'UBND-HN', name: 'UBND TP Hà Nội', status: 'RECEIVED' },
        { code: 'UBND-HCM', name: 'UBND TP Hồ Chí Minh', status: 'WAITING' },
      ],
      receiverCode: ['BCT-01', 'UBND-HN', 'UBND-HCM'],
      type: 'Trao đổi liên thông',
      sentAt: new Date().toISOString(),
      status: 'SUCCESS',
      ack: 'ACK',
      retries: 0,
      updatedAt: new Date().toISOString(),
      route: 'MOIT -> BCT-01, UBND-HN, UBND-HCM',
      rawRoutes: [
        {
          ID: 101,
          DOCUMENT_ID: codeStr.toUpperCase(),
          SENDER_CODE: 'MOIT',
          SENDER_NAME: 'Bộ Công Thương',
          RECEIVER_CODE: 'UBND-HN',
          RECEIVER_NAME: 'UBND TP Hà Nội',
          STATUS: 'RECEIVED',
          ACK_TIME: new Date().toISOString(),
          CDATE: new Date().toISOString(),
          RETRY_COUNT: 0,
        },
        {
          ID: 102,
          DOCUMENT_ID: codeStr.toUpperCase(),
          SENDER_CODE: 'MOIT',
          SENDER_NAME: 'Bộ Công Thương',
          RECEIVER_CODE: 'UBND-HCM',
          RECEIVER_NAME: 'UBND TP Hồ Chí Minh',
          STATUS: 'WAITING',
          CDATE: new Date().toISOString(),
          RETRY_COUNT: 1,
        },
      ],
    };
    setSearchDetailTx(mockTx);
    setOpenDetail(true);
    handleClose();
  };

  const handleClick = (path: string) => {
    if (!path || !path.startsWith('/')) {
      handleOpenSearchDetail(path || searchQuery);
      return;
    }
    if (path.includes('http')) {
      window.open(path);
    } else {
      navigate(path);
    }
    handleClose();
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (searchQuery && !searchQuery.startsWith('/')) {
        handleOpenSearchDetail(searchQuery);
      } else {
        handleClick(searchQuery);
      }
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        <IconButtonAnimate
          onClick={handleOpen}
          sx={{ width: 40, height: 40 }}
        >
          <Iconify icon="eva:search-fill" width={20} color={'white'} />
        </IconButtonAnimate>

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <StyledSearchbar>
            <InputBase
              fullWidth
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tra cứu văn bản, transaction..."
              onKeyUp={handleKeyUp}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'primary.main', width: 22, height: 22 }} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  {searchQuery && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<Iconify icon="solar:document-text-bold" width={16} />}
                      onClick={() => handleOpenSearchDetail(searchQuery)}
                      sx={{ mr: 1, borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                      Tra cứu văn bản
                    </Button>
                  )}
                  <IconButtonAnimate onClick={handleClose}>
                    <Iconify icon="eva:close-fill" width={20} />
                  </IconButtonAnimate>
                </InputAdornment>
              }
              sx={{ height: 1, typography: 'subtitle1', fontWeight: 600 }}
            />
          </StyledSearchbar>
        </Slide>

        <DocumentExchangeDetailDialog
          open={openDetail}
          detailTx={searchDetailTx}
          onClose={() => setOpenDetail(false)}
          onAck={() => {}}
          onReplay={() => {}}
        />
      </div>
    </ClickAwayListener>
  );
}

export default memo(Searchbar);

// ----------------------------------------------------------------------

type ItemProps = {
  path: string[];
  currItem: NavListProps;
};

function splitPath(array: NavListProps[], key: string) {
  let stack = array.map((item) => ({
    path: [item.title],
    currItem: item,
  }));

  while (stack.length) {
    const { path, currItem } = stack.pop() as ItemProps;

    if (currItem.path === key) {
      return path;
    }

    if (currItem.children?.length) {
      stack = stack.concat(
        currItem.children.map((item: NavListProps) => ({
          path: path.concat(item.title),
          currItem: item,
        }))
      );
    }
  }
  return null;
}

// ----------------------------------------------------------------------

function handleLoop(array: any, subheader?: string) {
  return array?.map((list: any) => ({
    subheader,
    ...list,
    ...(list.children && {
      children: handleLoop(list.children, subheader),
    }),
  }));
}
