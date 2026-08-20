import { router, useLocalSearchParams } from "expo-router";
import { useValue } from "@legendapp/state/react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "@/components/TopBar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CampoTexto } from "@/components/CampoTexto";
import { CampoSelect } from "@/components/CampoSelect";
import { contactoEmergencia$} from "@/state/contactosemergencia";
import { retornarObjetoPorId } from "@/state/helpers";
import { EmergenciaForm, emergenciaSchema, TIPO_RELACION } from "@/features/perfil/emergencia-schema";

export default function EditarCondicion() {
    const {contactoId} = useLocalSearchParams()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const contactosLista = useValue(contactoEmergencia$)
    const item = retornarObjetoPorId(contactosLista, contactoId as string)

    const {control, handleSubmit, reset, formState: {isDirty}} = useForm<EmergenciaForm>({

        resolver: zodResolver(emergenciaSchema),
        mode: 'onTouched',
        defaultValues: {
            nombre: '',
            relacion: '',
            telefono: ''
        },

        values: item ? {
            nombre: item.nombre,
            relacion: item.relacion,
            telefono: item.telefono,
        }: undefined
    })


    function onSubmit(formValues: EmergenciaForm) {
        if (!item) return
        const id = item.id
        try {
            contactoEmergencia$[id].assign!({
            nombre: formValues.nombre,
            relacion: formValues.relacion,
            telefono: formValues.telefono
            })

            reset(formValues)
            router.back()
        } catch (error) {
            console.error('No se pudo guardar el contacto de emergencia', error)
        } finally {
            setIsSubmitting(false)
        }
       
    }

    if (!item) {
        return (
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-gray-400">Error</Text>
            </View>
        )
    }

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Editar' canGoBack={true}/>
            </SafeAreaView>
            <ScrollView contentContainerClassName="flex-1 px-6 py-6">
                <CampoTexto name="nombre" control={control} title="Nombre"/>
                
                <CampoTexto name="telefono" control={control} title="Numero telefonico" keyboardType="phone-pad"/>
                
                <CampoSelect name="relacion" control={control} title="Tipo de relacion" opciones={TIPO_RELACION}/>
            
                <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting || !isDirty}
                    className="bg-black py-4 rounded-lg">
                    <Text className="text-white text-center">
                        {isSubmitting? "Guardando..." : "Guardar contacto de emergencia"}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}