import { Stack } from "expo-router";

export default function LocationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "rgba(48, 50, 66, 0.95)",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "BRANCHES",
        }}
      />
    </Stack>
  );
}