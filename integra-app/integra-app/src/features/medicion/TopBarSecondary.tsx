import { router } from "expo-router";
import { Pressable, View, Text } from "react-native";

type TopBarSecondaryProps = {
  active: "registrar" | "historial";
};

export default function TopBarSecondary({ active }: TopBarSecondaryProps) {
  return (
    <View className="w-full bg-white flex-row border-b border-slate-200">
      <Pressable
        className={`flex-1 h-full p-4 items-center ${active === "registrar" ? "border-b-2 border-slate-800" : ""}`}
        onPress={() => router.replace("/medicion")}
      >
        <Text className={`text-lg ${active === "registrar" ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
          Registrar
        </Text>
      </Pressable>
      <Pressable
        className={`flex-1 h-full p-4 items-center ${active === "historial" ? "border-b-2 border-slate-800" : ""}`}
        onPress={() => router.replace("/medicion/historial")}
      >
        <Text className={`text-lg ${active === "historial" ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
          Historial
        </Text>
      </Pressable>
    </View>
  );
}
