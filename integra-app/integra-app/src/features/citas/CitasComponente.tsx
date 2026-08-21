import { Cita } from "@/state/citas";
import { formatearFecha } from "@/lib/fechas";
import { formatearHora } from "@/lib/fechas";
import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

interface ComponenteProps {
    citasProximas: Cita[]
}

export default function CitasComponente({citasProximas}: ComponenteProps) {
    const citaReciente = citasProximas.length > 0
        ? citasProximas.reduce((a, b) =>
            new Date(b.programada_para).getTime() < new Date(a.programada_para).getTime() ? b : a
          )
        : undefined

    const fechaCita = new Date(citaReciente?.programada_para ?? new Date())

    function getDaysRemaining() {
        if (!citaReciente) return ''

        const aMedianoche = (d: Date) =>
            new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

        const dias = Math.round((aMedianoche(fechaCita) - aMedianoche(new Date())) / 86400000)

        if (dias === 0) return 'Hoy'
        if (dias === 1) return 'Mañana'
        return `En ${dias} días`
    }

    return (
        <View className="w-full">
            <View className="flex-row items-center justify-between my-5">
                <Text className="text-btn-color text-md font-semibold uppercase tracking-wider">
                    Próxima cita
                </Text>

                <Pressable onPress={() => router.push('/cita')} hitSlop={8} accessibilityRole="button">
                    <Text className="text-neutral-400 text-md font-medium">Ver agenda</Text>
                </Pressable>
            </View>

            {!citaReciente ? (
                <View className="rounded-2xl border border-neutral-200 bg-white p-5 items-center">
                    <Text className="text-neutral-500 text-sm">No tenés citas pendientes</Text>
                </View>
            ) : (
                <Pressable
                    className="flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm active:bg-neutral-200"
                    onPress={() => router.navigate({
                        pathname: '/cita/[citaId]',
                        params: {citaId: citaReciente.id}
                    })}
                >
                    <View className="flex flex-row items-center">
                        <View className="flex-2 p-4 items-center justify-center rounded-xl bg-slate-200 border border-slate-300 mr-4">
                            <Text className="tracking-tight">
                                {fechaCita.toLocaleDateString('es-CR', {month: 'short'}).toUpperCase()}
                            </Text>
                            <Text className="font-bold text-lg">{fechaCita.getDate()}</Text>
                        </View>

                        <View className="flex-1 pr-3 flex-col">
                            <Text className="text-base font-bold text-neutral-900 tracking-tight">
                                {citaReciente.especialidad}
                            </Text>

                            <Text className="text-base text-neutral-900 tracking-tight">
                                {citaReciente.medico}
                            </Text>

                            <Text className="text-base text-neutral-900 tracking-tight">
                                {formatearFecha(fechaCita).slice(0,3)} {formatearHora(fechaCita)} ⋅ {getDaysRemaining()}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            )}
        </View>
    )
}