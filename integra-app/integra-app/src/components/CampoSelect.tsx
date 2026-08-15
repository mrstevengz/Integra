import { Control, FieldValues, Path, useController } from "react-hook-form";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import ModalPicker from 'rn-modal-picker'

//Componente generico que exporta un picker (dropdown para escoger opciones)

//Se pasan los props que aceptan un tipo
type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    title: string,
    opciones: OpcionPicker[] //Este es el array de opciones, de tipo opcion-picker
}

//El tipo opcion picker almacena dos valores, el valor que se mandara a la base de datos, y la etiqueta que se muestra en la pantalla
export type OpcionPicker = {
    valor: string;
    etiqueta: string
}


export function CampoSelect<T extends FieldValues>({
    name, control, title, opciones
}: Props<T>) {

    //Controlador de react-hook-forms. Para cada campo que se pase en el form, el nombre del campo debe ser igual al tipo que se le pase en el schema de Zod.
    //Los campos que salen en el schema de zod son los unicos nombres validos que va a permitir el form en "name", hace esto para reconocer los errores especificos y las propiedades que se les pasan
    const {field, fieldState} = useController({name, control})

    //Mensaje de error que manda zod
    const error = fieldState.error?.message


    const datos = opciones.map((o) => ({ ...o, name: o.etiqueta }))
    const seleccionada = opciones.find((o) => o.valor === field.value)


    return (
        <View className="mb-4">
            <Text className="mb-2">{title}</Text>

            <ModalPicker
                data={datos}
                value={seleccionada?.etiqueta ?? ''}
                onChange={(item: OpcionPicker) => field.onChange(item.valor)}
                animationType="slide"
                hideSearchBar={opciones.length < 8}
                placeHolderText={''}
                placeHolderTextColor="#94a3b8"

                pickerContainerStyle={{
                    borderWidth: 1,
                    borderColor: error ? '#f87171' : '#cbd5e1',
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    alignItems: 'center',
                    backgroundColor: '#ffffff'
                }}

                selectedTextStyle={{ color: '#0f172a', fontSize: 14, textAlign: 'left' }}
                listTextStyle={{ color: '#0f172a', fontSize: 18 }}
                itemSeparatorStyle={{ backgroundColor: '#e2e8f0' }}
                dropDownIconStyle={{ tintColor: '#64748b', width: 20, height: 12 }}
            />

            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
        
    )
}