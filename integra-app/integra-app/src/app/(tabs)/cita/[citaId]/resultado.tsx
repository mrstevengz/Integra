import { CampoTexto } from "@/components/CampoTexto"
import { CampoCheckboxGrupo } from "@/components/CampoCheckboxGrupo"
import { CampoCheckbox } from "@/components/CampoCheckbox"
import TopBar from "@/components/TopBar"
import { perfil$ } from "@/state/usuario"
import { zodResolver } from "@hookform/resolvers/zod"
import { useValue } from "@legendapp/state/react"
import { router, useLocalSearchParams } from "expo-router"
import { useForm, useWatch } from "react-hook-form"
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text } from "react-native"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { z } from "zod"
import { resultadoCitasSchema, RESULTADO_CITA } from "@/features/citas/resultado-cita-schema"
import { citas$, resultadosCita$, resultadoDeCita, type TipoResultado } from "@/state/citas";
import { CampoFecha } from "@/components/CampoFecha"
import { buscarPorId } from "@/state/consultas"
import { combinarFechaHora } from "@/lib/fechas"
import { formatearFecha } from "@/lib/fechas";
import { formatearHora } from "@/lib/fechas";
import { crearId } from "@/lib/ids"
import { color } from "@/theme/colors"

const proximaCitaSchema = resultadoCitasSchema.extend({
    programarProximaCita: z.boolean().optional(),
    proximaFecha: z.date().optional(),
    proximaHora: z.date().optional(),
}).refine((data) => !data.programarProximaCita || (data.proximaFecha && data.proximaHora), {
    error: 'Selecciona la fecha y hora de la proxima cita',
    path: ['proximaFecha']
})

type ProximaCitaForm = z.infer<typeof proximaCitaSchema>

//Pantalla de carga y de aviso comparten estructura, se arman una sola vez.
function Pantalla({children}: {children: React.ReactNode}) {
    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Registrar resultado' canGoBack={true}/>
            </SafeAreaView>
            <View className="flex-1 items-center justify-center px-6">
                {children}
            </View>
        </View>
    )
}

export default function RegistrarResultadoScreen() {
    //TODOS los hooks van antes de cualquier return, si no React tira
    //"Rendered more hooks than during the previous render".
    const perfil = useValue(perfil$)
    const citas = useValue(citas$)
    const resultados = useValue(resultadosCita$)
    const {citaId} = useLocalSearchParams()

    const cita = buscarPorId(citas, citaId as string)
    const yaRegistrada = !!resultadoDeCita(resultados, citaId as string)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const {control, handleSubmit, reset} = useForm<ProximaCitaForm>({
        resolver: zodResolver(proximaCitaSchema),
        defaultValues: {
            resultado: '',
            diagnostico: '',
            instruccion: '',
            ajusteMedicacion: '',
            notaCancelacion: '',
            programarProximaCita: false,
            proximaFecha: new Date(),
            proximaHora: new Date(),
        }
    })

    const resultado = useWatch({control, name: 'resultado'})
    const programarProximaCita = useWatch({control, name: 'programarProximaCita'})


    function onSubmit(formValues: ProximaCitaForm) {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            const id = crearId()

            resultadosCita$[id].set({
                id,
                perfil_id: perfil.id,
                cita_id: citaId as string,
                tipo_resultado: formValues.resultado as TipoResultado,
                diagnostico: formValues.resultado === 'asistida' ? formValues.diagnostico : '',
                instruccion: formValues.resultado === 'asistida' ? formValues.instruccion : '',
                ajuste_medicacion: formValues.resultado === 'asistida' ? formValues.ajusteMedicacion : '',
                nota_cancelacion: formValues.resultado === 'cancelada' ? formValues.notaCancelacion : '',
            })


            if (formValues.programarProximaCita && formValues.proximaFecha && formValues.proximaHora && cita) {
                const proximaId = crearId()
                const programadaPara = combinarFechaHora(formValues.proximaFecha, formValues.proximaHora)

                citas$[proximaId].set({
                    id: proximaId,
                    perfil_id: perfil.id,
                    tipo_citas: cita.tipo_citas,
                    especialidad: cita.especialidad,
                    medico: cita.medico,
                    institucion: cita.institucion,
                    programada_para: programadaPara,
                    notas: '',
                })
            }

            reset(formValues)
            router.navigate('/cita/historial')
        } catch (error) {
            console.error('No se pudo guardar el resultado', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!perfil.id) return (
        <Pantalla>
            <ActivityIndicator size="large" color={color.primary}/>
        </Pantalla>
    )

    if (!cita) return (
        <Pantalla>
            <Text className="text-neutral-500 text-center">Esta cita ya no existe.</Text>
        </Pantalla>
    )


    if (yaRegistrada) return (
        <Pantalla>
            <Text className="text-neutral-500 text-center">
                Esta cita ya tiene un resultado registrado.
            </Text>
        </Pantalla>
    )

    const fechaCita = new Date(cita.programada_para)

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Registrar resultado' canGoBack={true}/>
            </SafeAreaView>

            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <ScrollView
                    className="flex-grow bg-surface"
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        paddingBottom: 120
                    }}
                    keyboardShouldPersistTaps="handled"
                >

                    <View className="flex-col bg-surface-sunken rounded-card p-4 mb-4">
                        <Text className="text-label">
                            {cita.especialidad} --- {cita.medico}
                        </Text>
                        <Text className="text-content-subtle text-label">
                            {formatearFecha(fechaCita)} {formatearHora(fechaCita)}
                        </Text>
                    </View>

                    <CampoCheckboxGrupo name="resultado" control={control} title="¿Que paso con esta cita?" opciones={RESULTADO_CITA}/>

                    {/* Los campos clinicos solo tienen sentido si asistio. */}
                    {resultado === 'asistida' && (
                        <>
                            <CampoTexto name="diagnostico" control={control} title="Diagnostico / Resultado" placeholder="Control glucemico adecuado"/>

                            <CampoTexto name="instruccion" control={control} title="Instrucciones del medico" placeholder="Ej. Continuar tratamiento, cita en 2 meses" opcional={true} />

                            <CampoTexto name="ajusteMedicacion" control={control} title="Ajustes de medicacion" placeholder="¿Algun cambio en medicamentos?" opcional={true}/>
                        </>
                    )}

                    {resultado === 'cancelada' && (
                        <CampoTexto name="notaCancelacion" control={control} title="Motivo de cancelacion" placeholder="Ej. Me reprogramaron" opcional={true}/>
                    )}

                    <View className="flex-col gap-3 mt-4 border rounded-3xl p-4">
                        <Text className="text-lg font-bold">
                            Proxima cita
                        </Text>
                        <Text className="text-neutral-500">
                            Programa la siguiente cita reutilizando la especialidad, medico e institucion de esta.
                        </Text>

                        <CampoCheckbox name="programarProximaCita" control={control} title="Programar proxima cita"/>

                        {programarProximaCita && (
                            <View className="flex flex-row gap-3">
                                <View className="flex-1">
                                    <CampoFecha name="proximaFecha" control={control} title="Fecha" placeholder="0" mode="date"/>
                                </View>

                                <View className="flex-1">
                                    <CampoFecha name="proximaHora" control={control} title="Hora" placeholder="0" mode="time"/>
                                </View>
                            </View>
                        )}
                    </View>

                    <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
                        className="bg-black py-4 rounded-lg active:bg-black/50 mt-4">
                        <Text className="text-white text-center">
                            {isSubmitting ? "Guardando..." : "Guardar resultado"}
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}