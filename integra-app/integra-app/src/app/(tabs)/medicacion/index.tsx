import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native"
import { syncState } from "@legendapp/state"
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useFocusEffect } from "expo-router"
import { useValue } from "@legendapp/state/react"
import TopBar from "@/components/TopBar"
import { medicamento$, medicamentosActivos, tomasDelDia, toma$, agruparPorHora } from "@/state/medicacion"
import { useCallback, useEffect } from "react"
import { perfil$ } from "@/state/usuario"
import { generarTomasPendientes } from "@/features/medicacion/generar-tomas"
import {TomasDelDia} from "@/features/medicacion/TomasDelDia"
import TopBarSecondary from "@/components/TopBarSecondary"
import { GlassView } from "expo-glass-effect"

export default function MedicacionScreen() {
    const perfil = useValue(perfil$)

    const medicamentos = useValue(medicamento$)

    const tomas = useValue(toma$)

    //Lista de medicamentos activos
    const lista = medicamentosActivos(medicamentos, perfil?.id)

    //Tomas de hoy
    const hoy = tomasDelDia(tomas, new Date(), perfil?.id)

    //Todas las Tomas sin resolver (no especifica al grupo)
    const sinResolver = hoy.filter(
        (t) => t.estado === 'pendiente' || t.estado === 'pospuesta'
    )

    //Las tomas se agrupan por hora. Retorna una lista con 'hora, Toma'
    const grupos = agruparPorHora(hoy)

    const tomasSincronizadas = useValue(syncState(toma$).lastSync)

    const tomasListas = useValue(syncState(toma$).isLoaded)
    const medsListos = useValue(syncState(medicamento$).isLoaded)

    const sincronizados = lista.filter((m) => m.created_at).length

    const tomasResueltas = hoy.length - sinResolver.length

    useFocusEffect(
        useCallback(() => {
        if (!perfil?.id) return
    }, [perfil?.id, tomasSincronizadas, tomasListas, medsListos])
    )

    useEffect(() => {
        if (!perfil?.id) return
        generarTomasPendientes(perfil.id)
    }, [perfil?.id, sincronizados, tomasSincronizadas, tomasListas, medsListos])


    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Medicacion' canGoBack={false}/>
            </SafeAreaView>

            <TopBarSecondary active="Tomas" tab1="Tomas" tab2="Medicamentos" route1="/medicacion" route2="/medicacion/historial"/>


            <ScrollView
                className="flex-grow bg-neutral-50"
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 80 }}
            >
               
                <Text className="text-2xl font-bold text-neutral-900 tracking-tight px-6">{`Hoy, ${new Date().getDate()} de ${new Date().toLocaleString('es-Es', {month: 'long'})}`}</Text>

                <View className=" flex flex-col px-6 my-4">
                    <View className="flex-row justify-between mb-2">
                        <Text>Progreso del dia</Text>
                        <Text>{hoy.length !== 0 ? `${tomasResueltas} de ${hoy.length} tomados` : `No hay tomas hoy`}</Text>
                    </View>
                    <View className="h-4 w-full overflow-hidden rounded-3xl bg-slate-200">
                        <View className="h-full bg-black" style={{
                            width: `${(tomasResueltas/hoy.length)* 100}%`
                        }}/>
                    </View>
                    
                </View>

                {hoy.length === 0 ? (
                    <View className="mx-6 mb-8 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-8 items-center">
                        <Text className="text-neutral-500 text-sm text-center">
                            No hay dosis programadas para hoy.
                        </Text>
                    </View>
                ) : (
                    <View className="mb-8">
                    {grupos.length === 0 ? (
                    <View className="mx-6 mb-8 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-8 items-center">
                        <Text className="text-neutral-500 text-sm text-center">
                            No hay dosis programadas para hoy.
                        </Text>
                    </View>
                ) : (
                    <View>
                        {grupos.map((g) => (
                            <TomasDelDia key={g.hora} grupo={g} medicamentos={medicamentos} />
                        ))}
                    </View>
                )}
                    </View>
                )}

                
            </ScrollView>


            <GlassView
            style={{
            position: 'absolute',
            bottom: 144, 
            right: 24,   
            height: 64,  
            width: 64,   
            borderRadius: 32, 
            overflow: 'hidden',
            }}
            glassEffectStyle="clear"
            tintColor="#000000E6"
            isInteractive
            >
                <TouchableOpacity
                onPress={() => router.navigate('/medicacion/agregar-medicamento')}
                accessibilityRole="button"
                className={`flex-1 justify-center items-center ${Platform.OS === "android" ? 'bg-txt-color' : ''}`}
                >
                <Text className="text-white text-center items-center font-semibold text-2xl">+</Text>
                </TouchableOpacity>
            </GlassView>

           

            
        </View>
    )
}
