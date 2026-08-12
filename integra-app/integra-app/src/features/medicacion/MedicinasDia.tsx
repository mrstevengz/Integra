import { View, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Modal from 'react-native-modal'
import { useState } from "react"
import { porId } from "@/state/helpers"
import { colorEstado, etiquetaEstado } from "./estados"
import { marcarTomada, marcarOmitida, posponer, revertir, marcarTodasTomadas } from "./acciones"
import type { GrupoTomas, Medicamento } from "@/state/medicacion"

type Props = {
    grupo: GrupoTomas
    medicamentos: Record<string, Medicamento> | undefined
}

export function GrupoDelDia({ grupo, medicamentos }: Props) {
    //Las que todavia esperan accion del usuario
    const sinResolver = grupo.tomas.filter(
        (t) => t.estado === 'pendiente' || t.estado === 'pospuesta'
    )

    //Guarda el ID de la dosis abierta, no el objeto. null = modal cerrado.
    const [idAbierto, setIdAbierto] = useState<string | null>(null)

    //Se busca en cada render, asi el modal siempre muestra el estado actual
    const abierta = idAbierto ? grupo.tomas.find((t) => t.id === idAbierto) : undefined
    const medAbierto = abierta ? porId(medicamentos, abierta.medicamento_id) : undefined
    const resueltaAbierta = abierta?.estado === 'tomada' || abierta?.estado === 'omitida'

    function cerrar() { setIdAbierto(null) }

    //Ejecuta la accion sobre la dosis abierta y cierra el modal
    function ejecutar(fn: (id: string) => void) {
        if (!abierta) return
        fn(abierta.id)
        cerrar()
    }

    return (
        <View className="border border-gray-200 rounded-2xl mb-3 overflow-hidden">

            <View className="flex-row items-center justify-between px-4 py-3 bg-slate-50 border-b border-gray-200">
                <Text className="font-semibold text-slate-900">{grupo.etiqueta}</Text>

                {sinResolver.length > 1 && (
                    <Pressable
                        onPress={() => marcarTodasTomadas(sinResolver.map((t) => t.id))}
                        hitSlop={8}
                    >
                        <Text className="text-teal-700 text-sm font-medium">Tomar todas</Text>
                    </Pressable>
                )}
            </View>

            {grupo.tomas.map((t) => {
                const med = porId(medicamentos, t.medicamento_id)

                return (
                    <Pressable
                        key={t.id}
                        onPress={() => setIdAbierto(t.id)}
                        className="px-4 py-3 border-b border-gray-100 active:bg-black/5"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 pr-3">
                                <Text className="text-slate-900">
                                    {med ? `${med.nombre} ${med.dosis} ${med.unidad}` : 'Medicamento'}
                                </Text>

                                {med?.con_alimentos && med.con_alimentos !== 'indiferente' && (
                                    <Text className="text-xs text-gray-400">
                                        {med.con_alimentos === 'con' ? 'Con alimentos' : 'Sin alimentos'}
                                    </Text>
                                )}

                                {t.estado === 'pospuesta' && t.pospuesta_hasta && (
                                    <Text className="text-xs text-amber-600">
                                        Hasta las {new Date(t.pospuesta_hasta).toLocaleTimeString('es-CR', {
                                            hour: 'numeric', minute: '2-digit',
                                        })}
                                    </Text>
                                )}
                            </View>

                            <View className="flex-row items-center gap-2">
                                <Text className={`text-sm font-medium ${colorEstado(t.estado)}`}>
                                    {etiquetaEstado(t.estado)}
                                </Text>
                                <Text className="text-slate-300 text-lg">›</Text>
                            </View>
                        </View>
                    </Pressable>
                )
            })}

            {/* UN solo modal para todo el grupo, fuera del map */}
            <Modal
                isVisible={!!abierta}
                onBackdropPress={cerrar}
                onSwipeComplete={cerrar}
                swipeDirection="down"
                useNativeDriver
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl px-5 pt-3 pb-4">

                    <View className="items-center mb-4">
                        <View className="h-1 w-10 rounded-full bg-slate-300" />
                    </View>

                    <Text className="text-lg font-semibold text-slate-900">
                        {medAbierto
                            ? `${medAbierto.nombre} ${medAbierto.dosis} ${medAbierto.unidad}`
                            : 'Medicamento'}
                    </Text>
                    <Text className="text-slate-400 text-sm mb-5">{grupo.etiqueta}</Text>

                    {resueltaAbierta ? (
                        <Pressable
                            onPress={() => ejecutar(revertir)}
                            className="border border-slate-300 rounded-xl py-4 items-center active:opacity-80"
                        >
                            <Text className="text-slate-700 font-medium">Deshacer</Text>
                        </Pressable>
                    ) : (
                        <View className="gap-3">
                            <Pressable
                                onPress={() => ejecutar(marcarTomada)}
                                className="bg-teal-700 rounded-xl py-4 items-center active:opacity-80"
                            >
                                <Text className="text-white font-semibold">Ya la tome</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => ejecutar((id) => posponer(id, 15))}
                                className="border border-amber-500 rounded-xl py-4 items-center active:opacity-80"
                            >
                                <Text className="text-amber-600 font-medium">Posponer 15 minutos</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => ejecutar(marcarOmitida)}
                                className="border border-slate-300 rounded-xl py-4 items-center active:opacity-80"
                            >
                                <Text className="text-slate-500 font-medium">Omitir</Text>
                            </Pressable>
                        </View>
                    )}

                    <Pressable onPress={cerrar} className="py-4 items-center mt-1">
                        <Text className="text-slate-400">Cancelar</Text>
                    </Pressable>
                </SafeAreaView>
            </Modal>
        </View>
    )
}