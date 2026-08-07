import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-2xl font-bold text-white">
        Expo SDK 54 + NativeWind
      </Text>
      <Text className="mt-2 text-slate-400">Tailwind is working</Text>
      <StatusBar style="light" />
    </View>
  );
}
