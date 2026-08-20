import { TipoMedicion } from "@/state/medicion";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { useState } from "react";
import { TextInput, Text, View, TouchableOpacity } from "react-native";
import { alHacerPaso } from "./medicion-schema";

//Tipo de TS generico para pasar un 'FieldValue', que es un tipo de 'react-hook-forms' que recibe un nombre y un controlador. 
//Para el campo de presion arterial, existen DOS valores a cambiar. Por lo tanto, el form debe cambiar. Recibe el controlador y el nombre primario y secundario de los valores del schema de zod. El tipo de presion arterial es el unico al que se le pasan valor primario y valor secundario
type Props<T extends FieldValues> = {
    control: Control<T>
    nombrePrimario: Path<T>
    nombreSecundario: Path<T>
    tipo: TipoMedicion
}

export default function CampoMedicionDoble<T extends FieldValues>({control, nombrePrimario, nombreSecundario, tipo}: Props<T>) {

    //Dos valores para los dos campos (se tratan como campos diferentes (lo son))
    const primario = useController({name: nombrePrimario, control})
    const secundario = useController({name: nombreSecundario, control})

    //UseState para determinar que valor esta 'activo' (cuando el usuario presiona sobre el numero)
    const [activo, setActivo] = useState<'primario' | 'secundario'>('primario')

    //Variable para retornar un booleano y saber que campo esta activo
    const campoActivo = activo === 'primario' ? primario : secundario

    //Errores de zod para ambos campos
    const errorPrimario = primario.fieldState.error?.message
    const errorSecundario = secundario.fieldState.error?.message

    //Determina la cantidad que se avanza, segun el campo
    const pasoPrimario = alHacerPaso(tipo.rango_min, tipo.rango_max)
    const pasoSecundario = alHacerPaso(tipo.rango_min_secundario ?? 0, tipo.rango_max_secundario ?? 0)

    //Para manejar una sola variable al hacer el paso, y revisar si esta activo antes de cambiar el numero
    const paso = activo === 'primario' ? pasoPrimario : pasoSecundario

    //Para manejar en el UI que etiqueta esta activa
    const etiquetaActiva = activo === 'primario' ? tipo.etiqueta_principal : tipo.etiqueta_secundaria

    //Agrega o resta segun el campo
    const botonManejarClick = (amount: number, type: 'add' | 'restar') => {
        const currVal = Number(campoActivo.field.value) || 0
        if (type === 'add') campoActivo.field.onChange(currVal + amount)
        else campoActivo.field.onChange(currVal - amount)
    }

    return (
        <View className="flex flex-col pb-10 items-center">
            <View className="flex flex-row items-center gap-2">
                <TextInput
                    value={primario.field.value !== undefined && primario.field.value !== null ? String(primario.field.value) : ''}
                    onChangeText={primario.field.onChange}
                    onBlur={primario.field.onBlur}
                    onFocus={() => setActivo('primario')}
                    keyboardType="phone-pad"
                    className={`text-slate-900 font-bold text-[60px] ${activo === 'primario' ? 'opacity-100' : 'opacity-40'} ${errorPrimario && 'text-red-600'}`}
                />
                <Text className="text-[40px] text-slate-400">/</Text>
                <TextInput
                    value={secundario.field.value !== undefined && secundario.field.value !== null ? String(secundario.field.value) : ''}
                    onChangeText={secundario.field.onChange}
                    onBlur={secundario.field.onBlur}
                    onFocus={() => setActivo('secundario')}
                    keyboardType="phone-pad"
                    className={`text-slate-900 font-bold text-[60px] ${activo === 'secundario' ? 'opacity-100' : 'opacity-40'} ${errorSecundario && 'text-red-600'}`}
                />
            </View>

            <Text className="text-slate-500 mt-1">{tipo.unidad}</Text>

            {(errorPrimario || errorSecundario) && (
                <Text className="text-red-600 text-sm mt-1">{errorPrimario ?? errorSecundario}</Text>
            )}

            {etiquetaActiva && (
                <Text className="text-slate-500 text-sm mt-3">Ajustando: {etiquetaActiva}</Text>
            )}

            <View className="flex flex-row items-center gap-6 mt-2">
                <TouchableOpacity
                    onPress={() => botonManejarClick(paso, 'restar')}
                    className="bg-transparent border-slate-300 border rounded-xl px-6 py-2">
                    <Text className="text-[40px]">-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => botonManejarClick(paso, 'add')}
                    className="bg-black border rounded-xl px-6 py-2">
                    <Text className="text-[40px] text-white">+</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
