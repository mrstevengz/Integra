import { formatearHoraDeTexto } from "@/lib/fechas";
import { horariosOrdenados, Medicamento, formatearDias } from "@/state/medicamentos";
import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function MedicinasLista (m: Medicamento) {
    return (
        <Pressable key={m.id} className="mx-6 mb-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
        onPress={() => router.navigate(
            {
            pathname: '/medicacion/[medicacionId]/editar',
            params: {medicacionId: m.id}
            }
        )}
        >
            <Text className="font-semibold text-base text-neutral-900 tracking-tight">
                {m.nombre} · {m.dosis}{m.unidad}
            </Text>

            <Text className="text-neutral-500 text-sm mb-3 mt-0.5">
                {m.forma}
                {m.con_alimentos ? ` · ${m.con_alimentos} alimentos` : ''}
            </Text>

            {horariosOrdenados(m).length === 0 ? (
                <Text className="text-neutral-500 text-sm">Sin horarios</Text>
            ) : (
                horariosOrdenados(m).map((h) => (
                <Text key={h.id} className="text-neutral-600 text-sm mb-0.5">
                    {formatearHoraDeTexto(h.hora)} · {formatearDias(h.dias)}
                </Text>
                ))
            )}

            {m.indicaciones && (
                <View className="mt-3 pt-3 border-t border-neutral-100">
                    <Text className="text-neutral-500 text-xs italic">
                        {m.indicaciones}
                    </Text>
                </View>
            )}
        </Pressable>
    )
}
