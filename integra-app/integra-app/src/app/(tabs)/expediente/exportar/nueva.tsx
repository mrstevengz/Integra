import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useValue } from "@legendapp/state/react";
import TopBar from "@/components/TopBar";
import FilaSeccion from "@/features/exportaciones/FilaSeccion";
import { RANGOS, SECCIONES } from "@/features/exportaciones/opciones";
import { perfil$ } from "@/state/usuario";
import {
    afectaAlHistorial,
    alternarSeccion,
    borradorExportacion$,
    haySeccionesElegidas,
} from "@/state/exportaciones";
import { color } from "@/theme/colors";

export default function NuevaExportacionScreen() {
    const perfil = useValue(perfil$)
    const borrador = useValue(borradorExportacion$)

    if (!perfil.id) return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Mi Expediente' canGoBack={false}/>
            </SafeAreaView>
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={color.primary}/>
            </View> 
        </View>
    )

    const puedeContinuar = haySeccionesElegidas(borrador.secciones)

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-surface">
                <TopBar name="Exportar expediente" canGoBack={true} />
            </SafeAreaView>

            <ScrollView
                className="flex-1 bg-surface"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
                <Text className="text-body text-content-muted mb-6">
                    Selecciona las secciones a incluir y el rango de fechas del
                    historial a exportar.
                </Text>

                <Text className="text-label font-semibold text-content mb-1">
                    Secciones a incluir
                </Text>

                {SECCIONES.map((seccion) => (
                    <FilaSeccion
                        key={seccion.valor}
                        etiqueta={seccion.etiqueta}
                        detalle={seccion.detalle}
                        activa={borrador.secciones[seccion.valor]}
                        onPress={() => alternarSeccion(seccion.valor)}
                    />
                ))}

                {afectaAlHistorial(borrador.secciones) && (
                    <View className="mt-6">
                        <Text className="text-label font-semibold text-content mb-3">
                            Rango del historial
                        </Text>

                        <View className="flex-row gap-2">
                            {RANGOS.map((rango) => {
                                const activo = borrador.rango === rango.valor
                                return (
                                    <Pressable
                                        key={rango.valor}
                                        onPress={() => borradorExportacion$.rango.set(rango.valor)}
                                        className={`flex-1 py-3 rounded-control border items-center ${
                                            activo
                                                ? 'bg-content border-content'
                                                : 'bg-surface-raised border-line-strong'
                                        }`}
                                    >
                                        <Text className={`text-caption font-medium ${
                                            activo ? 'text-content-inverse' : 'text-content-muted'
                                        }`}>
                                            {rango.etiqueta}
                                        </Text>
                                    </Pressable>
                                )
                            })}
                        </View>
                    </View>
                )}

                <Pressable
                    onPress={() => router.navigate('/expediente/exportar/vigencia')}
                    disabled={!puedeContinuar}
                    className={`rounded-control py-4 mt-8 items-center ${
                        puedeContinuar
                            ? 'bg-primary active:bg-primary-pressed'
                            : 'bg-content-disabled'
                    }`}
                >
                    <Text className="text-content-on-primary text-body font-semibold">
                        Continuar
                    </Text>
                </Pressable>

                {!puedeContinuar && (
                    <Text className="text-caption text-content-subtle text-center mt-3">
                        Selecciona al menos una seccion.
                    </Text>
                )}
            </ScrollView>
        </View>
    )
}