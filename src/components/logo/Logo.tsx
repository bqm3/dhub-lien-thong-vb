import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, Typography, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const logo = (
      <Box
        ref={ref}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.25,
          height: 52,
          fontSize: 52,
          cursor: 'pointer',
          ...sx,
        }}
        {...other}
      >
        <Box
          component="img"
          src="/logo/logo.svg"
          alt="TLTVB"
          sx={{ height: '40px', width: 'auto', objectFit: 'contain', flexShrink: 0, mb: '30px' }}
        />
        {/* <Typography
          component="span"
          sx={{
            fontSize: '1em',
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#6e6e6e',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          TLTVB
        </Typography> */}
      </Box>
    );

    if (disabledLink) {
      return <>{logo}</>;
    }

    return (
      <Link to="/" component={RouterLink} sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
