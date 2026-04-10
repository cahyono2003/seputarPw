import React, { useRef, useEffect } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  ImageBackground,
} from "react-native";

const PANEL_WIDTH = 330;

type DrawerRoute =
  | "/(tabs)"
  | "/(tabs)/rateFish"
  | "/(tabs)/rateMineGems"
  | "/(tabs)/beranda";

// All navigation items
const MENU_ITEMS: Array<{
  key: string;
  title: string;
  sub: string;
  icon: any;
  route: DrawerRoute;
  bg: string;
  color: string;
}> = [
  {
    key: "beranda",
    title: "Fish Gems",
    sub: "Count Fish Gems",
    icon: require("@/assets/images/gemsicon.png"),
    route: "/(tabs)/beranda",
    bg: "#f0fdfa",
    color: "#0ea5e9",
  },
  {
    key: "minegems",
    title: "Mine Gems",
    sub: "Count Mining Gems",
    icon: require("@/assets/images/mininggems.png"),
    route: "/(tabs)/rateMineGems",
    bg: "#f0f9ff",
    color: "#38bdf8",
  },
  {
    key: "ratefish",
    title: "Rate Fish",
    sub: "Count bytes from rate + gems",
    icon: require("@/assets/images/byteicon.png"),
    route: "/(tabs)/rateFish",
    bg: "#f8fafc",
    color: "#0ea5e9",
  },
];

export default function RateByteScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const theme = Colors[colorScheme === "light" ? "light" : "light"];
  const slideX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideX.setValue(0);
  }, [slideX]);

  const close = () => {
    Animated.timing(slideX, {
      toValue: -PANEL_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) router.back();
    });
  };

  const go = (path: DrawerRoute) => {
    if (path === "/(tabs)") {
      router.replace(path as never);
      return;
    }
    router.push(path as never);
  };

  // optionally: bring background image like in rateFish
  const backgroundImg = require("@/assets/images/background.jpg");

  return (
    <ImageBackground
      source={backgroundImg}
      resizeMode="cover"
      style={[styles.bg, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      imageStyle={{
        opacity: colorScheme === "light" ? 0.9 : 0.985,
      }}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(10,32,50,0.35)" }}>
        <Pressable style={styles.backdrop} onPress={close} />

        <Animated.View
          style={[
            styles.panel,
            {
              left: 0,
              position: "absolute",
              top: 0,
              bottom: 0,
              shadowColor: "#020617",
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          {/* HEADER */}
          <View
            style={[
              styles.panelHeader,
              {
                borderBottomColor: "rgba(30,58,138,0.13)",
                backgroundColor:
                  colorScheme === "light"
                    ? "rgba(245,250,255,0.96)"
                    : "rgba(21,36,59,0.985)",
                marginHorizontal: -18,
                paddingHorizontal: 20,
                borderBottomWidth: Platform.OS === "web" ? 1 : StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View style={styles.headerLeft}>
              <Image
                source={require("@/assets/images/hamburger.png")}
                style={styles.menuIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: "#0284C7",
                    textShadowColor: "rgba(0,109,179,0.11)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  },
                ]}
              >
                Menu
              </Text>
            </View>
            <Pressable onPress={close} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* MENU LIST */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => go(item.route)}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: item.bg,
                    borderColor: colorScheme === "light" ? "#bae6fd" : "#0284c7",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.menuRow}>
                  <Image
                    source={item.icon}
                    style={{
                      width: 32,
                      height: 32,
                      marginRight: 14,
                      tintColor: undefined,
                    }}
                  />
                  <View>
                    <Text style={[styles.menuTitle, { color: item.color }]}>{item.title}</Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    minHeight: "100%",
    width: "100%",
  },
  backdrop: {
    flex: 1,
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: "rgba(250,253,255,0.96)",
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 9,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 2,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingTop: 24,
    paddingBottom: 16,
    marginBottom: 6,
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
    letterSpacing: 0.11,
    marginLeft: 2,
  },
  menuIcon: {
    width: 27,
    height: 27,
    tintColor: "#0ea5e9",
    marginRight: 4,
  },
  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 99,
  },
  closeText: {
    color: "#0284C7",
    fontSize: 22,
    fontWeight: "700",
    opacity: 0.86,
  },
  menuList: {
    gap: 16,
    marginTop: 14,
  },
  menuItem: {
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "column",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.13,
  },
  menuSub: {
    color: "#334155",
    fontSize: 13,
    opacity: 0.85,
    fontWeight: "500",
    letterSpacing: 0.11,
  },
});
