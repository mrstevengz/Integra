import { Text, View, ScrollView, Pressable} from "react-native";
import TopBar from "@/components/TopBar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useValue } from "@legendapp/state/react";
import { perfil$ } from "@/state/usuario";
import { toma$, tomasDelDia } from "@/state/medicacion";
import { TomaComponente } from "@/features/medicacion/TomasComponentes";
import { medicion$, medicionesOrdenadas, tipoMedicion$ } from "@/state/medicion";
import { retornarObjetoPorId } from "@/state/helpers";
import ArticulosDestacadoComponente from "@/features/articulos/ArticulosComponente";
import CitasComponente from "@/features/citas/CitasComponente";
import { cita$, citasProximas } from "@/state/cita";
import { color } from "@/theme/colors";
import { User } from "lucide-react-native";

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

    const mediciones = useValue(medicion$)
    const tipos = useValue(tipoMedicion$)
    const citas = useValue(cita$)
    
    const citasProximasLista = citasProximas(citas, hoy, perfil.id)
        
    const medicionesHistorial = medicionesOrdenadas(mediciones, perfil.id)

    const medicionComponente = medicionesHistorial.slice(0, 2)
    
  return (
    <View className="flex-1 bg-slate-100">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar
            name={`Hola, ${perfil.nombre}`}
            canGoBack={false}
            grande
            subtitulo={`${new Date().toLocaleDateString('es-CR', {weekday: 'long'})}, ${new Date().getDate()} de ${new Date().toLocaleString('es-ES', {month: 'long'})}`}
            accion={() => router.navigate("/expediente")}
            accionIcono={<User size={30} color={color.primary}/>}
            />
        </SafeAreaView>

       <ScrollView
                className="flex-grow bg-slate-100"
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 120, paddingHorizontal: 15 }}
        >

            <TomaComponente tomas = {tomasDeHoy}/>

            <View className="flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm mt-4">
                <View className="flex-row justify-between mb-2">
                    <Text className="font-semibold">Progreso del dia</Text>
                    <Text className="font-semibold">{tomasDeHoy.length !== 0 ? `${tomasResueltas} de ${tomasDeHoy.length} tomados` : `No hay tomas hoy`}</Text>
                </View>

                <View className="h-4 w-full overflow-hidden bg-neutral-color rounded-3xl">
                    <View className="h-full bg-sec-color border-r-8 rounded-lg" style={{
                        width: `${(tomasResueltas/tomasDeHoy.length)* 100}%`
                    }}/>
                </View>
            </View>

            <CitasComponente citasProximas={citasProximasLista}/>

             <View className="flex-row items-center justify-between my-5">
                <Text className="text-btn-color text-md font-semibold uppercase tracking-wider">
                    Ultimas mediciones
                </Text>
            
                <Pressable onPress={() => router.push('/medicion')} hitSlop={8} accessibilityRole="button">
                    <Text className="text-neutral-400 text-md font-medium">Ver todas</Text>
                </Pressable>
            </View>

            {medicionComponente.length === 0 && (
                <View className="rounded-2xl border border-neutral-200 bg-white p-5 items-center justify-between">
                    <Text className="text-neutral-500 text-sm">No hay historial de mediciones</Text>
                </View>
            )}

            <View className="flex-row gap-6">
                {medicionComponente.map((m => {
                    const t = retornarObjetoPorId(tipos, m.tipo_medicion_id)
                    const medidoEn = new Date(m.medido_en)

                    return (
                        <Pressable className="flex-col flex-1 justify-start rounded-2xl bg-white p-4 shadow-sm active:bg-white/80" key={m.id} onPress={() => router.navigate('/medicion/historial')}>
                            <Text className="text-btn-color font-light">{t?.nombre}</Text>
                            <Text className="text-2xl font-bold">{m.valor} {m.valor_secundario && `/ ${m.valor_secundario}`}</Text>
                            <Text className="text-txt-color font-bold">{t?.unidad}</Text>
                            <Text className="text-slate-400">{medidoEn.toDateString().slice(4, 10)} {medidoEn.toTimeString().slice(0,5)}</Text>
                        </Pressable>
                    )
                }))}
            </View>

            <View className="flex-row items-center justify-between my-5">
                <Text className="text-btn-color text-md font-semibold uppercase tracking-wider">
                    Articulos Destacados
                </Text>
            
                <Pressable onPress={() => router.push('/articulos')} hitSlop={8} accessibilityRole="button">
                    <Text className="text-neutral-400 text-md font-medium">Ver todos</Text>
                </Pressable>

                
            </View>

            <ArticulosDestacadoComponente/>

        </ScrollView>
    </View>
  );
}
