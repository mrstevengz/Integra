import { router } from "expo-router";
import { Pressable, View, Text } from "react-native";

type TopBarSecondaryProps = {
  active: "Registrar" | "Historial" | "Tomas" | "Medicamentos" | "Proximas" | "Pasadas";
  tab1: string
  tab2: string
  route1: string
  route2: string
};

export default function TopBarSecondary({ active, tab1, tab2, route1, route2 }: TopBarSecondaryProps) {
  return (
    <View className="w-full bg-white flex-row border-b border-slate-200">
      <Pressable
        className={`flex-1 h-full p-4 items-center ${(active === "Registrar" || active === "Tomas" || active === "Proximas") ? "border-b-2 border-slate-800" : ""}`}
        onPress={() => router.replace(route1)}
      >
        <Text className={`text-lg ${active === "Registrar" || active === "Tomas" || active === "Proximas" ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
          {tab1}
        </Text>
      </Pressable>
      <Pressable
        className={`flex-1 h-full p-4 items-center ${(active === "Historial" || active === "Medicamentos" || active === "Pasadas") ? "border-b-2 border-slate-800" : ""}`}
        onPress={() => router.replace(route2)}
      >
        <Text className={`text-lg ${active === "Historial" || active === "Medicamentos" || active === "Pasadas" ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
          {tab2}
        </Text>
      </Pressable>
    </View>
  );
}
