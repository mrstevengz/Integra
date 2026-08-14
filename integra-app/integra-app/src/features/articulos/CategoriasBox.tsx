import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons'
import { useValue } from "@legendapp/state/react";
import { articulo$, porCategoria, porId } from "@/state/articulos";

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type CategoriasBoxProps = {
    categoriaNombre: string;
    count: number
    icon: IconName
}

const CATEGORIAS: CategoriasBoxProps[] = [
    { categoriaNombre: "Diabetes", count: 0, icon: 'water-outline' },
    { categoriaNombre: "Hipertension", count: 0, icon: 'pulse-outline' },
    { categoriaNombre: "Nutricion", count: 0, icon: 'nutrition-outline' },
    { categoriaNombre: "Ejercicio", count: 0, icon: 'barbell-outline' },
    { categoriaNombre: "Medicamentos", count: 0, icon: 'medkit-outline' },
    { categoriaNombre: "Salud mental", count: 0, icon: 'happy-outline' },
    { categoriaNombre: "Cuidados", count: 0, icon: 'heart-outline' },
    { categoriaNombre: "Discapacidad", count: 0, icon: 'body-outline' },
]

function CategoriasBox({categoriaNombre, count, icon}: CategoriasBoxProps) {
    return (
        <Pressable
            onPress={() => {
                router.navigate({
                    pathname: '/[categoriaArt]',
                    params: {categoriaArt: `${categoriaNombre}`}
                })
            }}
            className="w-[48%] border border-gray-200 rounded-2xl p-4 bg-white mb-3 flex flex-row gap-3 items-center">
                <View className="border-2 border-slate-300 bg-slate-200 rounded-lg p-2">
                    <Ionicons name={icon} size={20}/>
                </View>
                <View>
                     <Text className="font-semibold text-base mb-1">{categoriaNombre}</Text>
                    <Text className="text-gray-400 text-sm">{count} articulos</Text>
                </View>
        </Pressable>
    )
}

export default function Categorias() {
    const articulos = useValue(articulo$)

    if (!articulos) {
        return (
            <View className="px-4 pt-4">
            <Text className="text-lg mb-2 font-semibold">CATEGORIAS</Text>
            <View className="flex-row flex-wrap justify-between">
                {CATEGORIAS.map((cat) => (
                    <CategoriasBox key={cat.categoriaNombre} count={0} categoriaNombre={cat.categoriaNombre} icon={cat.icon}/>
                ))}
            </View>   
        </View>
        )
    }

    return (
        <View className="px-4 pt-4">
            <Text className="text-lg mb-2 font-semibold">CATEGORIAS</Text>
            <View className="flex-row flex-wrap justify-between">
                {CATEGORIAS.map((cat) => (
                    <CategoriasBox key={cat.categoriaNombre} count={porCategoria(articulos, cat.categoriaNombre).length} categoriaNombre={cat.categoriaNombre} icon={cat.icon}/>
                ))}
            </View>
        </View>
    )
}
