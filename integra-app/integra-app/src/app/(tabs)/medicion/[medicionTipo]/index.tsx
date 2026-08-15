import { medicionDobleSchema, MedicionForm, medicionSchema, OPCIONES_CONTEXTO, valorInicial } from "@/features/medicion/medicion-schema";
import TopBar from "@/components/TopBar";
import { porId } from "@/state/helpers";
import { esDoble, medicion$, TipoMedicion, tipoMedicion$ } from "@/state/medicion";
import { perfil$ } from "@/state/usuario";
import { zodResolver } from "@hookform/resolvers/zod";
import { useValue } from "@legendapp/state/react";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from 'expo-crypto';
import { CampoTexto } from "@/components/CampoTexto";
import { CampoFecha } from "@/components/CampoFecha";
import { CampoSelect } from "@/components/CampoSelect";
import CampoMedicion from "@/features/medicion/CampoMedicion";
import CampoMedicionDoble from "@/features/medicion/CampoMedicionDoble";

export default function AgregarMedicionScreen() {
    const {medicionTipo} = useLocalSearchParams()
    const tipos = useValue(tipoMedicion$)
    const tipo = porId(tipos, medicionTipo as string)

    return (
         <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name={tipo ? `Registrar ${tipo.nombre.toLowerCase()}` : 'Registrar medicion'} canGoBack={true}/>
            </SafeAreaView>

            {tipo ? (
                <Formulario tipo={tipo} />
            ) : (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#0F7C7C"/>
                </View>
            )}
        </View>
    )
}

function Formulario({tipo}: {tipo: TipoMedicion}) {
    const perfil = useValue(perfil$)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const doble = esDoble(tipo)

    const hoy = new Date()
    const valor = valorInicial(tipo.rango_min, tipo.rango_max)
    const valorSecundario = doble ? valorInicial(tipo.rango_min_secundario ?? 0, tipo.rango_max_secundario ?? 0) : undefined

    const {control, handleSubmit, reset} = useForm<MedicionForm>({
        resolver: zodResolver(doble ? medicionDobleSchema : medicionSchema),
        defaultValues: {
            valor: valor,
            valorSecundario: valorSecundario,
            medidoEn: hoy,
            contexto: 'en_ayunas',
            nota: ''
        },
    })

    function generateUUID(): string {
            return Crypto.randomUUID()
        }

    function onSubmit(values: MedicionForm) {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            const id = generateUUID()

            medicion$[id].set({
                id,
                perfil_id: perfil.id,
                tipo_medicion_id: tipo.id,
                valor: values.valor,
                valor_secundario: doble ? values.valorSecundario : undefined,
                medido_en: values.medidoEn,
                contexto: values.contexto,
                nota: values.nota
            })
            reset(values)
            router.navigate({pathname: "/medicion/[medicionTipo]/[resultadoMedicion]" ,
                params: {resultadoMedicion: id}
            })
    
        } catch (error) {
            console.error('No se pudo guardar la medicion', error)
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <ScrollView contentContainerClassName="flex-grow flex px-6 py-6">
            <View className="flex items-center justify-center">
                {doble ? (
                    <CampoMedicionDoble control={control} nombrePrimario="valor" nombreSecundario="valorSecundario" tipo={tipo}/>
                ) : (
                    <CampoMedicion control={control} name="valor" tipo={tipo} doble={false}/>
                )}
            </View>
            
            <View>
                <CampoFecha control={control} name="medidoEn" title="Fecha" placeholder="0"/>
                <CampoSelect control={control} name="contexto" title="Contexto de la medicion" opciones={OPCIONES_CONTEXTO}/>
                <CampoTexto control={control} name="nota" title="Nota" opcional={true}/>
                <Pressable className="bg-black items-center p-6 rounded-lg"
                onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                    <Text className="text-white font-semibold">Guardar medicion</Text>
                </Pressable>
            </View>
        </ScrollView>
    )
}
