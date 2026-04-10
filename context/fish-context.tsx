import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { FISHES, SIZES, type FishSize, getUnitPrice } from "@/constants/fish-data";

export type FishCounts = Record<string, Record<FishSize, number>>;

type FishContextValue = {
  counts: FishCounts;
  bump: (fishId: string, size: FishSize, delta: number) => void;
  setCount: (fishId: string, size: FishSize, value: number) => void;
  reset: () => void;
  totalFish: number;
  totalValue: number;
  totalBySize: Record<FishSize, number>;
};

const FishContext = createContext<FishContextValue | undefined>(undefined);

function emptyCounts(): FishCounts {
  const out: FishCounts = {};
  for (const f of FISHES) {
    out[f.id] = {} as Record<FishSize, number>;
    for (const s of SIZES) {
      out[f.id][s] = 0;
    }
  }
  return out;
}

export function FishProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<FishCounts>(() => emptyCounts());

  const bump = useCallback((fishId: string, size: FishSize, delta: number) => {
    setCounts((prev) => {
      const next = { ...prev, [fishId]: { ...prev[fishId] } };
      const v = Math.max(0, (next[fishId][size] ?? 0) + delta);
      next[fishId] = { ...next[fishId], [size]: v };
      return next;
    });
  }, []);

  const setCount = useCallback((fishId: string, size: FishSize, value: number) => {
    setCounts((prev) => {
      const next = { ...prev, [fishId]: { ...prev[fishId] } };
      const safeValue = Math.max(0, value);
      next[fishId] = { ...next[fishId], [size]: safeValue };
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCounts(emptyCounts());
  }, []);

  const totalBySize = useMemo(() => {
    const out = {} as Record<FishSize, number>;
    for (const s of SIZES) out[s] = 0;
    for (const f of FISHES) {
      for (const s of SIZES) {
        out[s] += counts[f.id][s] ?? 0;
      }
    }
    return out;
  }, [counts]);

  const { totalFish, totalValue } = useMemo(() => {
    let fish = 0;
    let value = 0;
    for (const f of FISHES) {
      for (const s of SIZES) {
        const c = counts[f.id][s] ?? 0;
        fish += c;
        value += c * getUnitPrice(f.id, s);
      }
    }
    return { totalFish: fish, totalValue: value };
  }, [counts]);

  const value: FishContextValue = useMemo(
    () => ({
      counts,
      bump,
      setCount,
      reset,
      totalFish,
      totalValue,
      totalBySize,
    }),
    [bump, counts, reset, setCount, totalBySize, totalFish, totalValue],
  );

  return <FishContext.Provider value={value}>{children}</FishContext.Provider>;
}

export function useFish() {
  const ctx = useContext(FishContext);
  if (!ctx) throw new Error("useFish must be used within FishProvider");
  return ctx;
}

