import { articulo$, porCategoria } from "@/state/articulos"
import { useLocalSearchParams, router } from "expo-router"
import { View, Text, FlatList, Pressable } from "react-native"
import { useMemo } from "react"
import { useValue } from "@legendapp/state/react"
import { SafeAreaView } from "react-native-safe-area-context"
import TopBar from "@/features/topbar/TopBar"

export default function CategoriaListScreen() {
    const { categoriaArt } = useLocalSearchParams()

    const todos = useValue(articulo$)

    const articulos = useMemo(() => porCategoria(todos, categoriaArt as string), [todos, categoriaArt])

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-white">
                <TopBar name='Articulos' canGoBack={true}/>
            </SafeAreaView>
            
            <FlatList
                className="flex-1 bg-white"
                contentContainerClassName="px-5 py-4"
                data={articulos}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View className="pt-10 items-center">
                        <Text className="text-gray-400">Todavia no hay articulos en esta categoria.</Text>
                    </View>
                }
                renderItem={({item}) => (
                    <Pressable
                        onPress={() => router.navigate({
                            pathname: '/[categoriaArt]/[articuloId]',
                            params: {categoriaArt: categoriaArt as string, articuloId: item.id}
                        })}
                        className="border border-gray-200 rounded-2xl p-4 mb-3 bg-white">
                        <Text className="font-semibold text-base mb-1">{item.titulo}</Text>
                        <Text className="text-gray-400 text-sm" numberOfLines={2}>{item.sintomas}</Text>
                    </Pressable>
                )}
            />
        </View>
    )
}
