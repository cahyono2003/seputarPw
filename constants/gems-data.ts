import { parseWholeNumberInput } from "@/constants/fish-data";

/**
 * Format harga gems dengan locale default user (multibahasa)
 * Supaya mengikuti locale device/browser pengguna (misal 1,000,000 atau 1.000.000).
 */
export function formatPrice(value: number): string {
  // undefined locale -> pakai default browser/user device
  return `${value.toLocaleString(undefined)} gems`;
}

export const MINE_SIZES = ["tiny", "small", "medium", "large", "huge"] as const;
export type MineSize = (typeof MINE_SIZES)[number];

export type MineItem = {
  id: string;
  label: string;
  baseGems: number;
};

export const MINE_ITEMS: MineItem[] = [
  { id: "topaz", label: "Topaz", baseGems: 70 },
  { id: "emerald", label: "Emerald", baseGems: 95 },
  { id: "sapphire", label: "Sapphire", baseGems: 140 },
  { id: "ruby", label: "Ruby", baseGems: 120 },
  { id: "diamond", label: "Diamond", baseGems: 220 },
];

const SIZE_MULTIPLIER: Record<MineSize, number> = {
  tiny: 1,
  small: 1.6,
  medium: 2.5,
  large: 4,
  huge: 6.5,
};

const FIXED_MINE_PRICES: Partial<Record<string, Record<MineSize, number>>> = {
  topaz: { tiny: 3, small: 6, medium: 12, large: 30, huge: 90 },
  emerald: { tiny: 5, small: 10, medium: 20, large: 50, huge: 150 },
  sapphire: { tiny: 10, small: 20, medium: 40, large: 100, huge: 300 },
  ruby: { tiny: 20, small: 40, medium: 80, large: 200, huge: 600 },
  diamond: { tiny: 30, small: 60, medium: 120, large: 300, huge: 900 },
};

export function getMineUnitPrice(itemId: string, baseGems: number, size: MineSize): number {
  const fixed = FIXED_MINE_PRICES[itemId]?.[size];
  if (typeof fixed === "number") return fixed;
  return Math.round(baseGems * SIZE_MULTIPLIER[size]);
}

export function mineSizeLabel(size: MineSize): string {
  const labels: Record<MineSize, string> = {
    tiny: "Tiny",
    small: "Small",
    medium: "Medium",
    large: "Large",
    huge: "Huge",
  };
  return labels[size];
}

// Deprecated: Pakai formatPrice saja
export function formatMineGems(value: number): string {
  return `${value.toLocaleString("id-ID")} gems`;
}

export function parseMineWholeNumberInput(input: string): number {
  return parseWholeNumberInput(input);
}
