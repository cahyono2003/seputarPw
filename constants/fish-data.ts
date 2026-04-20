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

const ZERO_CODEPOINTS: number[] = [
  0x0030, // ASCII
  0x0660, // Arabic-Indic
  0x06f0, // Extended Arabic-Indic
  0x07c0, // NKo
  0x0966, // Devanagari
  0x09e6, // Bengali
  0x0a66, // Gurmukhi
  0x0ae6, // Gujarati
  0x0b66, // Oriya
  0x0be6, // Tamil
  0x0c66, // Telugu
  0x0ce6, // Kannada
  0x0d66, // Malayalam
  0x0de6, // Sinhala Lith
  0x0966, // Devanagari
  0x0e50, // Thai
  0x0ed0, // Lao
  0x1040, // Myanmar
  0x1090, // Myanmar Shan
  0x17e0, // Khmer
  0x1810, // Mongolian
  0x1946, // Limbu
  0x19d0, // New Tai Lue
  0x1a80, // Tai Tham Hora
  0x1a90, // Tai Tham Tham
  0x1b50, // Balinese
  0x1bb0, // Sundanese
  0x1c40, // Lepcha
  0x1c50, // Ol Chiki
  0xa620, // Vai
  0xa8d0, // Saurashtra
  0xa900, // Kayah Li
  0xa9d0, // Javanese
  0xa9f0, // Myanmar Tai Laing
  0xaa50, // Cham
  0xabf0, // Meetei Mayek
  0xff10, // Fullwidth
  0x1d7ce, // Mathematical Bold
  0x1d7d8, // Mathematical Double-Struck
  0x1d7e2, // Mathematical Sans-Serif
  0x1d7ec, // Mathematical Sans-Serif Bold
  0x1d7f6, // Mathematical Monospace
];

function digitFromCodePoint(cp: number): string | null {
  for (const zero of ZERO_CODEPOINTS) {
    const diff = cp - zero;
    if (diff >= 0 && diff <= 9) return String(diff);
  }
  return null;
}

export function extractDigits(input: string): string {
  const chars = Array.from(input);
  let out = "";
  for (const ch of chars) {
    const cp = ch.codePointAt(0);
    if (cp == null) continue;
    const digit = digitFromCodePoint(cp);
    if (digit !== null) out += digit;
  }
  return out;
}

export function parseWholeNumberInput(input: string): number {
  const digits = extractDigits(input);
  if (!digits) return 0;
  return Number(digits);
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
