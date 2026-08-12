import { View, Text, Pressable, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useFocusEffect } from "expo-router"
import { useValue } from "@legendapp/state/react"
import TopBar from "@/features/topbar/TopBar"
import { medicamento$, medicamentosActivos, horariosOrdenados, formatearHora, resumenDias, tomasDelDia, toma$, agruparPorHora } from "@/state/medicacion"
import { useCallback, useEffect } from "react"
import { perfil$ } from "@/state/usuario"
import { generarTomasPendientes } from "@/features/medicacion/generar-tomas"
import { colorEstado, etiquetaEstado } from "@/features/medicacion/estados"
import { porId } from "@/state/helpers"
import { GrupoDelDia } from "@/features/medicacion/MedicinasDia"

export default function MedicacionScreen() {
    const perfil = useValue(perfil$)

    const medicamentos = useValue(medicamento$)

    const tomas = useValue(toma$)

    const lista = medicamentosActivos(medicamentos, perfil?.id)

    const hoy = tomasDelDia(tomas, new Date(), perfil?.id)

    const grupos = agruparPorHora(hoy)

    console.log(hoy)

    const sincronizados = lista.filter((m) => m.created_at).length

    useFocusEffect(
        useCallback(() => {
        if (!perfil?.id) return
        const n = generarTomasPendientes(perfil.id)
        if (n > 0) console.log(`tomas generadas ${n}`)
    }, [perfil?.id])
    )

    useEffect(() => {
        if (!perfil?.id) return
        generarTomasPendientes(perfil.id)
    }, [perfil?.id, sincronizados])

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Medicacion' canGoBack={false}/>
            </SafeAreaView>

            <ScrollView
                className="flex-1 bg-white"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
            >
                <Text className="text-lg font-semibold text-slate-900 mb-3">Hoy</Text>

                {hoy.length === 0 ? (
                    <Text className="text-gray-400 text-sm mb-6">
                        No hay dosis programadas para hoy.
                    </Text>
                ) : (
                    <View className="mb-6">
                    {grupos.length === 0 ? (
                    <Text className="text-gray-400 text-sm mb-6">
                        No hay dosis programadas para hoy.
                    </Text>
                ) : (
                    <View className="mb-6">
                        {grupos.map((g) => (
                            <GrupoDelDia key={g.hora} grupo={g} medicamentos={medicamentos} />
                        ))}
                    </View>
                )}
                    </View>
                )}

                <Text className="text-lg font-semibold text-slate-900 mb-3">Mis medicamentos</Text>

                {lista.length === 0 && (
                    <Text className="text-gray-400 text-sm">
                        Todavia no has agregado medicamentos.
                    </Text>
                )}

                {lista.map((item) => (
                    <View key={item.id} className="border border-gray-200 rounded-2xl p-4 mb-3">
                        <Text className="font-semibold text-base text-slate-900">
                            {item.nombre} {item.dosis} {item.unidad}
                        </Text>

                        <Text className="text-gray-400 text-sm mb-2">
                            {item.forma}
                            {item.con_alimentos ? ` · ${item.con_alimentos} alimentos` : ''}
                        </Text>

                        {horariosOrdenados(item).length === 0 ? (
                            <Text className="text-gray-400 text-sm">Sin horarios</Text>
                        ) : (
                            horariosOrdenados(item).map((h) => (
                                <Text key={h.id} className="text-gray-500 text-sm">
                                    {formatearHora(h.hora)} · {resumenDias(h.dias)}
                                </Text>
                            ))
                        )}

                        {item.indicaciones && (
                            <Text className="text-gray-400 text-xs mt-2 italic">
                                {item.indicaciones}
                            </Text>
                        )}
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

