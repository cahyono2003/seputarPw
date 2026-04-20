import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { MINE_ITEMS, MINE_SIZES, type MineSize, getMineUnitPrice } from "@/constants/gems-data";

export type MineCounts = Record<string, Record<MineSize, number>>;

type MineGemsContextValue = {
  counts: MineCounts;
  setCount: (itemId: string, size: MineSize, value: number) => void;
  reset: () => void;
  totalValue: number;
};

const MineGemsContext = createContext<MineGemsContextValue | undefined>(undefined);

function emptyCounts(): MineCounts {
  const out: MineCounts = {};
  for (const item of MINE_ITEMS) {
    out[item.id] = {} as Record<MineSize, number>;
    for (const size of MINE_SIZES) {
      out[item.id][size] = 0;
    }
  }
  return out;
}

export function MineGemsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<MineCounts>(() => emptyCounts());

  const setCount = useCallback((itemId: string, size: MineSize, value: number) => {
    setCounts((prev) => {
      const next = { ...prev, [itemId]: { ...prev[itemId] } };
      const safeValue = Math.max(0, value);
      next[itemId] = { ...next[itemId], [size]: safeValue };
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCounts(emptyCounts());
  }, []);

  const totalValue = useMemo(() => {
    let value = 0;
    for (const item of MINE_ITEMS) {
      for (const size of MINE_SIZES) {
        const count = counts[item.id]?.[size] ?? 0;
        value += count * getMineUnitPrice(item.id, item.baseGems, size);
      }
    }
    return value;
  }, [counts]);

  const contextValue = useMemo(
    () => ({
      counts,
      setCount,
      reset,
      totalValue,
    }),
    [counts, reset, setCount, totalValue],
  );

  return <MineGemsContext.Provider value={contextValue}>{children}</MineGemsContext.Provider>;
}

export function useMineGems() {
  const context = useContext(MineGemsContext);
  if (!context) throw new Error("useMineGems must be used within MineGemsProvider");
  return context;
}
