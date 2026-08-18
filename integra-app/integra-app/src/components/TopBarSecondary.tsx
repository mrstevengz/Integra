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
  //Si es la primera, se muestra con color de fondo y borde, si no, con color de fondo y borde opaco
  const primeraActiva = active === "Registrar" || active === "Tomas" || active === "Proximas"

  const tabs = [
    { texto: tab1, ruta: route1, esActiva: primeraActiva },
    { texto: tab2, ruta: route2, esActiva: !primeraActiva },
  ]

  return (
    <View className="bg-surface px-5 pt-1 pb-3">
        <View className="flex-row rounded-control bg-line-strong/30 p-1">
        {tabs.map((t) => (
          <Pressable
            key={t.texto}
            onPress={() => router.replace(t.ruta)}
            disabled={t.esActiva}
            accessibilityRole="tab"
            accessibilityState={{ selected: t.esActiva }}
            style={{ minHeight: 40 }}
            className={`flex-1 items-center justify-center rounded-lg ${
              t.esActiva ? "bg-surface-raised" : "active:opacity-60"
            }`}
          >
            <Text className={`text-label ${
              t.esActiva ? "font-bold text-content" : "font-medium text-content-muted"
            }`}>
              {t.texto}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}