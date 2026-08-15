import { Text, View, TouchableOpacity, ScrollView, Pressable, TouchableHighlight } from "react-native";
import TopBar from "@/components/TopBar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useValue } from "@legendapp/state/react";
import { perfil$ } from "@/state/usuario";
import Ionicons from "@expo/vector-icons/Ionicons";
import { toma$, tomasDelDia } from "@/state/medicacion";
import { TomaComponente } from "@/features/medicacion/TomasComponentes";
import { medicion$, medicionesOrdenadas, tipoMedicion$ } from "@/state/medicion";
import { porId } from "@/state/helpers";
import ArticulosDestacadoComponente from "@/features/articulos/ArticulosComponente";

export default function HomeScreen() {
    const perfil = useValue(perfil$)

    const tomas = useValue(toma$)
    const tomasDeHoy = tomasDelDia(tomas, new Date(), perfil?.id)
    const sinResolver = tomasDeHoy.filter(
        (t) => t.estado === 'pendiente' || t.estado === 'pospuesta'
    )

    const tomasResueltas = tomasDeHoy.length - sinResolver.length

    const hoy = new Date()
    const day = new Intl.DateTimeFormat('es-ni', {weekday: "long"}).format(hoy)
    const capitalize = day.charAt(0).toUpperCase() + day.slice(1)

    const mediciones = useValue(medicion$)
    const tipos = useValue(tipoMedicion$)
        
    const medicionesHistorial = medicionesOrdenadas(mediciones, perfil.id)

    const medicionComponente = medicionesHistorial.slice(0, 2)
    
  return (
    <View className="flex-1 bg-slate-100">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Inicio' canGoBack={false}/>
        </SafeAreaView>

        {/* //Topbar del perfil */}
        <View className="w-full bg-white flex-row justify-between items-center border-y border-slate-300 p-6">
            <View className="flex-col">
                <Text className="text-3xl font-bold">{`Hola, ${perfil.nombre}`}</Text>
                <Text className="text-lg font-light text-neutral-900 tracking-tight">{`${capitalize}, ${hoy.getDate()} de ${hoy.toLocaleString('es-Es', {month: 'long', year:'numeric'})}`}</Text>
            </View>

            <TouchableOpacity className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-300" onPress={() => router.navigate("/expediente")}>
                <Ionicons name="person-sharp" size={20}/>
            </TouchableOpacity>
        </View>


       <ScrollView
                className="flex-grow bg-slate-100"
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 80, paddingHorizontal: 15 }}
        >

            <TomaComponente tomas = {tomasDeHoy}/>

            <View className="flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm mt-4">
                <View className="flex-row justify-between mb-2">
                    <Text>Progreso del dia</Text>
                    <Text>{tomasDeHoy.length !== 0 ? `${tomasResueltas} de ${tomasDeHoy.length} tomados` : `No hay tomas hoy`}</Text>
                </View>

                <View className="h-4 w-full overflow-hidden rounded-3xl bg-slate-200">
                    <View className="h-full bg-black" style={{
                        width: `${(tomasResueltas/tomasDeHoy.length)* 100}%`
                    }}/>
                </View>
            </View>

             <View className="flex-row items-center justify-between my-5">
                <Text className="text-neutral-500 text-md font-semibold uppercase tracking-wider">
                    Ultimas mediciones
                </Text>
            
                <Pressable onPress={() => router.push('/medicion')} hitSlop={8} accessibilityRole="button">
                    <Text className="text-neutral-400 text-md font-medium">Ver todas</Text>
                </Pressable>
            </View>

            <View className="flex-row gap-6">
                {medicionComponente.length === 0 && (
                    <View className="mx-6 mb-8 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-8 items-center">
                        <Text className="text-neutral-500 text-sm text-center">
                            No hay historial de mediciones.
                        </Text>
                    </View>
                )}

                {medicionComponente.map((m => {
                    const t = porId(tipos, m.tipo_medicion_id)
                    const medidoEn = new Date(m.medido_en)

                    return (
                        <Pressable className="flex-col flex-1 justify-start rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm active:bg-white/80" key={m.id} onPress={() => router.navigate('/medicion/historial')}>
                            <Text className="text-slate-400">{t?.nombre}</Text>
                            <Text className="text-2xl font-bold">{m.valor} {m.valor_secundario && `/ ${m.valor_secundario}`}</Text>
                            <Text className="text-slate-400">{t?.unidad}</Text>
                            <Text className="text-slate-400">{medidoEn.toDateString().slice(4, 10)} {medidoEn.toTimeString().slice(0,5)}</Text>
                        </Pressable>
                    )
                }))}
            </View>

            <View className="flex-row items-center justify-between my-5">
                <Text className="text-neutral-500 text-md font-semibold uppercase tracking-wider">
                    Articulos Destacados
                </Text>
            
                <Pressable onPress={() => router.push('/medicion')} hitSlop={8} accessibilityRole="button">
                    <Text className="text-neutral-400 text-md font-medium">Ver todos</Text>
                </Pressable>

                
            </View>

            <ArticulosDestacadoComponente/>

        </ScrollView>
    </View>
  );
}
