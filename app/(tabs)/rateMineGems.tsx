import React, { useCallback, useState } from "react";
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
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import {
  MINE_ITEMS,
  MINE_SIZES,
  type MineSize,
  getMineUnitPrice,
  mineSizeLabel,
  parseMineWholeNumberInput,
  formatPrice,
} from "@/constants/gems-data";
import { useMineGems } from "@/context/mine-gems-context";

// Internationalization
import * as Localization from "expo-localization";
import { getLocales } from "expo-localization";

// --- Localization strings (add new as needed) ---
const LANGUAGES = {
  en: {
    totalGemsLabel: "Total Gems Value",
    copyTotal: "Copy total mining gems",
    copied: "Copied!",
    reset: "Reset",
    miningGemsCalculator: "Mining Gems Calculator",
    mineGems: "Gems Mining",
    deleteAll: "Delete all data mining gems?",
    areYouSure: "Are you sure you want to delete all?",
    cancel: "Cancel",
    delete: "Delete",
    max: (n: string) => `Max ${n}`,
    gems: "gems",
    gemsItem: "gems/item"
  },
  id: {
    totalGemsLabel: "Total Nilai Gems",
    copyTotal: "Salin total mining gems",
    copied: "Tersalin!",
    reset: "Reset",
    miningGemsCalculator: "Kalkulator Gems Hasil Mining",
    mineGems: "Gems Mining",
    deleteAll: "Hapus seluruh data mining gems?",
    areYouSure: "Anda yakin ingin menghapus semua?",
    cancel: "Batal",
    delete: "Hapus",
    max: (n: string) => `Maks ${n}`,
    gems: "gems",
    gemsItem: "/item"
  },
  // add more languages as needed
};

function getLocaleStrings() {
  const langCode = (getLocales()[0]?.languageCode ?? "en").toLowerCase() as keyof typeof LANGUAGES;
  return LANGUAGES[langCode] ?? LANGUAGES.en;
}

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

const GEM_IMAGE_BY_ID: Record<string, any> = {
  topaz: require("@/assets/images/topaz.png"),
  emerald: require("@/assets/images/emerald.png"),
  sapphire: require("@/assets/images/sapphire.png"),
  ruby: require("@/assets/images/ruby.png"),
  diamond: require("@/assets/images/diamond.png"),
};

const MAX_INPUT_PER_FIELD = 1000000;

function parseIntegerDigits(input: string): number {
  return parseMineWholeNumberInput(input);
}

function OverlimitModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalBackground}>
        <View style={modalStyles.modalContainer}>
          <Image
            source={require("@/assets/images/kucing.jpg")}
            style={modalStyles.catImage}
            resizeMode="cover"
          />
          <Text style={modalStyles.modalTitle}>Seriously bro?</Text>
          <Text style={modalStyles.modalText}>
            The maximum number of fish is 1,000,000 per type/size.
          </Text>
          <TouchableOpacity style={modalStyles.okButton} onPress={onClose} activeOpacity={0.86}>
            <Text style={modalStyles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function RateMineGemsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sizeBoxBasis = width < 520 ? "48%" : width < 900 ? "31%" : "18.5%";
  const { counts, setCount, reset } = useMineGems();
  const [copied, setCopied] = useState(false);

  const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({});
  const [invalidByKey, setInvalidByKey] = useState<Record<string, boolean>>({});
  const [showOverlimitModal, setShowOverlimitModal] = useState(false);

  const makeKey = (itemId: string, size: MineSize) => `${itemId}:${size}`;

  // --- Locale strings
  const t = getLocaleStrings();

  // Sinkronisasi qtyByKey dengan counts hanya jika data context berubah
  React.useEffect(() => {
    const nextInputs: Record<string, string> = {};
    for (const item of MINE_ITEMS) {
      for (const size of MINE_SIZES) {
        const key = makeKey(item.id, size);
        if (!(key in qtyByKey)) {
          nextInputs[key] = String(counts[item.id]?.[size] ?? 0);
        } else {
          nextInputs[key] = qtyByKey[key];
        }
      }
    }
    setQtyByKey(nextInputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts]);

  // Input change handler: update qtyByKey selalu, dan jika valid update counts juga, jika overlimit jangan.
  const setQtyFromInput = useCallback((itemId: string, size: MineSize, raw: string) => {
    const key = makeKey(itemId, size);
    setQtyByKey(prev => ({ ...prev, [key]: raw }));

    const n = parseIntegerDigits(raw);

    if (n > MAX_INPUT_PER_FIELD) {
      setInvalidByKey(prev => ({ ...prev, [key]: true }));
      setShowOverlimitModal(prevShow => {
        if (!invalidByKey[key]) {
          return true;
        }
        return prevShow;
      });
      return;
    } else {
      setInvalidByKey(prev => ({ ...prev, [key]: false }));
      setShowOverlimitModal(false);
      setCount(itemId, size, n);
    }
  }, [invalidByKey, setCount]);

  const onResetMiningGems = () => {
    setResetAlertVisible(true);
  };

  const [resetAlertVisible, setResetAlertVisible] = useState(false);

  const copyTotalGems = async () => {
    await Clipboard.setStringAsync(formatPrice(totalValue));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // TOTAL VALUE hitung dari context counts saja yang valid (<= MAX_INPUT_PER_FIELD)
  const totalValue = React.useMemo(() => {
    let total = 0;
    for (const item of MINE_ITEMS) {
      for (const size of MINE_SIZES) {
        const key = makeKey(item.id, size);
        const inputVal = qtyByKey[key];
        let n = 0;
        if (typeof inputVal !== "undefined" && inputVal.length > 0) {
          n = parseIntegerDigits(inputVal);
        } else {
          n = counts[item.id]?.[size] ?? 0;
        }
        const unit = getMineUnitPrice(item.id, item.baseGems, size);
        if (n > 0 && n <= MAX_INPUT_PER_FIELD) {
          total += n * unit;
        }
      }
    }
    return total;
  }, [counts, qtyByKey]);

  // Determine bg cover
  const backgroundImg = require("@/assets/images/background.jpg");

  return (
    <>
      <OverlimitModal visible={showOverlimitModal} onClose={() => setShowOverlimitModal(false)} />

      {/* Reset confirmation dialog */}
      <Modal
        visible={resetAlertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetAlertVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setResetAlertVisible(false)}>
          <View style={resetModalStyles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={resetModalStyles.centerContentWrap} pointerEvents="box-none">
          <View style={resetModalStyles.card}>
            <Text style={resetModalStyles.title}>
              {t.deleteAll}
            </Text>
            <Text style={resetModalStyles.desc}>
              {t.areYouSure}
            </Text>
            <View style={{ flexDirection: 'row', gap: 13, marginTop: 12 }}>
              <Pressable
                style={({ pressed }) => [
                  resetModalStyles.cancelBtn,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={() => setResetAlertVisible(false)}
              >
                <Text style={resetModalStyles.cancelBtnText}>{t.cancel}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  resetModalStyles.okBtn,
                  { opacity: pressed ? 0.87 : 1 },
                ]}
                onPress={() => {
                  reset();
                  const cleared: Record<string, string> = {};
                  for (const item of MINE_ITEMS) {
                    for (const size of MINE_SIZES) {
                      cleared[makeKey(item.id, size)] = "0";
                    }
                  }
                  setQtyByKey(cleared);
                  setInvalidByKey({});
                  setCopied(false);
                  setResetAlertVisible(false);
                }}
              >
                <Text style={resetModalStyles.okBtnText}>{t.delete}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
                  {t.mineGems}
                </Text>
                <Text style={[styles.headerSub, { color: "#fff" }]}>
                  {t.miningGemsCalculator}
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
              <Text style={[styles.resetLabel, { color: "#0ea5e9" }]}>{t.reset}</Text>
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
                    source={GEM_IMAGE_BY_ID[item.id]}
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
                    {item.label}
                  </Text>
                </View>

                <View style={styles.sizesRowWrap}>
                  {MINE_SIZES.map((size, idx) => {
                    const key = makeKey(item.id, size);
                    let inputVal = qtyByKey[key];
                    if (typeof inputVal === "undefined") {
                      const ctxVal = counts[item.id]?.[size];
                      inputVal = ctxVal && ctxVal > 0 ? String(ctxVal) : "0";
                    }
                    const n = inputVal.length > 0 ? parseIntegerDigits(inputVal) : 0;
                    const unit = getMineUnitPrice(item.id, item.baseGems, size);
                    // Perbaikan: tidak tampilkan subtotal jika > max, samakan dengan beranda.tsx
                    let subtotal = 0;
                    if (inputVal.length > 0) {
                      subtotal = n <= MAX_INPUT_PER_FIELD ? n * unit : 0;
                    }
                    const iconSource =
                      SIZE_ICON_MAP[item.id]?.[size] || DEFAULT_SIZE_ICONS[size];

                    const isInvalid = invalidByKey[key] ?? false;

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
                          {mineSizeLabel(size)}
                        </Text>
                        {/* Perbaikan: Hanya tampilkan format "x gems/item" tanpa ada duplikasi kata gems */}
                        <Text style={styles.unitPrice}>
                          {`${formatPrice(unit)}${t.gemsItem}`}
                        </Text>
                        <TextInput
                          value={inputVal}
                          onChangeText={(v) => setQtyFromInput(item.id, size, v)}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor="#94a3b8"
                          style={[
                            styles.qtyInput,
                            {
                              borderColor: isInvalid ? '#fb7185' : "#36bef7",
                              backgroundColor: "#f0f9ff",
                              color: "#334155",
                              fontWeight: "600",
                            },
                          ]}
                          inputMode="numeric"
                          maxLength={9}
                        />
                        {isInvalid && (
                          <Text style={styles.limitHint}>{t.max(formatPrice(MAX_INPUT_PER_FIELD))}</Text>
                        )}
                        <Text
                          style={[
                            styles.subtotal,
                            {
                              color: "#164e63",
                              fontWeight: "600",
                            },
                          ]}
                        >
                          {formatPrice(subtotal)}
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
              <Text style={styles.summaryLabel}>{t.totalGemsLabel}</Text>
              <Pressable
                onPress={copyTotalGems}
                style={({ pressed }) => [
                  styles.copyValuePressable,
                  { opacity: pressed ? 0.82 : 1 },
                ]}
                accessibilityLabel={t.copyTotal}
                android_ripple={{ color: "#0369A1" }}
              >
                <Text style={styles.summaryValueLarge}>
                  {formatPrice(totalValue)}
                </Text>
                <Image
                  source={require("@/assets/images/copy.png")}
                  style={[styles.copyIcon, { opacity: copied ? 1 : 0.85 }]}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
            {copied && (
              <Text style={styles.copiedHint}>{t.copied}</Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </>
  );
}

// --- styles remain unchanged below ---

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
    gap: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
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
  limitHint: {
    color: "#fb7185",
    fontSize: 12,
    marginTop: -1,
    marginBottom: 2,
    fontWeight: "500",
    letterSpacing: 0.01,
  },
});

const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(21,27,36,0.83)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 17,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 23,
    padding: 0,
    alignItems: "center",
    shadowColor: "#0284c7",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 18,
    minWidth: 290,
    width: 320,
    maxWidth: "95%",
    elevation: 8,
    overflow: "hidden",
  },
  catImage: {
    width: 200,
    height: 190,
    marginTop: 20,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    backgroundColor: "#e0e7ef",
  },
  modalTitle: {
    marginTop: 13,
    fontWeight: "800",
    fontSize: 22,
    color: "#0284c7",
    letterSpacing: 0.07,
    textAlign: "center",
    marginBottom: 2,
  },
  modalText: {
    textAlign: "center",
    color: "#334155",
    marginTop: 3,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 17,
    paddingHorizontal: 18,
    fontWeight: "500",
  },
  okButton: {
    backgroundColor: "#0891b2",
    borderRadius: 13,
    paddingVertical: 9,
    paddingHorizontal: 36,
    marginBottom: 18,
    marginTop: 4,
    elevation: 1,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  okButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.09,
  },
});

const resetModalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.37)",
  },
  centerContentWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    zIndex: 10,
  },
  card: {
    minWidth: 260,
    maxWidth: 370,
    backgroundColor: "#fff",
    borderRadius: 23,
    padding: 24,
    alignItems: "center",
    elevation: 9,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 11 },
    marginHorizontal: 24,
  },
  img: {
    width: 160,
    height: 140,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    marginBottom: 12,
    marginTop: 3,
  },
  title: {
    fontWeight: "800",
    fontSize: 18,
    color: "#0284c7",
    marginBottom: 8,
    textAlign: "center",
    marginTop: 0,
  },
  desc: {
    color: "#13203D",
    fontWeight: "500",
    fontSize: 14.5,
    marginBottom: 8,
    textAlign: "center",
    opacity: 0.88,
    marginTop: 2,
  },
  okBtn: {
    backgroundColor: "#bae6fd",
    borderRadius: 11,
    paddingVertical: 7.5,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0284c7",
  },
  okBtnText: {
    color: "#0284c7",
    fontWeight: "700",
    fontSize: 14.9,
    letterSpacing: 0.11,
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderRadius: 11,
    paddingVertical: 7.5,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#28b7dd",
  },
  cancelBtnText: {
    color: "#0284c7",
    fontWeight: "700",
    fontSize: 14.9,
    letterSpacing: 0.11,
  },
});