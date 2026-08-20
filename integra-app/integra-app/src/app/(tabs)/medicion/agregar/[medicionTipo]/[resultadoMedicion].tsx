import { retornarObjetoPorId } from "@/state/helpers";
import { medicion$, tipoMedicion$, esDoble } from "@/state/medicion";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useValue } from "@legendapp/state/react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultadoMedicion() {
    const {resultadoMedicion} = useLocalSearchParams()
    const mediciones = useValue(medicion$)
    const tipos = useValue(tipoMedicion$)

    const medicion = retornarObjetoPorId(mediciones, resultadoMedicion as string)
    const tipo = retornarObjetoPorId(tipos, medicion?.tipo_medicion_id ?? "")

     if (!medicion) {
            return (
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-gray-400">Error</Text>
                </View>
            )
        }

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">

                {/* //Codigo del TopBar, se implementa para navegar a la ruta deseada (de momento) */}
                <View className="relative flex-row items-center justify-center py-4 px-4 bg-slate-100 border-b border-black/10">
                    <Pressable
                        onPress={() => router.navigate("/medicion/historial")}
                        hitSlop={8}
                        className="absolute left-4 h-9 w-9 items-center justify-center rounded-full active:bg-black/5">
                        <Text className="text-2xl leading-none">‹</Text>
                    </Pressable>

                    <Text className="text-xl font-bold px-12" numberOfLines={1}>
                        Resultado
                    </Text>
                </View>

            </SafeAreaView>
            <View className="flex flex-col items-center mt-8 gap-4 px-6">

                <View className="w-24 h-24 rounded-full border-2 items-center justify-center border-slate-500 mb-4">
                    <Ionicons name="checkmark-outline" size={40} color={"#64748b"}/>
                </View>

                <Text className="text-3xl font-bold">Medicion registrada</Text>

                <Text className="text-md color-slate-600">{`Hoy, ${medicion.medido_en.toDateString()} ⋅ ${medicion.medido_en.toTimeString().slice(0,8)}`} {labelHelper(medicion.contexto)}</Text>

                <View className="items-center justify-center border border-slate-500 bg-white w-full rounded-xl py-4 mt-4">
                    <Text className="text-slate-500">{tipo?.nombre.toUpperCase()}</Text>
                    <Text className="text-slate-900 font-bold text-[80px] mt-6">
                        {tipo && esDoble(tipo) ? `${medicion.valor} / ${medicion.valor_secundario ?? '-'}` : medicion.valor}
                    </Text>
                    <Text className="text-slate-600 text-2xl">{tipo?.unidad}</Text>
                </View>




                {/* //Valores de referencia view */}
            <View className="justify-between bg-slate-200/80 w-full gap-2 rounded-xl p-2">
                <Text className="font-bold p-3">Valores de referencia</Text>
                <View className="flex-row p-3 justify-between border-b border-slate-400">
                    <Text>Bajo</Text>
                    <Text>{tipo && esDoble(tipo)
                        ? `< ${tipo?.rango_min}/${tipo?.rango_min_secundario} ${tipo?.unidad}`
                        : `< ${tipo?.rango_min} ${tipo?.unidad}`}</Text>
                </View>
                    
                <View className="flex-row p-3 justify-between border-b border-slate-400">
                    <Text>Normal</Text>
                    <Text>{tipo && esDoble(tipo)
                        ? `${tipo?.rango_min}-${tipo?.rango_max} / ${tipo?.rango_min_secundario}-${tipo?.rango_max_secundario} ${tipo?.unidad}`
                        : `${tipo?.rango_min}-${tipo?.rango_max} ${tipo?.unidad}`}</Text>
                </View>
                    
                <View className="flex-row p-3 justify-between">
                    <Text>Alto</Text>
                    <Text>{tipo && esDoble(tipo)
                        ? `> ${tipo?.rango_max}/${tipo?.rango_max_secundario} ${tipo?.unidad}`
                        : `> ${tipo?.rango_max} ${tipo?.unidad}`}</Text>
                </View>
            </View>


                <View className="flex-row gap-4 flex">
                    <Pressable className="p-4 border rounded-xl">
                        <Text>Ver evolucion</Text>
                    </Pressable>

                    <Pressable className="p-4 border rounded-xl">
                        <Text>Editar</Text>
                    </Pressable>
                </View>
                
            </View>
        </View>
    )
}

export function labelHelper(contexto: string | null) {
    if (contexto === null) return ''
    if (contexto === 'en_ayunas') return '⋅ En ayunas'
    if (contexto === 'despues_comer') return '⋅ Despues de comer'
    if (contexto === 'antes_dormir') return '⋅ Antes de dormir'
    if (contexto === 'en_reposo') return '⋅ En reposo'
    if (contexto === 'despues_ejercicio') return '⋅ Despues de ejercicio'
    if (contexto === 'otro') return ''

    return ''
}
