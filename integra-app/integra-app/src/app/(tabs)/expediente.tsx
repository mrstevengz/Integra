import { auth$, cerrarSesion } from "@/state/auth";
import { useValue } from "@legendapp/state/react";
import { Text, View, ScrollView, Pressable } from "react-native";

export default function ExpedienteScreen() {
  const session = useValue(auth$.session)
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-slate-900">Expediente</Text>
        <Text className="text-2xl font-bold text-slate-900">{session?.user.email}</Text>

        <Pressable onPress={cerrarSesion} className="border border-red-300 rounded-lg py-3 items-center">
          <Text>Cerrar sesion</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}