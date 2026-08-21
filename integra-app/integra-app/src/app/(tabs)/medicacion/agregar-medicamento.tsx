import { dosisANumero, MedicamentoForm, medicamentoSchema, OPCIONES_ALIMENTOS, OPCIONES_FORMA, OPCIONES_UNIDAD, TODOS_LOS_DIAS } from "@/features/medicamentos/medicacion-schema"
import { medicamentos$, type FormaFarmaceutica, type ConAlimentos } from "@/state/medicamentos";
import { perfil$ } from "@/state/usuario"
import { zodResolver } from "@hookform/resolvers/zod"
import { useValue } from "@legendapp/state/react"
import { router } from "expo-router"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import * as Crypto from 'expo-crypto';
import { CampoTexto } from "@/components/CampoTexto"
import { CampoHorario } from "@/features/medicamentos/CampoHorario"
import { CampoSelect } from "@/components/CampoSelect"
import TopBar from "@/components/TopBar"
import { View, Text, ActivityIndicator, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { crearId } from "@/lib/ids";
import { color } from "@/theme/colors";

export default function AgregarMedicamentoScreen() {
    const perfil = useValue(perfil$)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { control, handleSubmit, formState: { errors } } = useForm<MedicamentoForm>({
        resolver: zodResolver(medicamentoSchema),
        defaultValues: {
            nombre: '',
            dosis: '',
            unidad: 'mg',
            forma: 'tableta',
            con_alimentos: 'con',
            indicaciones: '',
            horarios: [{ hora: '08:00', dias: TODOS_LOS_DIAS }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'horarios' })

    function onSubmit(v: MedicamentoForm) {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
        const medId = crearId()

        medicamentos$[medId].set({
            id: medId,
            perfil_id: perfil.id,
            nombre: v.nombre,
            dosis: dosisANumero(v.dosis),
            unidad: v.unidad,
            forma: v.forma as FormaFarmaceutica,
            con_alimentos: (v.con_alimentos || null) as ConAlimentos | null,
            indicaciones: v.indicaciones || null,
            activo: true,
            horarios: v.horarios.map((h) => ({
                id: Crypto.randomUUID(),
                hora: h.hora,
                dias: h.dias,
            })),
        })

        router.back()
    } catch (error) {
        console.error('No se pudo guardar el medicamento', error)
    } finally {
        setIsSubmitting(false)
    }
}

    if (!perfil?.id) return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar medicamento' canGoBack={true}/>
            </SafeAreaView>
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={color.primary}/>
            </View>
        </View>
    )

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar medicamento' canGoBack={true}/>
            </SafeAreaView>

        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <ScrollView
                className="flex-grow bg-white"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 120
                }}
                keyboardShouldPersistTaps="handled"
            >
                <CampoTexto name="nombre" control={control} title="Nombre del medicamento"
                    placeholder="Paracetamol"/>

                <CampoTexto name="dosis" control={control} title="Dosis"
                    placeholder="50" keyboardType="phone-pad"/>

                <CampoSelect name="unidad" control={control} title="Unidad"
                    opciones={OPCIONES_UNIDAD}/>

                <CampoSelect name="forma" control={control} title="Forma farmaceutica"
                    opciones={OPCIONES_FORMA}/>

                <CampoSelect name="con_alimentos" control={control} title="Con alimentos"
                    opciones={OPCIONES_ALIMENTOS}/>

                <CampoTexto name="indicaciones" control={control} title="Indicaciones del medico"
                    placeholder="Ej. Tomar con abundante agua" opcional/>

                <Text className="text-lg font-semibold text-slate-900 mt-4 mb-3">Horarios</Text>

                {fields.map((field, index) => (
                    <CampoHorario
                        key={field.id}
                        control={control}
                        index={index}
                        onEliminar={() => remove(index)}
                        puedeEliminar={fields.length > 1}
                    />
                ))}

                {errors.horarios?.root && (
                    <Text className="text-red-600 text-sm mb-2">
                        {errors.horarios.root.message}
                    </Text>
                )}

                <Pressable
                    onPress={() => append({ hora: '20:00', dias: TODOS_LOS_DIAS })}
                    disabled={fields.length >= 6}
                    className={`border rounded-lg py-3 items-center mb-6 ${
                        fields.length >= 6 ? 'border-slate-200' : 'border-teal-700'
                    }`}
                >
                    <Text className={fields.length >= 6 ? 'text-slate-400' : 'text-teal-700'}>
                        {fields.length >= 6 ? 'Maximo 6 horarios' : '+ Agregar horario'}
                    </Text>
                </Pressable>

                <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
                    className="bg-black py-4 rounded-lg">
                    <Text className="text-white text-center">
                        {isSubmitting ? "Guardando..." : "Guardar medicamento"}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
    )
}