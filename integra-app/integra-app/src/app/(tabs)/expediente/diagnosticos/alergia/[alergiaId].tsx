import { retornarObjetoPorId } from "@/state/helpers";
import { router, useLocalSearchParams } from "expo-router";
import { useValue } from "@legendapp/state/react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "@/components/TopBar";
import { AlergiasForm, alergiasSchema, SEVERIDAD_ALERGIA} from "@/features/condicion/condiciones-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CampoTexto } from "@/components/CampoTexto";
import { CampoSelect } from "@/components/CampoSelect";
import { alergia$ } from "@/state/alergia";

export default function EditarCondicion() {
    const {alergiaId} = useLocalSearchParams()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const alergiasLista = useValue(alergia$)
    const item = retornarObjetoPorId(alergiasLista, alergiaId as string)

    const {control, handleSubmit, reset} = useForm<AlergiasForm>({

        resolver: zodResolver(alergiasSchema),
        mode: 'onTouched',
        defaultValues: {
            nombre: '',
            severidad: '',
            detalles: ''
        },

        values: item ? {
            nombre: item.nombre,
            severidad: item.severidad,
            detalles: item.detalles,
        }: undefined
    })


    function onSubmit(formValues: AlergiasForm) {
        if (!item) return
        const id = item.id
        try {
            alergia$[id].assign!({
            nombre: formValues.nombre,
            severidad: formValues.severidad,
            detalles: formValues.detalles
            })

            reset(formValues)
            router.back()
        } catch (error) {
            console.error('No se pudo guardar la alergia', error)
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
                <CampoTexto name="nombre" control={control} title="Nombre de la condicion"/>
            
                <CampoSelect name="severidad" control={control} title="Tipo de condicion" opciones={SEVERIDAD_ALERGIA}/>
            
                <CampoTexto name="detalles" control={control} title="Detalles de la condicion (opcional)"/>
            
                <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
                    className="bg-black py-4 rounded-lg">
                    <Text className="text-white text-center">
                        {isSubmitting? "Guardando..." : "Guardar condicion"}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}