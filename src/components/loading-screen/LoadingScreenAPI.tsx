import { m } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { Box, Typography, Portal } from '@mui/material';

type LoadingScreenAPIProps = {
  message?: string;
  isGlobal?: boolean;
};

export default function LoadingScreenAPI({ message = 'Đang xử lý...', isGlobal = true }: LoadingScreenAPIProps) {
  const content = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.76),
        backdropFilter: 'blur(5px)',
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}>
        {/* Animated Logo */}
        <m.div
          animate={{
            scale: [1, 0.9, 0.9, 1, 1],
            opacity: [1, 0.48, 0.48, 1, 1],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeatDelay: 1,
            repeat: Infinity,
          }}
        >
          <Box
            component="img"
            src="/logo/signet.png"
            sx={{ width: 54, height: 54 }}
          />
        </m.div>

        {/* Outer Ring 1 */}
        <Box
          component={m.div}
          animate={{
            scale: [1.6, 1, 1, 1.6, 1.6],
            rotate: [270, 0, 0, 270, 270],
            opacity: [0.25, 1, 1, 1, 0.25],
            borderRadius: ['25%', '25%', '50%', '50%', '25%'],
          }}
          transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
          sx={{
            width: 84,
            height: 84,
            position: 'absolute',
            border: (theme) => `solid 3px ${alpha(theme.palette.primary.dark, 0.24)}`,
          }}
        />

        {/* Outer Ring 2 */}
        <Box
          component={m.div}
          animate={{
            scale: [1, 1.2, 1.2, 1, 1],
            rotate: [0, 270, 270, 0, 0],
            opacity: [1, 0.25, 0.25, 0.25, 1],
            borderRadius: ['25%', '25%', '50%', '50%', '25%'],
          }}
          transition={{
            ease: 'linear',
            duration: 3.2,
            repeat: Infinity,
          }}
          sx={{
            width: 104,
            height: 104,
            position: 'absolute',
            border: (theme) => `solid 6px ${alpha(theme.palette.primary.dark, 0.24)}`,
          }}
        />
      </Box>

      {message && (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  return isGlobal ? <Portal>{content}</Portal> : content;
}
