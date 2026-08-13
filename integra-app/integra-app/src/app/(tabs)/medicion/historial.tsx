import TopBarSecondary from "@/features/medicion/TopBarSecondary";
import TopBar from "@/features/topbar/TopBar";
import { porId } from "@/state/helpers";
import { medicion$, medicionesOrdenadas, tipoMedicion$ } from "@/state/medicion";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { labelHelper } from "./[medicionTipo]/[resultadoMedicion]";

export default function HistorialMediciones() {
    const perfil = useValue(perfil$)
    const mediciones = useValue(medicion$)
    const tipos = useValue(tipoMedicion$)
    
    const medicionesHistorial = medicionesOrdenadas(mediciones, perfil.id)

    return (
         <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Historial' canGoBack={false}/>
            </SafeAreaView>
            
            <TopBarSecondary active="historial"/>

            <ScrollView className="flex-grow" contentContainerStyle={{ paddingTop: 5, paddingBottom: 100 }}>
                    {medicionesHistorial.map((m) => {
                        const t = porId(tipos, m.tipo_medicion_id)
                        const medidoEn = new Date(m.medido_en)

                        return (
                            <View key={m.id} className="p-6 justify-between flex flex-row items-center border-b border-slate-400">
                                <View>
                                    <Text className="text-md font-semibold">{t?.nombre}</Text>
                                    <Text className="text-sm text-slate-500">{medidoEn.toDateString().slice(4, 10)} ⋅ {medidoEn.toTimeString().slice(0,5)} {labelHelper(m.contexto)}</Text>
                                </View>
                                
                                <Text className="text-lg font-bold">{m.valor} {m.valor_secundario && `/ ${m.valor_secundario}`} {t?.unidad} </Text>
                            </View>
                        )
            })}
                </ScrollView>
        </View>
    )
}