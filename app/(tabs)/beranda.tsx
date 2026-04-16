import {
  FISHES,
  formatPrice,
  getUnitPrice,
  sizeLabel,
  SIZES,
  type FishSize,
} from "@/constants/fish-data";
import { useFish } from "@/context/fish-context";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Map fishId + size => icon, seperti di @app/(tabs)/rateMineGems.tsx
const SIZE_ICONS: Record<string, Record<string, any>> = {
  herring: {
    tiny: require("@/assets/images/HerringTiny.png"),
    small: require("@/assets/images/HerringSmall.png"),
    medium: require("@/assets/images/HerringMedium.png"),
    large: require("@/assets/images/HerringLarge.png"),
    huge: require("@/assets/images/HerringHuge.png"),
  },
  kingfish: {
    tiny: require("@/assets/images/KingfishTiny.png"),
    small: require("@/assets/images/KingfishSmall.png"),
    medium: require("@/assets/images/KingfishMedium.png"),
    large: require("@/assets/images/KingfishLarge.png"),
    huge: require("@/assets/images/KingfishHuge.png"),
  },
  goldfish: {
    tiny: require("@/assets/images/GoldfishTiny.png"),
    small: require("@/assets/images/GoldfishSmall.png"),
    medium: require("@/assets/images/GoldfishMedium.png"),
    large: require("@/assets/images/GoldfishLarge.png"),
    huge: require("@/assets/images/GoldfishHuge.png"),
  },
  butterflyfish: {
    tiny: require("@/assets/images/ButterflyfishTiny.png"),
    small: require("@/assets/images/ButterflyfishSmall.png"),
    medium: require("@/assets/images/ButterflyfishMedium.png"),
    large: require("@/assets/images/ButterflyfishLarge.png"),
    huge: require("@/assets/images/ButterflyfishHuge.png"),
  },
  carp: {
    tiny: require("@/assets/images/CarpTiny.png"),
    small: require("@/assets/images/CarpSmall.png"),
    medium: require("@/assets/images/CarpMedium.png"),
    large: require("@/assets/images/CarpLarge.png"),
    huge: require("@/assets/images/CarpHuge.png"),
  },
  halibut: {
    tiny: require("@/assets/images/HalibutTiny.png"),
    small: require("@/assets/images/HalibutSmall.png"),
    medium: require("@/assets/images/HalibutMedium.png"),
    large: require("@/assets/images/HalibutLarge.png"),
    huge: require("@/assets/images/HalibutHuge.png"),
  },
  tuna: {
    tiny: require("@/assets/images/TunaTiny.png"),
    small: require("@/assets/images/TunaSmall.png"),
    medium: require("@/assets/images/TunaMedium.png"),
    large: require("@/assets/images/TunaLarge.png"),
    huge: require("@/assets/images/TunaHuge.png"),
  },
  sea_angler: {
    tiny: require("@/assets/images/SeaAnglerTiny.png"),
    small: require("@/assets/images/SeaAnglerSmall.png"),
    medium: require("@/assets/images/SeaAnglerMedium.png"),
    large: require("@/assets/images/SeaAnglerLarge.png"),
    huge: require("@/assets/images/SeaAnglerHuge.png"),
  },
  dumbfish: {
    tiny: require("@/assets/images/DumbFishTiny.png"),
    small: require("@/assets/images/DumbFishSmall.png"),
    medium: require("@/assets/images/DumbFishMedium.png"),
    large: require("@/assets/images/DumbFishLarge.png"),
    huge: require("@/assets/images/DumbFishHuge.png"),
  },
  acid_puffer: {
    tiny: require("@/assets/images/AcidPufferTiny.png"),
    small: require("@/assets/images/AcidPufferSmall.png"),
    medium: require("@/assets/images/AcidPufferMedium.png"),
    large: require("@/assets/images/AcidPufferLarge.png"),
    huge: require("@/assets/images/AcidPufferHuge.png"),
  },
  piranha: {
    tiny: require("@/assets/images/PiranhaTiny.png"),
    small: require("@/assets/images/PiranhaSmall.png"),
    medium: require("@/assets/images/PiranhaMedium.png"),
    large: require("@/assets/images/PiranhaLarge.png"),
    huge: require("@/assets/images/PiranhaHuge.png"),
  },
  crab: {
    tiny: require("@/assets/images/CrabTiny.png"),
    small: require("@/assets/images/CrabSmall.png"),
    medium: require("@/assets/images/CrabMedium.png"),
    large: require("@/assets/images/CrabLarge.png"),
    huge: require("@/assets/images/CrabHuge.png"),
  },
};

