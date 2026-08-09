import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

type CategoriasBoxProps = {
    categoriaNombre: string;
    count: number
}

const CATEGORIAS: CategoriasBoxProps[] = [
    { categoriaNombre: "Diabetes", count: 24 },
    { categoriaNombre: "Hipertension", count: 18 },
    { categoriaNombre: "Nutricion", count: 31 },
    { categoriaNombre: "Ejercicio", count: 15 },
    { categoriaNombre: "Medicamentos", count: 22 },
    { categoriaNombre: "Salud mental", count: 12 },
    { categoriaNombre: "Cuidados", count: 19 },
    { categoriaNombre: "Discapacidad", count: 8 },
]

function CategoriasBox({categoriaNombre, count}: CategoriasBoxProps) {
    return (
        <Pressable
            onPress={() => {
                router.navigate({
                    pathname: '/[categoriaArt]',
                    params: {categoriaArt: `${categoriaNombre}`}
                })
            }}
            className="w-[48%] border border-gray-200 rounded-2xl p-4 bg-white mb-3">
            <Text className="font-semibold text-base mb-1">{categoriaNombre}</Text>
            <Text className="text-gray-400 text-sm">{count} articulos</Text>
        </Pressable>
    )
}

export default function Categorias() {
    return (
        <View className="px-4 pt-4">
            <Text className="text-lg mb-2 font-semibold">CATEGORIAS</Text>
            <View className="flex-row flex-wrap justify-between">
                {CATEGORIAS.map((cat) => (
                    <CategoriasBox key={cat.categoriaNombre} {...cat}/>
                ))}
            </View>
        </View>
    )
}
