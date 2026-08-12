import { View, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  Tablets,
  Pill,
  TestTubes,
  Syringe,
  Pipette,
  Droplet,
  Wind,
  Bandage,
} from 'lucide-react-native';

import Modal from 'react-native-modal'
import {useState } from "react"
import { porId } from "@/state/helpers"
import { colorEstado, etiquetaEstado } from "./estados"
import { marcarTomada, marcarOmitida, posponer, revertir, marcarTodasTomadas } from "./acciones"
import type { FormaFarmaceutica, GrupoTomas, Medicamento } from "@/state/medicacion"


type Props = {
    grupo: GrupoTomas
    medicamentos: Record<string, Medicamento> | undefined
}

export function TomasDelDia({ grupo, medicamentos }: Props) {

    //Filtras las tomas que tienen como estado 'pendiente' o 'pospuesta'
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
        <View className="flex flex-col border border-neutral-200 bg-white shadow-sm">
            <View className="flex-row items-center justify-between px-5 py-4 bg-slate-100">
                <Text className="font-semibold text-neutral-900 tracking-tight">{grupo.etiqueta}</Text>

                {sinResolver.length > 1 && (
                    <Pressable
                        onPress={() => marcarTodasTomadas(sinResolver.map((t) => t.id))}
                        hitSlop={8}
                        accessibilityRole="button"
                        className="rounded-full bg-neutral-900 px-3 py-1.5 active:opacity-80"
                    >
                        <Text className="text-white text-xs font-semibold tracking-wide">Tomar todas</Text>
                    </Pressable>
                )}
            </View>

            {grupo.tomas.map((t) => {
                const med = porId(medicamentos, t.medicamento_id)

                return (
                    <Pressable
                        key={t.id}
                        onPress={() => setIdAbierto(t.id)}
                        accessibilityRole="button"
                        className={`px-5 py-4 active:bg-neutral-200/80 flex-row flex'}`}
                    >
                        <View className="flex-2 flex p-4 items-center justify-center rounded-xl bg-slate-200 border-slate-300 border mr-4">
                            {retornarIcono(med?.forma)}
                        </View>

                        <View className="flex-1 flex-row items-center justify-between">
                            <View className="flex-1 pr-3">
                                <Text className={` text-base font-medium tracking-tight ${t.estado === 'tomada' || t.estado === 'omitida' ? "line-through text-neutral-600" : 'text-neutral-900'}`}>
                                    {med ? `${med.nombre} | ${med.dosis} ${med.unidad}` : 'Medicamento'}
                                </Text>

                                {med?.con_alimentos && med.con_alimentos !== 'indiferente' && (
                                    <Text className="text-xs text-neutral-500 mt-0.5">
                                        {med.con_alimentos === 'con' ? 'Con alimentos' : 'Sin alimentos'}
                                    </Text>
                                )}

                                {t.estado === 'pospuesta' && t.pospuesta_hasta && (
                                    <View className="self-start mt-1.5 rounded-full border border-neutral-300 px-2 py-0.5">
                                        <Text className="text-xs font-medium text-neutral-600">
                                            Hasta las {new Date(t.pospuesta_hasta).toLocaleTimeString('es-CR', {
                                                hour: 'numeric', minute: '2-digit',
                                            })}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row items-center gap-2">
                                <Text className={`text-sm ${colorEstado(t.estado)}`}>
                                    {etiquetaEstado(t.estado)}
                                </Text>
                                <Text className="text-neutral-300 text-lg">›</Text>
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
                <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl px-6 pt-4 pb-6">

                    <View className="items-center mb-5">
                        <View className="h-1.5 w-12 rounded-full bg-neutral-300" />
                    </View>

                    <Text className="text-xl font-bold text-neutral-900 tracking-tight">
                        {medAbierto
                            ? `${medAbierto.nombre} ${medAbierto.dosis} ${medAbierto.unidad}`
                            : 'Medicamento'}
                    </Text>
                    <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-6 mt-1">
                        Hora programada: {grupo.etiqueta}
                    </Text>

                    <View className="border-t border-gray-300 py-4 mb-4">
                        <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-3 mt-1">
                            Indicaciones del medico: 
                        </Text>
                        <Text className="text-neutral-700">
                            {medAbierto?.indicaciones !== null ? `"${medAbierto?.indicaciones}"` : "Sin indicaciones"}
                        </Text>
                    </View>

                    {resueltaAbierta ? (
                        <Pressable
                            onPress={() => ejecutar(revertir)}
                            accessibilityRole="button"
                            className="border border-neutral-300 rounded-2xl py-4 items-center active:bg-neutral-50"
                        >
                            <Text className="text-neutral-700 font-semibold">Deshacer</Text>
                        </Pressable>
                    ) : (
                        <View className="gap-3">
                            <Pressable
                                onPress={() => ejecutar(marcarTomada)}
                                accessibilityRole="button"
                                className="bg-black rounded-2xl py-4 items-center active:opacity-90 shadow-sm"
                            >
                                <Text className="text-white font-semibold text-base">✓ Tomado</Text>
                            </Pressable>

                            <View className="flex flex-row gap-3">
                                <Pressable
                                    onPress={() => ejecutar((id) => posponer(id, 15))}
                                    accessibilityRole="button"
                                    className="flex-1 border border-neutral-300 rounded-2xl py-4 items-center active:bg-neutral-50"
                                >
                                    <Text className="text-neutral-700 font-semibold">🕛 Posponer 15 minutos</Text>
                                </Pressable>
                        
                                <Pressable
                                    onPress={() => ejecutar(marcarOmitida)}
                                    accessibilityRole="button"
                                    className="flex-1 border border-neutral-200 rounded-2xl py-4 items-center active:bg-neutral-50"
                                >
                                    <Text className="text-neutral-500 font-medium">Χ Omitir</Text>
                                </Pressable>
                            </View>                   
                        </View>
                    )}

                </SafeAreaView>
            </Modal>
        </View>
    )
}

function retornarIcono(forma: FormaFarmaceutica | undefined) {
    if (forma === "tableta") return <Tablets color="#737373"/>
    if (forma === "capsula") return <Pill color="#737373"/>
    if (forma === "jarabe") return <Droplet color="#737373"/>
    if (forma === "suspension") return <TestTubes color="#737373"/>
    if (forma === "inyeccion") return <Syringe color="#737373"/>
    if (forma === "gotas") return <Pipette color="#737373"/>
    if (forma === "crema") return <Droplet color="#737373"/>
    if (forma === "inhalador") return <Wind color="#737373"/>
    if (forma === "supositorio") return <Pill color="#737373"/>
    if (forma === "parche") return <Bandage color="#737373"/>

    return <Pill/>
}
