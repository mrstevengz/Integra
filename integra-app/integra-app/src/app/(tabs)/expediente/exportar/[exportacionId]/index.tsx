import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useValue } from "@legendapp/state/react";
import QRCode from "react-native-qrcode-svg";
import TopBar from "@/components/TopBar";
import EstadoExportacion from "@/features/exportaciones/EstadoExportacion";
import { useBrilloMaximo } from "@/hooks/useBrilloMaximo";
import { formatearFecha } from "@/lib/fechas";
import { buscarPorId } from "@/state/consultas";
import {
    enlaceDeExportacion,
    estadoDeExportacion,
    exportaciones$,
    seccionesIncluidas,
} from "@/state/exportaciones";
import { useState } from "react";
import * as Print from "expo-print";
import { shareAsync, isAvailableAsync } from "expo-sharing";
import { armarExpedienteHTML } from "@/features/exportaciones/expediente-html";
import { delPerfil } from "@/state/consultas";
import { alergias$ } from "@/state/alergias";
import { citas$, resultadosCita$ } from "@/state/citas";
import { condiciones$, condicionesDelPerfil } from "@/state/condiciones";
import { contactosDelPerfil, contactosEmergencia$ } from "@/state/contactos-emergencia";
import { medicamentos$ } from "@/state/medicamentos";
import { mediciones$, medicionesDelPerfil, tiposMedicion$ } from "@/state/mediciones";
import { perfil$ } from "@/state/usuario";

const TAMANO_QR = 280;
const ZONA_SILENCIO = 14;

export default function DetalleExportacionScreen() {
    const { exportacionId } = useLocalSearchParams()
    const exportaciones = useValue(exportaciones$)

    const perfil = useValue(perfil$)
    const alergias = delPerfil(useValue(alergias$), perfil.id)
    const condiciones = condicionesDelPerfil(useValue(condiciones$), perfil.id)
    const medicamentos = delPerfil(useValue(medicamentos$), perfil.id)
    const mediciones = medicionesDelPerfil(useValue(mediciones$), perfil.id)
    const tiposMedicion = useValue(tiposMedicion$)
    const citas = delPerfil(useValue(citas$), perfil.id)
    const resultadosCita = useValue(resultadosCita$)
    const contactos = contactosDelPerfil(useValue(contactosEmergencia$), perfil.id)

    const [generandoPDF, setGenerandoPDF] = useState(false)

    const exportacion = buscarPorId(exportaciones, exportacionId as string)
    const estado = exportacion ? estadoDeExportacion(exportacion) : null

    useBrilloMaximo(estado === 'activa')

    if (!exportacion || !estado) {
        return (
            <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-surface">
                    <TopBar name="Exportacion" canGoBack={true} />
                </SafeAreaView>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-body text-content-subtle">
                        Esta exportacion ya no existe.
                    </Text>
                </View>
            </View>
        )
    }

    const cantidadSecciones = seccionesIncluidas(exportacion).length
    const vence = formatearFecha(new Date(exportacion.expira_en))

    async function guardarPDF() {
        if (generandoPDF || !exportacion) return
        setGenerandoPDF(true)

        try {
            const html = armarExpedienteHTML(exportacion, {
                perfil, alergias, condiciones, medicamentos,
                mediciones, tiposMedicion, citas, resultadosCita, contactos,
            })

            const { uri } = await Print.printToFileAsync({ html })

            if (!(await isAvailableAsync())) {
                Alert.alert("Expediente generado", "Este dispositivo no permite compartir archivos.")
                return
            }

            await shareAsync(uri, {
                mimeType: "application/pdf",
                UTI: "com.adobe.pdf",
                dialogTitle: "Expediente medico",
            })
        } catch (e: any) {
            Alert.alert("No se pudo exportar", e?.message ?? "Intente de nuevo.")
        } finally {
            setGenerandoPDF(false)
        }
    }

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-surface">
                <TopBar name="Expediente exportado" canGoBack={true} />
            </SafeAreaView>

            <ScrollView
                className="flex-1 bg-surface"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            >
                <View className="flex-row items-center justify-between mb-5">
                    <Text className="text-caption text-content-muted">{exportacion.codigo}</Text>
                    <EstadoExportacion estado={estado} />
                </View>

                {estado === 'activa' ? (
                    <>
                        <View className="bg-surface-raised rounded-card border border-line p-6 items-center">
                            <QRCode
                                value={enlaceDeExportacion(exportacion)}
                                size={TAMANO_QR}
                                quietZone={ZONA_SILENCIO}
                                ecl="M"
                                color="#000000"
                                backgroundColor="#FFFFFF"
                            />
                            <Text className="text-caption text-content-subtle mt-5 text-center">
                                El personal medico escanea este codigo para abrir tu
                                expediente. Requiere internet.
                            </Text>
                        </View>

                        <View className="bg-surface-sunken rounded-card p-4 mt-5 gap-2">
                            <Text className="text-caption text-content-muted">
                                Vence el {vence}
                            </Text>
                            <Text className="text-caption text-content-muted">
                                {cantidadSecciones} secciones incluidas
                            </Text>
                        </View>

                        <Pressable
                            onPress={guardarPDF}
                            disabled={generandoPDF}
                            className={`rounded-control py-4 mt-6 items-center ${
                                generandoPDF ? 'bg-content-disabled' : 'bg-primary active:bg-primary-pressed'
                            }`}
                        >
                            <Text className="text-content-on-primary text-body font-semibold">
                                {generandoPDF ? 'Generando...' : 'Guardar PDF'}
                            </Text>
                        </Pressable>
                        

                        <Pressable
                            onPress={() => router.navigate({
                                pathname: '/expediente/exportar/[exportacionId]/revocar',
                                params: { exportacionId: exportacion.id },
                            })}
                            className="rounded-control py-4 mt-2 items-center border-2 border-danger active:bg-danger-subtle"
                        >
                            <Text className="text-danger text-body font-semibold">
                                Revocar acceso
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <View className="bg-surface-raised rounded-card border border-line p-6 items-center">
                        <Text className="text-body text-content-subtle text-center">
                            {estado === 'revocada'
                                ? 'Revocaste este acceso. El enlace y el codigo ya no funcionan.'
                                : `Este acceso vencio el ${vence}. El enlace y el codigo ya no funcionan.`}
                        </Text>
                        <Text className="text-caption text-content-subtle text-center mt-3">
                            Genera una exportacion nueva si necesitas compartir tu expediente.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}