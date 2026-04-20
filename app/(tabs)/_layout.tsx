import React from "react";
import { Stack } from "expo-router";

import { RateProvider } from "@/context/rate-context";
import { FishProvider } from "@/context/fish-context";
import { MineGemsProvider } from "@/context/mine-gems-context";

export default function TabLayout() {
  return (
    <RateProvider>
      <FishProvider>
        <MineGemsProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="beranda" />
            <Stack.Screen
              name="rateByte"
              options={{
                presentation: "transparentModal",
                animation: "none",
                contentStyle: { backgroundColor: "transparent" },
              }}
            />
            <Stack.Screen name="rateFish" />
            <Stack.Screen name="rateMineGems" />
          </Stack>
        </MineGemsProvider>
      </FishProvider>
    </RateProvider>
  );
}
