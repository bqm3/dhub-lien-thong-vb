import { Typography, Stack, Box } from '@mui/material';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
//
import { StyledRoot, StyledSection, StyledContent } from './styles';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  illustration?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ children }: Props) {
  return (
    <StyledRoot>
      <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: 5 },
          ml: { xs: 2, md: 5 },
        }}
      />

      <StyledSection>
        {/* Bright, airy background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -2,
            background: 'radial-gradient(circle at 50% 50%, #F0F9FF 0%, #E0F2FE 100%)',
          }}
        />

        {/* Soft light glow */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            filter: 'blur(120px)',
            background: 'rgba(56, 189, 248, 0.25)',
            zIndex: -1,
          }}
        />

        {/* Subtle grid pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            opacity: 0.04,
            backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <Box
          sx={{
            zIndex: 1,
            width: '100%',
            maxWidth: 700,
            px: { md: 6, lg: 9 },
            height: '100%',
            minHeight: { md: 560 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#0F172A',
          }}
        >
          {/* ---- TOP/MIDDLE: heading block, the focal point ---- */}
          <Stack spacing={2.25}>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                // letterSpacing: -1,
                // lineHeight: 1.15,
                background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Trục liên thông văn bản
            </Typography>

            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 400, lineHeight: 1.7, maxWidth: 460 }}>
              Hệ thống kết nối, trao đổi dữ liệu và giám sát luồng văn bản điện tử quốc gia
            </Typography>
          </Stack>

          {/* ---- Feature list — horizontal icon rows, replaces stacked cards ---- */}
          <Stack sx={{ mt: 5, mb: 5 }}>
            {[
              {
                icon: 'eva:file-text-fill',
                color: '#0284C7',
                bg: 'rgba(2, 132, 199, 0.1)',
                title: 'Liên thông tức thời',
                desc: 'Văn bản được gửi và xác thực theo thời gian thực giữa các đơn vị',
              },
              {
                icon: 'eva:cube-fill',
                color: '#16A34A',
                bg: 'rgba(22, 163, 74, 0.1)',
                title: 'Kết nối liên thông',
                desc: 'Tích hợp đồng bộ với hệ thống quản lý văn bản của từng bộ, ngành',
              },
              {
                icon: 'eva:shield-fill',
                color: '#CA8A04',
                bg: 'rgba(202, 138, 4, 0.1)',
                title: 'Bảo mật & xác thực',
                desc: 'Chữ ký số và mã hoá đầu-cuối cho toàn bộ luồng dữ liệu',
              },
            ].map((item, index, arr) => (
              <Stack
                key={item.title}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{
                  py: 2,
                  borderBottom: index < arr.length - 1 ? '1px solid rgba(15, 23, 42, 0.07)' : 'none',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: item.bg,
                    color: item.color,
                  }}
                >
                  <Iconify icon={item.icon} width={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          {/* ---- BOTTOM: compact footer stats bar, anchored ---- */}
          <Stack
            direction="row"
            divider={<Box sx={{ width: '1px', bgcolor: 'rgba(15, 23, 42, 0.08)' }} />}
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(15, 23, 42, 0.06)',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px 0 rgba(15, 23, 42, 0.05)',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flex: 1, px: 2.5, py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                2,854,910+
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Văn bản đã liên thông
              </Typography>
            </Box>
            <Box sx={{ flex: 1, px: 2.5, py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                168 đơn vị
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Điểm kết nối hệ thống
              </Typography>
            </Box>
            <Box sx={{ flex: 1.2, px: 2.5, py: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#16A34A',
                    boxShadow: '0 0 8px #16A34A',
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3, color: '#15803D' }}>
                  99.99%
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                SLA hạ tầng ổn định
              </Typography>
            </Box>
          </Stack>
        </Box>
      </StyledSection>

      <StyledContent>
        <Stack sx={{ width: 1 }}> {children} </Stack>
      </StyledContent>
    </StyledRoot>
  );
}