import { Text, View, ScrollView, Pressable } from "react-native";
import TopBar from "@/features/topbar/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { tiposOrdenados, tipoMedicion$ } from "@/state/medicion";
import { useValue } from "@legendapp/state/react";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import TopBarSecondary from "@/features/medicion/TopBarSecondary";

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function getIconForMedicion(nombre: string): IconName {
  const n = nombre.toLowerCase();

  if (n.includes('peso')) return 'scale-outline';
  if (n.includes('presion') || n.includes('presión') || n.includes('tension') || n.includes('tensión')) return 'heart-outline';
  if (n.includes('frecuencia') || n.includes('pulso') || n.includes('ritmo')) return 'pulse-outline';
  if (n.includes('glucosa') || n.includes('azucar') || n.includes('azúcar')) return 'water-outline';
  if (n.includes('temperatura')) return 'thermometer-outline';
  if (n.includes('oxigeno') || n.includes('oxígeno') || n.includes('saturacion') || n.includes('saturación') || n.includes('spo2')) return 'fitness-outline';
  if (n.includes('talla') || n.includes('altura') || n.includes('imc')) return 'body-outline';

  return 'medical-outline';
}

export default function MedicionScreen() {

  const mediciones = tiposOrdenados(useValue(tipoMedicion$))

  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Medicion' canGoBack={false}/>
        </SafeAreaView>
        <ScrollView className="flex-1">

          <TopBarSecondary active="Registrar" tab1="Registrar" tab2="Historial" route1="/medicion" route2="/medicion/historial"/>

          <Text className="p-6 text-lg text-slate-600">¿Que deseas registrar?</Text>

          <View className="flex-1 flex-row flex-wrap items-start justify-center gap-4">
            {mediciones.map((medicion) => (
                <Pressable
                key={medicion.id}
                onPress={() => {
                  router.navigate({
                    pathname: '/medicion/[medicionTipo]',
                    params: { medicionTipo: medicion.id }
                  })
                }}
                className="flex w-[45%] flex-col items-start gap-2 p-4 bg-white rounded-xl border border-slate-300">
                <View className="p-2 rounded-lg bg-slate-200 border-slate-300 border">
                  <Ionicons name={getIconForMedicion(medicion.nombre)} size={20} color={"#475569"} />
                </View>
                <View>
                  <Text className="font-semibold text-base">{medicion.nombre}</Text>
                  <Text className="text-gray-400 text-sm">{medicion.unidad}</Text>
                </View>
              </Pressable>

            ))}
          </View>
        </ScrollView>
    </View>
  );
}
