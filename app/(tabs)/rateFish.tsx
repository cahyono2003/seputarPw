import React, { useEffect, useMemo, useState } from "react";
import { useRate } from "@/context/rate-context";
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
  Platform,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseWholeNumberInput } from "@/constants/fish-data";

// Util functions (same as before)
function parseNonNegativeNumber(input: string): number {
  const normalized = input.replace(',', '.');
  const n = Number(normalized);
  if (!isFinite(n) || n < 0) return 0;
  return n;
}
function parseIntegerDigits(input: string): number {
  return parseWholeNumberInput(input);
}
function formatThousands(value: number): string {
  return value.toLocaleString("id-ID");
}

export default function RateFishScreen() {
  const { byteRate, setByteRate } = useRate();
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Initial input values are empty
  const [rateInput, setRateInput] = useState("");
  const [totalGemsInput, setTotalGemsInput] = useState("");

  const parsedRate = useMemo(() => parseNonNegativeNumber(rateInput), [rateInput]);
  const parsedTotalGems = useMemo(() => parseIntegerDigits(totalGemsInput), [totalGemsInput]);

  useEffect(() => {
    setByteRate(parsedRate || 0);
  }, [parsedRate, setByteRate]);

  const byteCoins = useMemo(() => {
    // Formula: byte = (total gems / 1000) × rate
    return ((parsedTotalGems / 1000) * byteRate) || 0;
  }, [byteRate, parsedTotalGems]);

  const onChangeTotalGems = (value: string) => {
    const n = parseIntegerDigits(value);
    // Keep digits-only text to prevent locale translation changing separators.
    setTotalGemsInput(n === 0 ? "" : String(n));
  };

  // Use background image like rateMineGems
  const backgroundImg = require("@/assets/images/background.jpg");
  const gemsIcon = require("@/assets/images/gemsicon.png");
  const byteIcon = require("@/assets/images/byteicon.png");

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
                Rate Fish
              </Text>
              <Text style={[styles.headerSub, { color: "#fff" }]}>
                Convert gems to byte coins
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 32,
              maxWidth: width < 920 ? undefined : 850,
              alignSelf: "center",
              width: "100%",
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* RATE BYTE INPUT */}
          <View
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
              {/* Icon before label */}
              <Image source={byteIcon} style={[styles.iconImage]}  />
              <Text style={[styles.inputTitle, { color: "#0ea5e9" }]}>
                Rate Byte
              </Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                value={rateInput}
                onChangeText={setRateInput}
                keyboardType="numeric"
                placeholder="Enter rate gems"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.input,
                  {
                    borderColor: colorScheme === "light" ? "#374151" : "#D1D5DB",
                    color: "#0369a1",
                  },
                ]}
              />
            </View>
          </View>

          {/* GEMS INPUT */}
          <View
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
              {/* Icon before label */}
              <Image source={gemsIcon} style={[styles.iconImage]} />
              <Text style={[styles.inputTitle, { color: "#38bdf8" }]}>
                Total Gems
              </Text>
            </View>
            <TextInput
              value={totalGemsInput}
              onChangeText={onChangeTotalGems}
              onChange={(e) => {
                const raw = e.nativeEvent?.text ?? "";
                onChangeTotalGems(raw);
              }}
              keyboardType="number-pad"
              placeholder="Enter your total gems"
              placeholderTextColor="#9CA3AF"
              style={[
                styles.totalGemsInput,
                {
                  borderColor: colorScheme === "light" ? "#374151" : "#D1D5DB",
                  color: "#0369a1",
                },
              ]}
            />
          </View>

          {/* RESULT */}
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: colorScheme === "light"
                  ? "#0ea5e9"
                  : "#0284c7",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
              {/* ICON BYTE AS CIRCLE */}
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                  borderWidth: 2,
                  borderColor: "rgba(30, 64, 175, 0.16)",
                  shadowColor: "#0ea5e9",
                  shadowOpacity: 0.08,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Image
                  source={byteIcon}
                  style={{ width: 40, height: 40}}
                />
              </View>
              <Text style={styles.resultValue}>
                {formatThousands(Math.round(byteCoins))}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              {/* BYTE COINS TITLE WITH ICON */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                <Image
                  source={byteIcon}
                  style={{ width: 24, height: 24 }}
                />
                <Text style={styles.resultLabel}>BYTE COINS</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: 22,
    height: 22,
    tintColor: "#0ea5e9",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 9,
  },
  iconImage: {
    width: 28,
    height: 28,
    // Tint color will be set inline for different icons
  },
  inputTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#f0f9ff",
    marginRight: 4,
  },
  suffix: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  totalGemsInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 30,
    fontWeight: "800",
    backgroundColor: "#f0f9ff",
    letterSpacing: 0.3,
    color: "#0369a1",
  },
  resultCard: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  resultLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
    letterSpacing: 0.14,
    textAlign: "right",
  },
  resultValue: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 0.32,
    textShadowColor: "#0ea5e9",
    textShadowRadius: 9,
    textShadowOffset: { width: 1, height: 2 },
    marginRight: 5,
  },
  resultIcon: {
    width: 26,
    height: 26,
    marginRight: 7,
    tintColor: "#fff",
  },
  resultHint: {
    color: "#bbf7fe",
    marginTop: 4,
    fontSize: 13,
    opacity: 0.87,
    fontWeight: "400",
    letterSpacing: 0.06,
    textAlign: "right",
  },
});
