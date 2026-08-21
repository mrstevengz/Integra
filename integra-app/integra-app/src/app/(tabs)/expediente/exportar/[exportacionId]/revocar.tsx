import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useValue } from "@legendapp/state/react";
import { Ban } from "lucide-react-native";
import TopBar from "@/components/TopBar";
import { color } from "@/theme/colors";
import { formatearFecha } from "@/lib/fechas";
import { buscarPorId } from "@/state/consultas";
import {
    exportaciones$,
    revocarExportacion,
    seccionesIncluidas,
} from "@/state/exportaciones";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <View className="flex-row justify-between py-2">
            <Text className="text-caption text-content-muted">{etiqueta}</Text>
            <Text className="text-caption text-content font-medium">{valor}</Text>
        </View>
    )
}

export default function RevocarExportacionScreen() {
    const { exportacionId } = useLocalSearchParams()
    const exportaciones = useValue(exportaciones$)

    const exportacion = buscarPorId(exportaciones, exportacionId as string)

    if (!exportacion) {
        return (
            <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-surface">
                    <TopBar name="Revocar exportacion" canGoBack={true} />
                </SafeAreaView>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-body text-content-subtle">
                        Esta exportacion ya no existe.
                    </Text>
                </View>
            </View>
        )
    }

    function revocar() {
        revocarExportacion(exportacion?.id ?? '')
        router.back()
    }

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-surface">
                <TopBar name="Revocar exportacion" canGoBack={true} />
            </SafeAreaView>

            <ScrollView
                className="flex-1 bg-surface"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
                <View className="items-center mt-6 mb-6">
                    <View className="w-20 h-20 rounded-full border-2 border-line-strong items-center justify-center">
                        <Ban size={36} color={color.contentMuted} />
                    </View>
                </View>

                <Text className="text-heading font-bold text-content text-center mb-3">
                    Revocar acceso
                </Text>

                <Text className="text-body text-content-subtle text-center mb-8">
                    El enlace y el codigo QR quedaran inactivos inmediatamente.
                    Nadie mas podra acceder a este expediente exportado.
                </Text>

                <View className="bg-surface-sunken rounded-card p-4 mb-8">
                    <Dato etiqueta="ID" valor={exportacion.codigo} />
                    <Dato
                        etiqueta="Creado"
                        valor={formatearFecha(new Date(exportacion.created_at ?? exportacion.expira_en), { conAnio: true })}
                    />
                    <Dato
                        etiqueta="Vence"
                        valor={formatearFecha(new Date(exportacion.expira_en), { conAnio: true })}
                    />
                    <Dato
                        etiqueta="Secciones"
                        valor={`${seccionesIncluidas(exportacion).length} incluidas`}
                    />
                </View>

                <Pressable
                    onPress={revocar}
                    className="bg-content active:bg-content-muted rounded-control py-4 items-center"
                >
                    <Text className="text-content-inverse text-body font-semibold">
                        Si, revocar acceso
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => router.back()}
                    className="rounded-control py-4 mt-3 items-center border border-line-strong active:bg-surface-sunken"
                >
                    <Text className="text-content text-body font-semibold">Cancelar</Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}