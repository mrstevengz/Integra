import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useValue } from "@legendapp/state/react";
import Ionicons from "@expo/vector-icons/Ionicons";
import TopBar from "@/components/TopBar";
import TarjetaVigencia from "@/features/exportaciones/TarjetaVigencia";
import { VIGENCIAS } from "@/features/exportaciones/opciones";
import { color } from "@/theme/colors";
import { perfil$ } from "@/state/usuario";
import {
    borradorExportacion$,
    crearExportacion,
    haySeccionesElegidas,
    reiniciarBorrador,
    type Vigencia,
} from "@/state/exportaciones";

export default function VigenciaScreen() {
    const perfil = useValue(perfil$)
    const borrador = useValue(borradorExportacion$)

    const [vigencia, setVigencia] = useState<Vigencia>('7d')
    const [generando, setGenerando] = useState(false)

    if (!perfil.id) return <PantallaCargando titulo="Vigencia del acceso" />

    if (!haySeccionesElegidas(borrador.secciones)) {
        return (
            <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-surface">
                    <TopBar name="Vigencia del acceso" canGoBack={true} />
                </SafeAreaView>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-body text-content-subtle text-center">
                        Volve al paso anterior y elegi al menos una seccion.
                    </Text>
                </View>
            </View>
        )
    }

    function generar() {
        if (generando) return
        setGenerando(true)

        try {
            const exportacion = crearExportacion(
                perfil.id,
                { ...borrador.secciones },
                borrador.rango,
                vigencia,
            )

            reiniciarBorrador()

            router.replace({
                pathname: '/expediente/exportar/[exportacionId]',
                params: { exportacionId: exportacion.id },
            })
        } catch (error) {
            console.error('No se pudo crear la exportacion', error)
        } finally {
            setGenerando(false)
        }
    }

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-surface">
                <TopBar name="Vigencia del acceso" canGoBack={true} />
            </SafeAreaView>

            <ScrollView
                className="flex-1 bg-surface"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
                <View className="flex-row gap-3 bg-surface-sunken border-l-4 border-line-strong rounded-chip p-4 mb-6">
                    <Ionicons name="information-circle-outline" size={20} color={color.contentMuted} />
                    <Text className="flex-1 text-caption text-content-muted">
                        El enlace y el QR expiran automaticamente. Siempre podras
                        revocarlos antes de que venzan.
                    </Text>
                </View>

                <Text className="text-body text-content-muted mb-6">
                    Define por cuanto tiempo el personal medico podra acceder a tu
                    expediente exportado.
                </Text>

                {VIGENCIAS.map((opcion) => (
                    <TarjetaVigencia
                        key={opcion.valor}
                        etiqueta={opcion.etiqueta}
                        detalle={opcion.detalle}
                        activa={vigencia === opcion.valor}
                        onPress={() => setVigencia(opcion.valor)}
                    />
                ))}

                <Pressable
                    onPress={generar}
                    disabled={generando}
                    className={`rounded-control py-4 mt-5 items-center ${
                        generando ? 'bg-content-disabled' : 'bg-primary active:bg-primary-pressed'
                    }`}
                >
                    <Text className="text-content-on-primary text-body font-semibold">
                        {generando ? 'Generando...' : 'Generar QR y enlace'}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}