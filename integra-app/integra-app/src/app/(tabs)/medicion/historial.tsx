import TopBarSecondary from "@/components/TopBarSecondary";
import TopBar from "@/components/TopBar";
import { retornarObjetoPorId } from "@/state/helpers";
import { medicion$, medicionesOrdenadas, tipoMedicion$ } from "@/state/medicion";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { labelHelper } from "./agregar/[medicionTipo]/[resultadoMedicion]";
import { router } from "expo-router";
import { formatearFechaAString, formatearHoraAString } from "@/state/medicacion";

export default function HistorialMediciones() {
    const perfil = useValue(perfil$)
    const mediciones = useValue(medicion$)
    const tipos = useValue(tipoMedicion$)
    
    const medicionesHistorial = medicionesOrdenadas(mediciones, perfil.id)

    return (
         <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Medicion' canGoBack={false}/>
            </SafeAreaView>
            
            <TopBarSecondary active="Historial" tab1="Registrar" tab2="Historial" route1="/medicion" route2="/medicion/historial"/>

            <ScrollView className="flex-grow" contentContainerStyle={{paddingBottom: 100 }}>

                    {medicionesHistorial.length === 0 && (
                    <View className="mx-6 mb-8 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-8 items-center">
                        <Text className="text-neutral-500 text-sm text-center">
                            No hay historial de mediciones.
                        </Text>
                    </View>
                    )}

                    {medicionesHistorial.map((m) => {
                        const t = retornarObjetoPorId(tipos, m.tipo_medicion_id)
                        const medidoEn = new Date(m.medido_en)

                        return (
                            <Pressable key={m.id} className="p-6 justify-between flex flex-row items-center border-b border-slate-400 bg-bg-color"
                            onPress={() => router.navigate({
                                pathname: '/medicion/[medicionId]',
                                params: {medicionId: m.id}
                            })}
                            >
                                <View>
                                    <Text className="text-md font-semibold">{t?.nombre}</Text>
                                    <Text className="text-sm text-slate-500">{formatearFechaAString(medidoEn)} ⋅ {formatearHoraAString(medidoEn.toLocaleTimeString())} {labelHelper(m.contexto)}</Text>
                                </View>
                                
                                <Text className="text-lg font-bold">{m.valor} {m.valor_secundario && `/ ${m.valor_secundario}`} {t?.unidad} </Text>
                            </Pressable>
                        )
            })}
                </ScrollView>
        </View>
    )
}