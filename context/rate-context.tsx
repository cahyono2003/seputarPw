import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type RateContextValue = {
  byteRate: number;
  setByteRate: (value: number) => void;
};

const RateContext = createContext<RateContextValue | undefined>(undefined);

export function RateProvider({ children }: { children: ReactNode }) {
  const [byteRate, setByteRate] = useState<number>(200);

  const value = useMemo(
    () => ({
      byteRate,
      setByteRate,
    }),
    [byteRate],
  );

  return <RateContext.Provider value={value}>{children}</RateContext.Provider>;
}

export function useRate() {
  const ctx = useContext(RateContext);
  if (!ctx) {
    throw new Error('useRate must be used within RateProvider');
  }
  return ctx;
}

