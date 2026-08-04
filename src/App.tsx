import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// locales
import ThemeLocalization from './locales';
// components
import SnackbarProvider from './components/snackbar';
import { LoadingScreenProvider } from './components/loading-screen';
import { ThemeSettings } from './components/settings';
import { MotionLazyContainer } from './components/animate';

// ----------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionLazyContainer>
        <ThemeProvider>
          <ThemeSettings>
            <ThemeLocalization>
              <SnackbarProvider>
                <LoadingScreenProvider>
                  <Router />
                </LoadingScreenProvider>
              </SnackbarProvider>
            </ThemeLocalization>
          </ThemeSettings>
        </ThemeProvider>
      </MotionLazyContainer>
    </QueryClientProvider>
  );
}
