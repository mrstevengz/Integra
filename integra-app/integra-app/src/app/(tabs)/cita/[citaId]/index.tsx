import TopBar from "@/components/TopBar";
import { deleteAlert } from "@/components/Alert";
import { citas$, resultadosCita$, resultadoDeCita } from "@/state/citas";
import { buscarPorId } from "@/state/consultas";
import { formatearFecha } from "@/lib/fechas";
import { formatearHora } from "@/lib/fechas";
import EstadoCita from "@/features/citas/EstadoCita";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useValue } from "@legendapp/state/react";
import { router, useLocalSearchParams } from "expo-router";
import { View, KeyboardAvoidingView, Platform, ScrollView, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Fila de dato en solo lectura. Se repetia cuatro veces en esta pantalla.
function Dato({ titulo, valor }: { titulo: string; valor?: string | null }) {
    return (
        <View className="gap-2 border-b border-neutral-400 px-6 py-4">
            <Text className="text-neutral-600">{titulo}</Text>
            <Text className="text-lg">{valor?.trim() ? valor : 'Sin registrar'}</Text>
        </View>
    )
}

export default function DetalleCita() {
    const { citaId } = useLocalSearchParams()
    const id = citaId as string

    const citas = useValue(citas$)
    const resultados = useValue(resultadosCita$)

    const cita = buscarPorId(citas, id)
    const resultado = resultadoDeCita(resultados, id)


    if (!cita) {
        return (
            <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-slate-100">
                    <TopBar name='Detalle de la cita' canGoBack={true}/>
                </SafeAreaView>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-neutral-500">Esta cita ya no existe.</Text>
                </View>
            </View>
        )
    }

    //Resuelta = tiene fila de resultado = solo lectura. El historial no se
    //reescribe: ni se edita ni se borra.
    const resuelta = !!resultado
    const date = new Date(cita.programada_para)

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Detalle de la cita' canGoBack={true}/>
            </SafeAreaView>

            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    className="flex-grow bg-bg-color"
                    contentContainerStyle={{ flexGrow: 1, paddingTop: 40, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-col flex px-6 border-b border-neutral-400 pb-8">
                        <View className="flex-row gap-6 items-center mb-8 flex-2">
                            <View className="p-5 bg-neutral-200 border border-neutral-400 rounded-xl">
                                <Ionicons name="calendar-clear-outline" size={25}/>
                            </View>

                            <View className="flex-1 items-start gap-2">
                                <Text className="text-3xl font-bold">{cita.especialidad}</Text>
                                <Text className="text-lg text-neutral-600">{cita.medico}</Text>
                                <View className="flex-row items-center gap-2">
                                    {/* //TODO: Implementar mapeador para convertir texto de citas a texto de label */}
                                    <Text className="rounded-lg border border-neutral-400 px-3 py-1">{cita.tipo_citas}</Text>
                                    {resultado && <EstadoCita resultado={resultado.tipo_resultado} />}
                                </View>
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1 flex-row gap-2 rounded-xl bg-neutral-color border border-neutral-400 p-6 items-center overflow-auto w-0">
                                <Ionicons name="calendar-outline"/>
                                <Text>{formatearFecha(date, { mesLargo: true, conAnio: true })}</Text>
                            </View>
                            <View className="flex-1 w-0 flex-row gap-2 rounded-xl bg-neutral-color border border-neutral-400 p-6 items-center overflow-hidden">
                                <Ionicons name="time-outline"/>
                                <Text>{formatearHora(date)}</Text>
                            </View>
                        </View>
                    </View>

                    <Dato titulo="Institucion" valor={cita.institucion} />
                    <Dato titulo="Notas" valor={cita.notas} />

                    {/* Lo que se registro despues de la cita. Solo existe si esta resuelta. */}
                    {resultado && (
                        resultado.tipo_resultado === 'cancelada'
                            ? <Dato titulo="Motivo de cancelacion" valor={resultado.nota_cancelacion} />
                            : (
                                <>
                                    <Dato titulo="Diagnostico / Resultado" valor={resultado.diagnostico} />
                                    <Dato titulo="Instrucciones del medico" valor={resultado.instruccion} />
                                    <Dato titulo="Ajustes de medicacion" valor={resultado.ajuste_medicacion} />
                                </>
                            )
                    )}

                    {!resuelta ? (
                        <View className="px-6 py-4 gap-4">
                            <Pressable
                                onPress={() => router.navigate({
                                    pathname: '/cita/[citaId]/resultado',
                                    params: { citaId: cita.id }
                                })}
                                className="bg-black py-4 rounded-xl active:bg-neutral-800/80">
                                <Text className="text-white text-center font-bold text-lg">
                                    Registrar resultado
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => router.navigate({
                                    pathname: '/cita/[citaId]/editar',
                                    params: { citaId: cita.id }
                                })}
                                className="bg-transparent py-4 rounded-xl border-txt-color border-2 active:bg-neutral-800/10">
                                <Text className="text-txt-color text-center font-semibold text-lg">
                                    Editar cita
                                </Text>
                            </Pressable>

                            {/* Borrar solo es posible mientras no haya resultado, asi que
                                nunca queda una fila de citas_resultado sin su cita. */}
                            <Pressable
                                onPress={() => deleteAlert(() => {
                                    citas$[id].delete()
                                    router.back()
                                })}
                                className="py-4 rounded-xl border-2 border-danger active:bg-danger-subtle">
                                <Text className="text-danger text-center font-semibold text-lg">
                                    Eliminar cita
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View className="px-6 py-6">
                            <Text className="text-neutral-500 text-center">
                                Esta cita ya fue registrada. Las citas del historial no se
                                pueden editar ni eliminar.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}