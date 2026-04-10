import React from "react";
import { Stack } from "expo-router";

import { RateProvider } from "@/context/rate-context";
import { FishProvider } from "@/context/fish-context";

export default function TabLayout() {
  return (
    <RateProvider>
      <FishProvider>
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
      </FishProvider>
    </RateProvider>
  );
}
