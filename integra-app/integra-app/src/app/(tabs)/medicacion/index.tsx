import { View, Text, FlatList, Pressable, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { useValue } from "@legendapp/state/react"
import TopBar from "@/features/topbar/TopBar"
import { medicamento$, horario$, medicamentosActivos, horariosDe, formatearHora } from "@/state/medicacion"

export default function MedicacionScreen() {
    const medicamentos = useValue(medicamento$)
    const horarios = useValue(horario$)
    const lista = medicamentosActivos(medicamentos)

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Medicacion' canGoBack={false}/>
                <Pressable></Pressable>
            </SafeAreaView>

            <ScrollView contentContainerClassName="flex-grow">
              {lista.map((item) => (
                <View>
                    <Text className="font-semibold text-base">
                      {item.nombre} {item.dosis} {item.unidad}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      {horariosDe(horarios, item.id).map((h) => formatearHora(h.hora)).join(' · ') || 'Sin horarios'}
                    </Text>
                </View>
                
              ))}
            <Pressable
                onPress={() => router.navigate('/medicacion/agregar-medicamento')}
                className="bg-black py-4 rounded-lg mx-5 mb-6"
            >
                <Text className="text-white text-center">+ Agregar medicamento</Text>
            </Pressable>
            </ScrollView>
        </View>
    )
}