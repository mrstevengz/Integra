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
import { useState } from "react"
import { buscarPorId } from "@/state/consultas"
import { colorEstado, etiquetaEstado } from "./estados"
import { marcarComoTomada, marcarComoOmitida, posponerToma, revertirAccion, marcarTodasTomadas, revertirTodasTomadas } from "./acciones"
import { type FormaFarmaceutica, type Medicamento } from "@/state/medicamentos";
import { type GrupoTomas } from "@/state/tomas";
import { color } from "@/theme/colors";

type Props = {
    grupo: GrupoTomas
    medicamentos: Record<string, Medicamento> | undefined
}

export function TomasDelDia({ grupo, medicamentos }: Props) {

    //Filtras las tomas que tienen como estado 'pendiente' o 'pospuesta'
    const sinResolver = grupo.tomas.filter(
        (t) => t.estado === 'pendiente' || t.estado === 'pospuesta'
    )

    const resueltas = grupo.tomas.filter(
        (t) => t.estado === 'tomada'
    )

    //Guarda el ID de la dosis abierta, no el objeto. null = modal cerrado.
    const [idAbierto, setIdAbierto] = useState<string | null>(null)

    const todasTomadas = sinResolver.length === 0 && resueltas.length > 0

    //Se busca en cada render, asi el modal siempre muestra el estado actual
    const abierta = idAbierto ? grupo.tomas.find((t) => t.id === idAbierto) : undefined
    const medAbierto = abierta ? buscarPorId(medicamentos, abierta.medicamento_id) : undefined
    const resueltaAbierta = abierta?.estado === 'tomada' || abierta?.estado === 'omitida'


    function cerrar() { setIdAbierto(null) }

    //Ejecuta la accion sobre la dosis abierta y cierra el modal
    function ejecutar(fn: (id: string) => void) {
        if (!abierta) return
        fn(abierta.id)
        cerrar()
    }

    return (
        <View className="flex flex-col border border-line bg-surface-raised">
            <View className="flex-row items-center justify-between px-5 py-4 bg-surface">
                <Text className="text-label font-semibold text-content">{grupo.etiqueta}</Text>

                {sinResolver.length > 1 && !todasTomadas && (
                    <Pressable
                        onPress={() => {
                            marcarTodasTomadas(sinResolver.map((t) => t.id))
                        }}
                        hitSlop={8}
                        accessibilityRole="button"
                        className="rounded-full bg-primary px-3 py-2 active:bg-primary-pressed"
                    >
                        <Text className="text-caption font-semibold text-content-on-primary">Tomar todas</Text>
                    </Pressable>
                )}

                {todasTomadas && (
                    <Pressable
                        onPress={() => {
                            revertirTodasTomadas(resueltas.map((t) => t.id))
                        }}
                        hitSlop={8}
                        accessibilityRole="button"
                        className="rounded-full bg-primary px-3 py-2 active:bg-primary-pressed"
                    >
                        <Text className="text-caption font-semibold text-content-on-primary">Deshacer</Text>
                    </Pressable>
                )}
            </View>

            {grupo.tomas.map((t) => {
                const med = buscarPorId(medicamentos, t.medicamento_id)

                return (
                    <Pressable
                        key={t.id}
                        onPress={() => setIdAbierto(t.id)}
                        accessibilityRole="button"
                        className={`px-5 py-4 active:bg-surface flex-row flex'}`}
                    >
                        <View className="flex-2 flex p-3 items-center justify-center rounded-control bg-surface border border-line mr-4">
                            {retornarIcono(med?.forma)}
                        </View>

                        <View className="flex-1 flex-row items-center justify-between">
                            <View className="flex-1 pr-3">
                                <Text className={` text-body font-medium ${t.estado === 'tomada' || t.estado === 'omitida' ? "line-through text-content-muted" : 'text-content'}`}>
                                    {med ? `${med.nombre} | ${med.dosis} ${med.unidad}` : 'Medicamento'}
                                </Text>

                                {med?.con_alimentos && med.con_alimentos !== 'indiferente' && (
                                    <Text className="text-caption text-content-muted mt-0.5">
                                        {med.con_alimentos === 'con' ? 'Con alimentos' : 'Sin alimentos'}
                                    </Text>
                                )}

                                {t.estado === 'pospuesta' && t.pospuesta_hasta && (
                                    <View className="self-start mt-1.5 rounded-chip bg-warning-subtle py-1">
                                        <Text className="text-caption font-medium text-warning-on-subtle">
                                            Hasta las {new Date(t.pospuesta_hasta).toLocaleTimeString('es-CR', {
                                                hour: 'numeric', minute: '2-digit',
                                            })}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row items-center gap-2">
                                <Text className={`text-caption ${colorEstado(t.estado)}`}>
                                    {etiquetaEstado(t.estado)}
                                </Text>
                                <Text className="text-content-disabled text-heading">›</Text>
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
                <SafeAreaView edges={['bottom']} className="bg-surface-raised rounded-t-sheet px-6 pt-4 pb-6">

                    <View className="items-center mb-5">
                        <View className="h-1.5 w-12 rounded-full bg-line-strong" />
                    </View>

                    <Text className="text-title font-bold text-content">
                        {medAbierto
                            ? `${medAbierto.nombre} ${medAbierto.dosis} ${medAbierto.unidad}`
                            : 'Medicamento'}
                    </Text>
                    <Text className="text-label text-content-muted uppercase tracking-wider mb-6 mt-1">
                        Hora programada: {grupo.etiqueta}
                    </Text>

                    <View className="border-t border-line py-4 mb-4">
                        <Text className="text-label font-semibold text-content-muted mb-3 mt-1">
                            Indicaciones del medico: 
                        </Text>
                        <Text className="text-body text-content">
                            {medAbierto?.indicaciones !== null ? `"${medAbierto?.indicaciones}"` : "Sin indicaciones"}
                        </Text>
                    </View>

                    {resueltaAbierta ? (
                        <Pressable
                            onPress={() => ejecutar(revertirAccion)}
                            accessibilityRole="button"
                            className="border border-line-strong rounded-control py-4 items-center active:bg-surface"
                        >
                            <Text className="text-body font-semibold text-content">Deshacer</Text>
                        </Pressable>
                    ) : (
                        <View className="gap-3">
                            <Pressable
                                onPress={() => ejecutar(marcarComoTomada)}
                                accessibilityRole="button"
                                className="bg-primary rounded-control py-4 items-center active:bg-primary-pressed"
                            >
                                <Text className="text-body font-semibold text-content-on-primary">✓ Tomado</Text>
                            </Pressable>

                            <View className="flex flex-row gap-3">
                                <Pressable
                                    onPress={() => ejecutar((id) => posponerToma(id, 15))}
                                    accessibilityRole="button"
                                    className="flex-1 border border-line-strong rounded-control py-4 items-center active:bg-danger-subtle"
                                >
                                    <Text className="text-label font-semibold text-danger">🕛 Posponer 15 minutos</Text>
                                </Pressable>
                        
                                <Pressable
                                    onPress={() => ejecutar(marcarComoOmitida)}
                                    accessibilityRole="button"
                                    className="flex-1 border border-line-strong rounded-control py-4 items-center active:bg-danger-subtle"
                                >
                                    <Text className="text-label font-semibold text-surface-inverse">Χ Omitir</Text>
                                </Pressable>
                            </View>                   
                        </View>
                    )}

                </SafeAreaView>
            </Modal>
        </View>
    )
}


export function retornarIcono(forma: FormaFarmaceutica | undefined) {
    if (forma === "tableta") return <Tablets color={color.contentMuted}/>
    if (forma === "capsula") return <Pill color={color.contentMuted}/>
    if (forma === "jarabe") return <Droplet color={color.contentMuted}/>
    if (forma === "suspension") return <TestTubes color={color.contentMuted}/>
    if (forma === "inyeccion") return <Syringe color={color.contentMuted}/>
    if (forma === "gotas") return <Pipette color={color.contentMuted}/>
    if (forma === "crema") return <Droplet color={color.contentMuted}/>
    if (forma === "inhalador") return <Wind color={color.contentMuted}/>
    if (forma === "supositorio") return <Pill color={color.contentMuted}/>
    if (forma === "parche") return <Bandage color={color.contentMuted}/>

    return <Pill/>
}
