import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import LoadingScreenAPI from './LoadingScreenAPI';

type LoadingScreenContextType = {
  isLoading: boolean;
  message: string;
  showLoading: (msg?: string) => void;
  hideLoading: () => void;
  setLoading: (loading: boolean, msg?: string) => void;
};

const LoadingScreenContext = createContext<LoadingScreenContextType | null>(null);

export function LoadingScreenProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Đang xử lý...');

  const showLoading = (msg = 'Đang xử lý...') => {
    setMessage(msg);
    setIsLoading(true);
  };

  const hideLoading = () => setIsLoading(false);

  const setLoading = (loading: boolean, msg = 'Đang xử lý...') => {
    setMessage(msg);
    setIsLoading(loading);
  };

  const value = useMemo(
    () => ({
      isLoading,
      message,
      showLoading,
      hideLoading,
      setLoading,
    }),
    [isLoading, message]
  );

  return (
    <LoadingScreenContext.Provider value={value}>
      {children}
      {isLoading && <LoadingScreenAPI message={message} />}
    </LoadingScreenContext.Provider>
  );
}

export function useLoadingScreen() {
  const context = useContext(LoadingScreenContext);
  if (!context) {
    throw new Error('useLoadingScreen must be used within a LoadingScreenProvider');
  }
  return context;
}
