import { Articulo, articulos$ } from "@/state/articulos"
import { Condicion, condiciones$ } from "@/state/condiciones"
import { convertirALista } from "@/state/consultas"
import { useValue } from "@legendapp/state/react"
import { router } from "expo-router"
import { View, Text, Pressable } from "react-native"
import { elegirAleatorios } from "./DestacadosBox"
import { useMemo } from "react"


export default function ArticulosDestacados() {
    const articulosLista = convertirALista(useValue(articulos$))
    const condiciones = convertirALista(useValue(condiciones$))
    
    const matches = compararListas(condiciones, articulosLista)

    const articuloAleatorio = useMemo(() => {
    if (matches.length === 0) {
        return elegirAleatorios(articulosLista, 1)[0] ?? null;
    }
    return null;
    }, [matches.length, articulosLista]);

    const item = articuloAleatorio as Articulo | null;


    return (
         <View className="flex-row gap-6">
            {articulosLista.length === 0 && (
                <View className="mx-6 mb-8 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-8 items-center">
                    <Text className="text-neutral-500 text-sm text-center">
                        No hay articulos destacados
                    </Text>
                </View>
            )}

            {matches.length === 0 && item && (
            <Pressable 
                className="flex-col flex-1 justify-start rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm active:bg-white/80" 
                key={item?.id} 
                onPress={() => router.navigate({
                    pathname: '/articulos/[categoriaArt]/[articuloId]',
                    params: { categoriaArt: item?.categoria, articuloId: item?.id }
                })}>

                <Text className="text-alert-color">{item?.categoria}</Text>
                <Text className="text-2xl font-bold">{item?.titulo}</Text>
            </Pressable>
            )}

            {matches.map((m => {
                return (
                    <Pressable className="flex-col flex-1 justify-start rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm active:bg-white/80" key={m.id} onPress={() => router.navigate({
                            pathname: '/articulos/[categoriaArt]/[articuloId]',
                            params: {categoriaArt: m.categoria, articuloId: m.id}
                        })}>
                        <Text className="text-alert-color">{m?.categoria}</Text>
                        <Text className="text-2xl font-bold">{m?.titulo}</Text>
                    </Pressable>
                )
            }))}
        </View>
    )
}

function compararListas(condicionesLista: Condicion[], listaArticulos: Articulo[]) {

      const lowerCaseCondiciones = condicionesLista.map((condicion: Condicion) => condicion.nombre.toLowerCase())

      return listaArticulos.filter((articulo: Articulo) => {
        const lowerCaseArticulo = articulo.titulo.toLowerCase()

        return lowerCaseCondiciones.some(condicion => lowerCaseArticulo.includes(condicion))
      })
}

