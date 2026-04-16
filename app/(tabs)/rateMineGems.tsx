import React, { useMemo, useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ImageBackground,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

// SIZE ICONS MAP (add more as needed)
const SIZE_ICON_MAP: Record<string, Record<string, any>> = {
  topaz: {
    tiny: require("@/assets/images/TopazTiny.png"),
    small: require("@/assets/images/TopazSmall.png"),
    medium: require("@/assets/images/TopazMedium.png"),
    large: require("@/assets/images/TopazLarge.png"),
    huge: require("@/assets/images/TopazHuge.png"),
  },
  emerald: {
    tiny: require("@/assets/images/EmeraldTiny.png"),
    small: require("@/assets/images/EmeraldSmall.png"),
    medium: require("@/assets/images/EmeraldMedium.png"),
    large: require("@/assets/images/EmeraldLarge.png"),
    huge: require("@/assets/images/EmeraldHuge.png"),
  },
  sapphire: {
    tiny: require("@/assets/images/SapphireTiny.png"),
    small: require("@/assets/images/SapphireSmall.png"),
    medium: require("@/assets/images/SapphireMedium.png"),
    large: require("@/assets/images/SapphireLarge.png"),
    huge: require("@/assets/images/SapphireHuge.png"),
  },
  ruby: {
    tiny: require("@/assets/images/RubyTiny.png"),
    small: require("@/assets/images/RubySmall.png"),
    medium: require("@/assets/images/RubyMedium.png"),
    large: require("@/assets/images/RubyLarge.png"),
    huge: require("@/assets/images/RubyHuge.png"),
  },
  diamond: {
    tiny: require("@/assets/images/DiamondTiny.png"),
    small: require("@/assets/images/DiamondSmall.png"),
    medium: require("@/assets/images/DiamondMedium.png"),
    large: require("@/assets/images/DiamondLarge.png"),
    huge: require("@/assets/images/DiamondHuge.png"),
  },
};

const DEFAULT_SIZE_ICONS: Record<string, any> = {
  tiny: require("@/assets/images/TopazTiny.png"),
  small: require("@/assets/images/TopazSmall.png"),
  medium: require("@/assets/images/TopazMedium.png"),
  large: require("@/assets/images/TopazLarge.png"),
  huge: require("@/assets/images/TopazHuge.png"),
};

type MineItem = {
  id: string;
  name: string;
  image: any;
  baseGems: number;
};

const MINE_SIZES = ["tiny", "small", "medium", "large", "huge"] as const;
type MineSize = (typeof MINE_SIZES)[number];

const SIZE_MULTIPLIER: Record<MineSize, number> = {
  tiny: 1,
  small: 1.6,
  medium: 2.5,
  large: 4,
  huge: 6.5,
};

const FIXED_MINE_PRICES: Partial<Record<string, Record<MineSize, number>>> = {
  topaz:   { tiny: 3,  small: 6,   medium: 12,  large: 30,   huge: 90  },
  emerald: { tiny: 5,  small: 10,  medium: 20,  large: 50,   huge: 150 },
  sapphire:{ tiny: 10, small: 20,  medium: 40,  large: 100,  huge: 300 },
  ruby:    { tiny: 20, small: 40,  medium: 80,  large: 200,  huge: 600 },
  diamond: { tiny: 30, small: 60,  medium: 120, large: 300,  huge: 900 },
};

function getMineUnitPrice(itemId: string, baseGems: number, size: MineSize): number {
  const fixed = FIXED_MINE_PRICES[itemId]?.[size];
  if (typeof fixed === "number") return fixed;
  return Math.round(baseGems * SIZE_MULTIPLIER[size]);
}

function sizeLabel(size: MineSize): string {
  const labels: Record<MineSize, string> = {
    tiny: "Tiny",
    small: "Small",
    medium: "Medium",
    large: "Large",
    huge: "Huge",
  };
  return labels[size];
}

// Main MINE ITEMS
const MINE_ITEMS: MineItem[] = [
  { id: "topaz",    name: "Topaz",    image: require("@/assets/images/topaz.png"),    baseGems: 70  },
  { id: "emerald",  name: "Emerald",  image: require("@/assets/images/emerald.png"),  baseGems: 95  },
  { id: "sapphire", name: "Sapphire", image: require("@/assets/images/sapphire.png"), baseGems: 140 },
  { id: "ruby",     name: "Ruby",     image: require("@/assets/images/ruby.png"),     baseGems: 120 },
  { id: "diamond",  name: "Diamond",  image: require("@/assets/images/diamond.png"),  baseGems: 220 },
];

function parseIntegerDigits(input: string): number {
  const digitsOnly = input.replace(/[^\d]/g, "");
  if (!digitsOnly) return 0;
  return Number(digitsOnly);
}

function formatThousands(value: number): string {
  return value.toLocaleString("id-ID");
}

export default function RateMineGemsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sizeBoxBasis = width < 520 ? "48%" : width < 900 ? "31%" : "18.5%";
  const [copied, setCopied] = useState(false);

  const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({});

  const makeKey = (itemId: string, size: MineSize) => `${itemId}:${size}`;

  const setQty = (itemId: string, size: MineSize, value: string) => {
    const n = parseIntegerDigits(value);
    const key = makeKey(itemId, size);
    setQtyByKey((prev) => ({ ...prev, [key]: n === 0 ? "" : formatThousands(n) }));
  };

  const totalGems = useMemo(() => {
    return MINE_ITEMS.reduce((sum, item) => {
      let itemTotal = 0;
      for (const size of MINE_SIZES) {
        const qty = parseIntegerDigits(qtyByKey[makeKey(item.id, size)] ?? "");
        const unit = getMineUnitPrice(item.id, item.baseGems, size);
        itemTotal += qty * unit;
      }
      return sum + itemTotal;
    }, 0);
  }, [qtyByKey]);

  const copyTotalGems = async () => {
    await Clipboard.setStringAsync(`${formatThousands(totalGems)} gems`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onResetMiningGems = () => {
    setQtyByKey({});
    setCopied(false);
  };

  // Determine bg cover
  const backgroundImg = require("@/assets/images/background.jpg");

  return (
    <ImageBackground
      source={backgroundImg}
      resizeMode="cover"
      style={{ flex: 1, width: "100%", paddingTop: insets.top, minHeight: "100%" }}
      imageStyle={{ opacity: colorScheme === "light" ? 0.92 : 0.975 }}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(10,32,50,0.45)" }}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: "rgba(30,58,138,0.13)",
              backgroundColor: colorScheme === "light"
                ? "rgba(245,250,255,0.86)"
                : "rgba(16,24,40,0.94)",
              backdropFilter: Platform.OS === "web" ? "blur(10px)" : undefined,
              marginBottom: 12,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Buka menu"
              onPress={() => router.push("/(tabs)/rateByte")}
              style={({ pressed }) => [
                styles.menuButton,
                {
                  backgroundColor: colorScheme === "light" ? "#f5fafb" : "#13203D",
                  opacity: pressed ? 0.8 : 1,
                  borderColor: "#0ea5e9",
                  borderWidth: 1,
                },
              ]}
            >
              <Image
                source={require("@/assets/images/hamburger.png")}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </Pressable>
            <View>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: "#0284C7",
                    textShadowColor: "rgba(0,109,179,0.12)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 6,
                  },
                ]}
              >
                Mine Gems
              </Text>
              <Text style={[styles.headerSub, { color: "#fff" }]}>
                Mining Gems Calculator
              </Text>
         
            </View>
          </View>
          <Pressable
            onPress={onResetMiningGems}
            style={({ pressed }) => [
              styles.resetBtn,
              {
                backgroundColor: "#cffafe",
                opacity: pressed ? 0.7 : 1,
                borderColor: "#06b6d4",
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.resetLabel, { color: "#0ea5e9" }]}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 120,
              maxWidth: 850,
              alignSelf: "center",
              width: "100%",
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {MINE_ITEMS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: colorScheme === "light"
                    ? "rgba(255,255,255,0.91)"
                    : "rgba(10,44,71,0.985)",
                  borderColor: colorScheme === "light"
                    ? "#bae6fd"
                    : "#0284c7",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image
                  source={item.image}
                  style={styles.gemImage}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.gemName,
                    {
                      color: "#fff",
                      textShadowColor: "#075985",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 4,
                      marginLeft: 10,
                    },
               
                  ]}
                >
                  {item.name}
                </Text>
              </View>

              <View style={styles.sizesRowWrap}>
                {MINE_SIZES.map((size, idx) => {
                  const key = makeKey(item.id, size);
                  const qty = parseIntegerDigits(qtyByKey[key] ?? "");
                  const unit = getMineUnitPrice(item.id, item.baseGems, size);
                  const subtotal = qty * unit;
                  // Size icon selection
                  const iconSource =
                    SIZE_ICON_MAP[item.id]?.[size] || DEFAULT_SIZE_ICONS[size];
                  return (
                    <View
                      key={key}
                      style={[
                        styles.sizeBox,
                        { flexBasis: sizeBoxBasis },
                        { backgroundColor: "rgba(236,254,255,0.82)" },
                      ]}
                    >
                      <Image
                        source={iconSource}
                        style={styles.sizeIcon}
                        resizeMode="contain"
                      />
                      <Text
                        style={[
                          styles.sizeName,
                          {
                            marginBottom: 2,
                            color: "#0284C7",
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {sizeLabel(size)}
                      </Text>
                      <Text style={styles.unitPrice}>
                        {formatThousands(unit)} gems/item
                      </Text>
                      <TextInput
                        value={qtyByKey[key] ?? ""}
                        onChangeText={(v) => setQty(item.id, size, v)}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#94a3b8"
                        style={[
                          styles.qtyInput,
                          {
                            borderColor: "#36bef7",
                            backgroundColor: "#f0f9ff",
                            color: "#334155",
                            fontWeight: "600",
                          },
                        ]}
                        inputMode="numeric"
                      />
                      <Text
                        style={[
                          styles.subtotal,
                          {
                            color: "#164e63",
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {formatThousands(subtotal)} gems
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

        </ScrollView>
        <View
          style={[
            styles.summary,
            {
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Gems Value</Text>
            <Pressable
              onPress={copyTotalGems}
              style={({ pressed }) => [
                styles.copyValuePressable,
                { opacity: pressed ? 0.82 : 1 },
              ]}
              accessibilityLabel="Salin total mining gems"
              android_ripple={{ color: "#0369A1" }}
            >
              <Text style={styles.summaryValueLarge}>
                {formatThousands(totalGems)} gems
              </Text>
              <Image
                source={require("@/assets/images/copy.png")}
                style={[styles.copyIcon, { opacity: copied ? 1 : 0.85 }]}
                resizeMode="contain"
              />
            </Pressable>
          </View>
          {copied && (
            <Text style={styles.copiedHint}>Copied!</Text>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    marginHorizontal: 0,
    marginTop: 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
    opacity: 0.93,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resetLabel: {
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.08,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  menuIcon: { width: 22, height: 22, tintColor: "#0284C7" },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 14,
    gap: 28,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.6,
    marginBottom: 0,
    padding: 15,
    minWidth: 0,
    marginHorizontal: 0,
    marginTop: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: "#0ea5e9",
    shadowRadius: 5,
    shadowOpacity: 0.14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    borderBottomColor: "#e0f2fe",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 7,
  },
  gemImage: { width: 37, height: 37 },
  gemName: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 2,
    letterSpacing: 0.1,
  },
  sizesRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
    justifyContent: "space-between",
    width: "97%",
  },
  sizeBox: {
    backgroundColor: "#f5fafc",
    borderRadius: 15,
    padding: 10,
    marginBottom: 9,
    alignItems: "center",
    minWidth: 100,
    maxWidth: 160,
    flexGrow: 1,
    shadowColor: "#bae6fd",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 9,
    marginTop: 5,
    borderWidth: 1.0,
    borderColor: "#bae6fd",
  },
  sizeIcon: {
    width: 38,
    height: 38,
    marginBottom: 5,
    marginTop: 2,
  },
  sizeName: { fontSize: 15, fontWeight: "700", marginBottom: 1 },
  unitPrice: {
    fontSize: 12,
    color: "#0891b2",
    marginBottom: 4,
    marginTop: 1,
    fontWeight: "500",
  },
  qtyInput: {
    minWidth: 55,
    maxWidth: 68,
    width: "100%",
    borderWidth: 1.1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: Platform.OS === "web" ? 8 : 7,
    fontSize: 15,
    marginTop: 6,
    marginBottom: 3,
    textAlign: "center",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 1 },
  },
  subtotal: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 62,
    textAlign: "center",
    marginTop: 0,
    marginBottom: 1,
  },
  summary: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 23,
    paddingTop: 17,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(6,33,53,0.98)",
    borderTopColor: "#7dd3fc",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  summaryLabel: {
    color: "#e0f2fe",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.13,
  },
  summaryValueLarge: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginRight: 6,
    letterSpacing: 0.12,
  },
  copyValuePressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 4,
    marginBottom: 1,
  },
  copyIcon: {
    width: 21,
    height: 21,
    tintColor: "#cffafe",
  },
  copiedHint: {
    color: "#fff",
    marginTop: 5,
    fontSize: 13,
    opacity: 0.82,
    fontWeight: "400",
    letterSpacing: 0.06,
  },
});