const fishImageById: Record<string, any> = {
  herring: require("@/assets/images/herring.png"),
  kingfish: require("@/assets/images/kingfish.png"),
  goldfish: require("@/assets/images/goldfish.png"),
  butterflyfish: require("@/assets/images/butterflyfish.png"),
  carp: require("@/assets/images/carp.png"),
  halibut: require("@/assets/images/halibut.png"),
  tuna: require("@/assets/images/tuna.png"),
  sea_angler: require("@/assets/images/seaangler.png"),
  dumbfish: require("@/assets/images/dumbfish.png"),
  acid_puffer: require("@/assets/images/acidpuffer.png"),
  piranha: require("@/assets/images/piranha.png"),
  crab: require("@/assets/images/crab.png"),
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;
  const { counts, setCount, reset, totalValue } = useFish();
  const [copied, setCopied] = React.useState(false);

  const setCountFromInput = useCallback(
    (fishId: string, size: FishSize, raw: string) => {
      const digits = raw.replace(/[^\d]/g, "");
      const next = digits.length ? Number(digits) : 0;
      setCount(fishId, size, next);
    },
    [setCount],
  );

  const onReset = () => {
    const apply = () => reset();
    if (Platform.OS === "web") {
      if (
        typeof globalThis !== "undefined" &&
        "confirm" in globalThis &&
        globalThis.confirm("Reset semua penghitungan?")
      ) {
        apply();
      }
    } else {
      Alert.alert("Reset penghitungan", "Hapus semua jumlah ikan?", [
        { text: "Batal", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: apply },
      ]);
    }
  };

  const copyGemsValue = async () => {
    await Clipboard.setStringAsync(formatPrice(totalValue));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.jpg")}
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      resizeMode="cover"
      imageStyle={{ opacity: 0.80 }}
    >
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityLabel="Buka pengaturan rate byte"
            onPress={() => router.push("/(tabs)/rateByte")}
            style={({ pressed }) => [
              styles.menuButton,
              {
                opacity: pressed ? 0.85 : 1,
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
            <Text style={[styles.headerTitle]}>Fish Gems</Text>
            <Text style={styles.headerSub}>Count Fish Gems</Text>
          </View>
        </View>
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            styles.resetBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.resetLabel}>Reset</Text>
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
        {FISHES.map((fish) => (
          <View
            key={fish.id}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Image
                source={fishImageById[fish.id]}
                style={styles.fishImage}
                resizeMode="contain"
              />
              <Text style={styles.fishName}>
                {fish.label}
              </Text>
            </View>
            <View style={styles.sizesRowWrap}>
              {SIZES.map((size) => {
                const n = counts[fish.id][size] ?? 0;
                const unit = getUnitPrice(fish.id, size);
                const line = n * unit;
                const sizeKey = typeof size === "string" ? size.toLowerCase() : String(size);
                const sizeIcon = SIZE_ICONS[fish.id]?.[sizeKey];
                return (
                  <View
                    key={size}
                    style={[
                      styles.sizeBox,
                      isNarrow && styles.sizeBoxNarrow,
                    ]}
                  >
                    {sizeIcon && (
                      <Image
                        source={sizeIcon}
                        style={styles.sizeIcon}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={styles.sizeName}>
                      {sizeLabel(size)}
                    </Text>
                    <Text style={styles.unitPrice}>
                      {formatPrice(unit)} / Fish
                    </Text>
                    <TextInput
                      value={String(n)}
                      onChangeText={(value) =>
                        setCountFromInput(fish.id, size, value)
                      }
                      keyboardType="number-pad"
                      style={styles.countInput}
                    />
                    <Text style={styles.lineTotal}>
                      {formatPrice(line)}
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
            onPress={copyGemsValue}
            style={({ pressed }) => [
              styles.copyValuePressable,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            accessibilityLabel="Salin total Gems Value"
            android_ripple={{ color: "#0369A1" }}
          >
            <Text selectable style={styles.summaryValueLarge}>
              {formatPrice(totalValue)}
            </Text>
            <Image
              source={require("@/assets/images/copy.png")}
              style={[styles.copyIcon, { opacity: copied ? 1 : 0.85 }]}
              resizeMode="contain"
            />
          </Pressable>
          {copied && (
            <Text style={styles.copiedHint}>Copied!</Text>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
  },
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
    backgroundColor: "rgba(17,24,39,0.87)",
    borderBottomColor: "#334155"
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.1,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 1,
    color: "#a2c2de",
    fontWeight: "500",
    letterSpacing: 0.13,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#475569",
  },
  resetLabel: {
    fontWeight: "700",
    fontSize: 15,
    color: "#38bdf8",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
    gap: 3,
    backgroundColor: "#164e63",
    marginRight: 10,
  },
  menuIcon: {
    width: 23,
    height: 23,
    tintColor: "#7dd3fc",
  },
  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 17,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.6,
    marginBottom: 0,
    padding: 15,
    minWidth: 0,
    marginHorizontal: 0,
    marginTop: 0,
    backgroundColor: "rgba(10,44,71,0.985)",
    borderColor: "#0284c7",
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
  fishImage: {
    width: 50,
    height: 50,
  },
  fishName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F0FDFA",
    letterSpacing: 0.1,
    marginLeft: 10,
    textShadowColor: "#075985",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sizesRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    justifyContent: "space-between",
    width: "100%",
  },
  sizeBox: {
    backgroundColor: "rgba(236,254,255,0.82)",
    borderRadius: 15,
    padding: 10,
    marginBottom: 9,
    alignItems: "center",
    width: 120,
    minWidth: 0,
    shadowColor: "#bae6fd",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 9,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  sizeBoxNarrow: {
    width: "46%",
    minWidth: 100,
  },
  sizeIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
    marginTop: 2,
  },
  sizeName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0284C7",
    letterSpacing: 0.06,
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: 12,
    marginTop: 1,
    marginBottom: 4,
    color: "#0891b2",
    fontWeight: "500"
  },
  countInput: {
    minWidth: 55,
    maxWidth: 68,
    width: "100%",
    borderWidth: 1.1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: Platform.OS === "web" ? 8 : 7,
    textAlign: "center",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 3,
    fontWeight: "600",
    color: "#334155",
    borderColor: "#36bef7",
    backgroundColor: "#f0f9ff",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
  },
  lineTotal: {
    minWidth: 62,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 13,
    color: "#164e63",
    letterSpacing: 0.08,
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
  summaryValue: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.11,
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
