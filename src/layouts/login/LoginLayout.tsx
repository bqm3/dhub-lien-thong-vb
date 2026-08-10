import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Stack, Box, Button } from '@mui/material';
import { useAuthContext } from '../../auth/useAuthContext';

const SLIDES = [
  {
    title: 'Trục liên thông văn bản',
    desc: 'Kết nối, gửi nhận và trao đổi văn bản điện tử giữa các cơ quan, đơn vị theo thời gian thực.',
    image: '/slides/slide1.svg',
  },
  {
    title: 'Bảo mật & Ký số tập trung',
    desc: 'Tích hợp ký số chứng thư PKI, xác thực đa lớp và bảo vệ an toàn luồng văn bản liên thông.',
    image: '/slides/slide4.svg',
  },
  {
    title: 'Giám sát & Báo cáo thông minh',
    desc: 'Theo dõi luồng luân chuyển văn bản, thống kê hiệu suất gửi nhận và cảnh báo lỗi tức thời.',
    image: '/slides/slide2.svg',
  },
] as const;

const SLIDE_COUNT = SLIDES.length;
const AUTOPLAY_MS = 4500;
const EXTENDED_SLIDES = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
const EXTENDED_COUNT = EXTENDED_SLIDES.length;

type Props = {
  children: React.ReactNode;
};

export default function LoginLayout({ children }: Props) {
  const { isAuthenticated, user, logout } = useAuthContext();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTransitionEnabled(true);
      setCurrentIndex((prev) => prev + 1);
    }, AUTOPLAY_MS);
  }, [clearTimer]);

  useEffect(() => {
    if (!isHovering) {
      startTimer();
    }
    return clearTimer;
  }, [isHovering, startTimer, clearTimer]);

  const handleTransitionEnd = useCallback(() => {
    if (currentIndex >= EXTENDED_COUNT - 1) {
      setTransitionEnabled(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      setTransitionEnabled(false);
      setCurrentIndex(SLIDE_COUNT);
    }
  }, [currentIndex]);

  const goToSlide = useCallback(
    (idx: number) => {
      setTransitionEnabled(true);
      setCurrentIndex(idx + 1);
      startTimer();
    },
    [startTimer]
  );

  const activeDot =
    currentIndex === EXTENDED_COUNT - 1
      ? 0
      : currentIndex === 0
        ? SLIDE_COUNT - 1
        : currentIndex - 1;

  const trackStyle = useMemo(
    () => ({
      transform: `translateX(-${currentIndex * (100 / EXTENDED_COUNT)}%)`,
      width: `${EXTENDED_COUNT * 100}%`,
      transition: transitionEnabled ? 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      display: 'flex',
    }),
    [currentIndex, transitionEnabled]
  );

  const slideItemStyle = useMemo(() => ({ width: `${100 / EXTENDED_COUNT}%` }), []);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'common.white',
        color: 'grey.800',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* LEFT PANEL: LOGIN FORM CONTAINER */}
      <Box
        sx={{
          width: { xs: '100%', md: 590 },
          minHeight: '100vh',
          bgcolor: 'common.white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 4, md: 6 },
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            my: 'auto',
            width: '100%',
            maxWidth: 380,
            mx: 'auto',
          }}
        >
          {/* BIG DATA LOGO */}
          <Box
            sx={{
              width: 250,
              height: 200,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src="/big_data_logo.png"
              alt="Big Data"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                userSelect: 'none',
              }}
            />
          </Box>

          {isAuthenticated ? (
            <>
              <Box sx={{ width: '100%', maxWidth: 356, textAlign: 'center', mb: 4, px: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.800', mb: 1.5 }}>
                  Xin chào, {user?.name || user?.displayName || 'Bạn'}! 👋
                </Typography>
                <Typography sx={{ color: '#757575', fontSize: 16, lineHeight: '22px', fontWeight: 400 }}>
                  Bạn đã đăng nhập thành công vào Trục liên thông văn bản.
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ width: '100%', maxWidth: 308 }}>
                <Button
                  component={RouterLink}
                  to="/dashboard"
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
                  Vào Dashboard
                </Button>
                <Button
                  onClick={logout}
                  sx={{
                    height: 44,
                    borderRadius: '30px',
                    bgcolor: 'grey.200',
                    color: 'grey.700',
                    fontWeight: 600,
                    fontSize: 14,
                    '&:hover': {
                      bgcolor: 'grey.300',
                    },
                  }}
                >
                  Đăng xuất
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography
                sx={{
                  width: '100%',
                  maxWidth: 356,
                  fontSize: 24,
                  fontWeight: 400,
                  lineHeight: '30px',
                  color: '#757575',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                Nền tảng Trục liên thông văn bản - Kết nối, gửi nhận và điều hành văn bản điện tử tập trung, hiệu quả.
              </Typography>

              <Box sx={{ width: '100%', maxWidth: 350 }}>{children}</Box>
            </>
          )}
        </Box>
      </Box>

      {/* RIGHT PANEL: RADIAL GRADIENT CAROUSEL */}
      <Box
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          zIndex: 10,
          background: 'radial-gradient(50% 50% at 50% 50%, #0060B9 0%, #004F93 90.04%)',
        }}
      >
        <Box sx={{ width: 650, overflow: 'hidden' }}>
          <Box style={trackStyle} onTransitionEnd={handleTransitionEnd}>
            {EXTENDED_SLIDES.map((slide, idx) => (
              <Box
                key={`${slide.title}-${idx}`}
                style={slideItemStyle}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '23px',
                  flexShrink: 0,
                }}
              >
                {/* SLIDE TEXT */}
                <Stack spacing={1} sx={{ width: 523, textAlign: 'center', color: 'common.white' }}>
                  <Typography variant="h4" sx={{ fontSize: 28, fontWeight: 600, lineHeight: '36px' }}>
                    {slide.title}
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 400, lineHeight: '21px', opacity: 0.8 }}>
                    {slide.desc}
                  </Typography>
                </Stack>

                {/* SLIDE IMAGE CONTAINER */}
                <Box
                  sx={{
                    width: 650,
                    height: 380,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                  }}
                >
                  <Box
                    component="img"
                    src={slide.image}
                    alt={slide.title}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          {/* DOTS INDICATOR */}
          <Stack direction="row" spacing={1.25} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
            {SLIDES.map((slide, idx) => (
              <Box
                key={slide.title}
                onClick={() => goToSlide(idx)}
                sx={{
                  height: 10,
                  borderRadius: '10px',
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  width: idx === activeDot ? 28 : 10,
                  bgcolor: idx === activeDot ? 'common.white' : 'rgba(255, 255, 255, 0.4)',
                  '&:hover': {
                    bgcolor: idx === activeDot ? 'common.white' : 'rgba(255, 255, 255, 0.75)',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}