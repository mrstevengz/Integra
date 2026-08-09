
import { useLocalSearchParams } from "expo-router"
import { articulo$ } from "@/state/articulos"
import { porId } from "@/state/articulos"
import { View, Text, ScrollView } from "react-native"
import { useValue } from "@legendapp/state/react"
import { SafeAreaView } from "react-native-safe-area-context"
import TopBar from "@/features/topbar/TopBar"

export default function ArticuloScreen() {
    const {articuloId } = useLocalSearchParams()
    const todos = useValue(articulo$)

    const articulo = porId(todos, articuloId as string)


    if (!articulo) {
        return (
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-gray-400">Articulo no encontrado.</Text>
            </View>
        )
    }

    return (
        <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-white">
            <TopBar name='Articulos' canGoBack={true}/>
        </SafeAreaView>
        
        <ScrollView className="flex-1 bg-white" contentContainerClassName="px-5 py-6">
            <View className="flex-row gap-2 mb-4">
                <View className="border border-gray-300 rounded-full px-3 py-1">
                    <Text className="text-xs text-gray-600">{articulo.categoria}</Text>
                </View>
                <View className="border border-gray-300 rounded-full px-3 py-1">
                    <Text className="text-xs text-gray-600">4 min de lectura</Text>
                </View>
            </View>

            <Text className="text-2xl font-bold mb-1">{articulo.titulo}</Text>
            <Text className="text-xs text-gray-400 mb-6">Revisado por equipo medico. Ultima actualizacion {articulo.updated_at?.slice(0,10)}</Text>

            <Text className="text-lg font-semibold mb-2">Sintomas a vigilar</Text>
            <Text className="text-base text-gray-700 leading-6 mb-6">{articulo.sintomas}</Text>

            <Text className="text-lg font-semibold mb-2">Tratamiento</Text>
            <Text className="text-base text-gray-700 leading-6 mb-6">{articulo.tratamientos}</Text>

            <Text className="text-lg font-semibold mb-2">Cuidados</Text>
            <Text className="text-base text-gray-700 leading-6 mb-6">{articulo.cuidados}</Text>
        </ScrollView>
        </View>
    )
}
