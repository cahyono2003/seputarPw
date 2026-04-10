export const SIZES = ['tiny', 'small', 'medium', 'large', 'huge'] as const;
export type FishSize = (typeof SIZES)[number];

export type FishItem = {
  id: string;
  label: string;
  emoji: string;
  /** Harga dasar per ekor untuk ukuran tiny (dummy) */
  basePrice: number;
};

/** 11 jenis ikan — harga dummy, skala naik per ukuran */
export const FISHES: FishItem[] = [
  { id: 'herring', label: 'Herring', emoji: '🐟', basePrice: 10 },
  { id: 'kingfish', label: 'Kingfish', emoji: '🐠', basePrice: 10 },
  { id: 'goldfish', label: 'Goldfish', emoji: '🐠', basePrice: 10},
  { id: 'butterflyfish', label: 'Butterflyfish', emoji: '🐠', basePrice: 22 },
  { id: 'carp', label: 'Carp', emoji: '🐡', basePrice: 15 },
  { id: 'halibut', label: 'Halibut', emoji: '🐟', basePrice: 38 },
  { id: 'tuna', label: 'Tuna', emoji: '🐟', basePrice: 55 },
  { id: 'sea_angler', label: 'Sea Angler', emoji: '🎣', basePrice: 42 },
  { id: 'dumbfish', label: 'Dumbfish', emoji: '🐟', basePrice: 12 },
  { id: 'acid_puffer', label: 'Acid Puffer', emoji: '🐡', basePrice: 68 },
  { id: 'piranha', label: 'Piranha', emoji: '🦈', basePrice: 35 },
  { id: 'crab', label: 'Crab', emoji: '🐡', basePrice: 10}
];

const SIZE_MULTIPLIER: Record<FishSize, number> = {
  tiny: 1,
  small: 1.6,
  medium: 2.5,
  large: 4,
  huge: 6.5,
};

const FIXED_PRICES: Partial<Record<string, Record<FishSize, number>>> = {
  // Harga asli dari user
  herring: {
    tiny: 10,
    small: 40,
    medium: 70,
    large: 100,
    huge: 300,
  },
  kingfish: {
    tiny: 10,
    small: 40,
    medium: 70,
    large: 100,
    huge: 300,
  },
  goldfish: {
    tiny: 15,
    small: 60,
    medium: 105,
    large: 150,
    huge: 450,
  },
  butterflyfish: {
    tiny: 15,
    small: 60,
    medium: 105,
    large: 150,
    huge: 450,
  },
  carp: {
    tiny: 20,
    small: 80,
    medium: 140,
    large: 200,
    huge: 600,
  },
  halibut: {
    tiny: 20,
    small: 80,
    medium: 140,
    large: 200,
    huge: 600,
  },
  tuna: {
    tiny: 40,
    small: 160,
    medium: 280,
    large: 400,
    huge: 1200,
  },
  sea_angler: {
    tiny: 30,
    small: 120,
    medium: 210,
    large: 300,
    huge: 900,
  },
  dumbfish: {
    tiny: 5,
    small: 10,
    medium: 30,
    large: 50,
    huge: 100,
  },
  acid_puffer: {
    tiny: 80,
    small: 320,
    medium: 560,
    large: 800,
    huge: 2400,
  },
  piranha: {
    tiny: 30,
    small: 120,
    medium: 210,
    large: 300,
    huge: 900,
  },
  crab: {
    tiny: 320,
    small: 1280,
    medium: 2240,
    large: 3200,
    huge: 9600,
  },
};

export function getUnitPrice(fishId: string, size: FishSize): number {
  const fixed = FIXED_PRICES[fishId]?.[size];
  if (typeof fixed === 'number') return fixed;

  const fish = FISHES.find((f) => f.id === fishId);
  if (!fish) return 0;
  return Math.round(fish.basePrice * SIZE_MULTIPLIER[size]);
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString('id-ID')} gems`;
}

export function sizeLabel(size: FishSize): string {
  const map: Record<FishSize, string> = {
    tiny: 'Tiny',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    huge: 'Huge',
  };
  return map[size];
}
