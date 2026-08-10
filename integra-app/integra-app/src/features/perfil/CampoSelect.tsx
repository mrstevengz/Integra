import { Control, FieldValues, Path, useController } from "react-hook-form";
import {Picker} from '@react-native-picker/picker';
import { View, Text, Pressable } from "react-native";
import { OPCIONES_GENEROS } from "./perfil-schema";
import { useRef, useState } from "react";

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    title: string,
    opciones: OpcionPicker[]
}

export type OpcionPicker = {
    valor: string;
    etiqueta: string
}


export function CampoSelect<T extends FieldValues>({
    name, control, title, opciones
}: Props<T>) {

    const {field, fieldState} = useController({name, control})
    const error = fieldState.error?.message

    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const pickerRef = useRef(null)

    return (
        <View className="mb-4">
            <Text>{title}</Text>

            <Pressable 
            className={`border rounded-lg py-3 text-slate-900 flex ${error ? 'border-red-400' : 'border-slate-300'}`}
            onPress={() => setIsPickerOpen(true)}>

            {isPickerOpen ? (
                <Picker
                ref={pickerRef}
                selectedValue={field.value}
                onValueChange={(value, index) => {
                    field.onChange(value)
                    setTimeout(() => {
                        setIsPickerOpen(false)
                    }, 1000)
                }}>
                {opciones.map((opcion) => (
                    <Picker.Item value={opcion.valor} label={opcion.etiqueta}/>
                ))}
                </Picker>
            ) : (
                <Text className="pl-4">{field.value}</Text>
            )}
            
            </Pressable>

        {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
        
    )
}