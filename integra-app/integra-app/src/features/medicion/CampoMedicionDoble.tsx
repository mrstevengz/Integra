import { TipoMedicion } from "@/state/medicion";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { useState } from "react";
import { TextInput, Text, View, Pressable } from "react-native";
import { pasoDe } from "./medicion-schema";

type Props<T extends FieldValues> = {
    control: Control<T>
    nombrePrimario: Path<T>
    nombreSecundario: Path<T>
    tipo: TipoMedicion
}

export default function CampoMedicionDoble<T extends FieldValues>({control, nombrePrimario, nombreSecundario, tipo}: Props<T>) {
    const primario = useController({name: nombrePrimario, control})
    const secundario = useController({name: nombreSecundario, control})

    const [activo, setActivo] = useState<'primario' | 'secundario'>('primario')
    const campoActivo = activo === 'primario' ? primario : secundario

    const errorPrimario = primario.fieldState.error?.message
    const errorSecundario = secundario.fieldState.error?.message

    const pasoPrimario = pasoDe(tipo.rango_min, tipo.rango_max)
    const pasoSecundario = pasoDe(tipo.rango_min_secundario ?? 0, tipo.rango_max_secundario ?? 0)
    const paso = activo === 'primario' ? pasoPrimario : pasoSecundario

    const etiquetaActiva = activo === 'primario' ? tipo.etiqueta_principal : tipo.etiqueta_secundaria

    const handleButton = (amount: number, type: 'add' | 'restar') => {
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
                <Pressable
                    onPress={() => handleButton(paso, 'restar')}
                    className="bg-transparent border-slate-300 border rounded-xl px-6 py-2">
                    <Text className="text-[40px]">-</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleButton(paso, 'add')}
                    className="bg-black border rounded-xl px-6 py-2">
                    <Text className="text-[40px] text-white">+</Text>
                </Pressable>
            </View>
        </View>
    )
}
