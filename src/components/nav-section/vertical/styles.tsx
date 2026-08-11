// @mui
import { alpha, styled } from '@mui/material/styles';
import { ListItemIcon, ListSubheader, ListItemButton } from '@mui/material';
// config
import { ICON, NAV } from '../../../config';
//
import { NavItemProps } from '../types';

// ----------------------------------------------------------------------

type StyledItemProps = Omit<NavItemProps, 'item'> & {
  caption?: boolean;
  disabled?: boolean;
};

export const StyledItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'caption',
})<StyledItemProps>(({ active, disabled, depth, caption, theme }) => {
  const subItem = depth !== 1;

  const activeStyle = {
    color: '#FFFFFF',
    backgroundColor: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    '& .MuiTypography-root': {
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeightBold,
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  };

  const activeSubStyle = {
    color: '#FFFFFF',
    backgroundColor: alpha(theme.palette.primary.main, 0.4),
    fontWeight: theme.typography.fontWeightBold,
    '& .MuiTypography-root': {
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeightBold,
    },
  };

  return {
    position: 'relative',
    textTransform: 'capitalize',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1.5),
    paddingTop: '5px !important',
    paddingBottom: '5px !important',
    marginBottom: '2px',
    color: '#FFFFFF',
    borderRadius: theme.shape.borderRadius,
    height: 'auto',
    minHeight: 'auto',
    '& .MuiTypography-root': {
      color: '#FFFFFF',
    },
    '& .MuiListItemIcon-root': {
      minWidth: '24px !important',
      marginRight: '8px !important',
      color: '#FFFFFF !important',
    },
    '&:hover': {
      color: '#FFFFFF',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      '& .MuiTypography-root': {
        color: '#FFFFFF',
      },
      '& .MuiListItemIcon-root': {
        color: '#FFFFFF',
      },
    },
    // Sub item
    ...(subItem && {
      height: 'auto',
      minHeight: 'auto',
      ...(depth > 2 && {
        paddingLeft: theme.spacing(depth),
      }),
      ...(caption && {
        height: 'auto',
      }),
    }),
    // Active item
    ...(active && {
      ...activeStyle,
      '&:hover': {
        ...activeStyle,
      },
    }),
    // Active sub item
    ...(subItem &&
      active && {
        ...activeSubStyle,
        '&:hover': {
          ...activeSubStyle,
        },
      }),
    // Disabled
    ...(disabled && {
      '&.Mui-disabled': {
        opacity: 0.64,
      },
    }),
  };
});

// ----------------------------------------------------------------------

export const StyledIcon = styled(ListItemIcon)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: ICON.NAV_ITEM,
  height: ICON.NAV_ITEM,
  minWidth: '24px !important',
  marginRight: '8px !important',
  color: '#FFFFFF !important',
  '& *': {
    color: '#FFFFFF !important',
  },
}));

// ----------------------------------------------------------------------

type StyledDotIconProps = {
  active?: boolean;
};

export const StyledDotIcon = styled('span', {
  shouldForwardProp: (prop) => prop !== 'active',
})<StyledDotIconProps>(({ active, theme }) => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  backgroundColor: '#FFFFFF',
  opacity: 0.95,
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shorter,
  }),
  ...(active && {
    transform: 'scale(1.8)',
    backgroundColor: '#FFFFFF',
    opacity: 1,
  }),
}));

// ----------------------------------------------------------------------

export const StyledSubheader = styled(ListSubheader)(({ theme }) => ({
  ...theme.typography.overline,
  fontSize: 11,
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(0.5),
  color: '#FFFFFF',
  backgroundColor: 'transparent',
}));
