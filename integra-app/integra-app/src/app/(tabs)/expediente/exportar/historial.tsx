import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useValue } from "@legendapp/state/react";
import TopBar from "@/components/TopBar";
import TopBarSecondary from "@/components/TopBarSecondary";
import EstadoExportacion from "@/features/exportaciones/EstadoExportacion";
import { formatearFecha } from "@/lib/fechas";
import { perfil$ } from "@/state/usuario";
import {
    estadoDeExportacion,
    exportaciones$,
    exportacionesDelPerfil,
    reiniciarBorrador,
    seccionesIncluidas,
    type Exportacion,
    type EstadoExportacion as Estado,
} from "@/state/exportaciones";
import { color } from "@/theme/colors";

function resumen(exportacion: Exportacion, estado: Estado): string {
    const secciones = `${seccionesIncluidas(exportacion).length} secciones`
    const fecha = formatearFecha(new Date(exportacion.expira_en))

    if (estado === 'revocada') return `Revocada · ${secciones}`
    if (estado === 'vencida') return `Vencio el ${fecha} · ${secciones}`
    return `Vence el ${fecha} · ${secciones}`
}

export default function HistorialExportacionesScreen() {
    const perfil = useValue(perfil$)
    const exportaciones = exportacionesDelPerfil(useValue(exportaciones$), perfil.id)

    if (!perfil.id) return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Agregar cita' canGoBack={true}/>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={color.primary}/>
        </View>
    </View>
    )

    function nuevaExportacion() {
        reiniciarBorrador()
        router.navigate('/expediente/exportar/nueva')
    }

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-surface">
                <TopBar name="Exportar perfil" canGoBack={true} />
            </SafeAreaView>

            <TopBarSecondary
                active="Expediente"
                tab1="Emergencia"
                tab2="Expediente"
                route1="/expediente/exportar"
                route2="/expediente/exportar/historial"
            />

            <ScrollView
                className="flex-1 bg-surface"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
                <Text className="text-caption text-content-subtle mb-5">
                    {exportaciones.length === 0
                        ? 'Todavia no exportaste tu expediente'
                        : `${exportaciones.length} exportaciones realizadas`}
                </Text>

                {exportaciones.map((exportacion) => {
                    const estado = estadoDeExportacion(exportacion)

                    return (
                        <View
                            key={exportacion.id}
                            className="border-b border-line pb-5 mb-5"
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-caption text-content-muted">
                                    {exportacion.codigo}
                                </Text>
                                <EstadoExportacion estado={estado} />
                            </View>

                            <Text className="text-body text-content">
                                Generado el {formatearFecha(new Date(exportacion.created_at ?? exportacion.expira_en))}
                            </Text>
                            <Text className="text-caption text-content-subtle mt-1">
                                {resumen(exportacion, estado)}
                            </Text>

                            {estado === 'activa' && (
                                <View className="flex-row gap-3 mt-4">
                                    <Pressable
                                        onPress={() => router.navigate({
                                            pathname: '/expediente/exportar/[exportacionId]',
                                            params: { exportacionId: exportacion.id },
                                        })}
                                        className="flex-1 py-3 rounded-control border border-line-strong items-center active:bg-surface-sunken"
                                    >
                                        <Text className="text-body font-semibold text-content">Ver QR</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => router.navigate({
                                            pathname: '/expediente/exportar/[exportacionId]/revocar',
                                            params: { exportacionId: exportacion.id },
                                        })}
                                        className="flex-1 py-3 rounded-control border border-line-strong items-center active:bg-danger-subtle"
                                    >
                                        <Text className="text-body font-semibold text-danger">Revocar</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    )
                })}

                <Pressable
                    onPress={nuevaExportacion}
                    className="bg-primary active:bg-primary-pressed rounded-control py-4 mt-2 items-center"
                >
                    <Text className="text-content-on-primary text-body font-semibold">
                        Nueva exportacion
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}