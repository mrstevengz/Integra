import { router } from "expo-router";
import { View,ScrollView, Text, Pressable } from "react-native";
import { useMemo } from "react";
import { useValue } from "@legendapp/state/react";
import { articulo$, type Articulo } from "@/state/articulos";



//Metodo Fisher-Yates
export function elegirAleatorios(articulos: Articulo[], cantidad: number) {
    const copia = [...articulos];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, cantidad);
}

type DestacadoCardProps = {
    categoriaNombre: string;
    articuloId: string;
    titulo: string;
}

function DestacadoCard({ categoriaNombre, articuloId, titulo }: DestacadoCardProps) {
    return (
        <Pressable
            onPress={() => {
                router.navigate({
                    pathname: '/articulos/[categoriaArt]/[articuloId]',
                    params: { categoriaArt: categoriaNombre, articuloId }
                })
            }}
            className="w-72 border border-gray-200 rounded-2xl p-4 bg-white mr-3">
            <Text className="font-semibold text-base mb-1">{categoriaNombre}</Text>
            <Text className="font-bold text-md">{titulo}</Text>
        </Pressable>
    )
}

export default function Destacados() {
    const articulos = Object.values(useValue(articulo$) ?? {});

    const idsKey = articulos.map((a) => a.id).join(",");

    const destacados = useMemo(
        () => elegirAleatorios(articulos, 3), //3 es el numero de articulos destacados que se quiere
        [idsKey]
    );

    if (destacados.length === 0) return null;

    return (
        <View className="px-4 pt-4">
            <Text className="text-lg mb-2 font-semibold">DESTACADOS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} indicatorStyle="black" contentContainerClassName="pb-2">
                {destacados.map((articulo) => (
                    <DestacadoCard
                        key={articulo.id}
                        categoriaNombre={articulo.categoria}
                        articuloId={articulo.id}
                        titulo={articulo.titulo}
                    />
                ))}
            </ScrollView>
        </View>
    )
}
