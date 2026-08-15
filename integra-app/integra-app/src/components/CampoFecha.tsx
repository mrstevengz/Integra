import { View, Text, TextInput, Pressable, Platform } from 'react-native'
import { Control, FieldValues, Path, useController } from 'react-hook-form'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'

//Campo generico para pasar un DateTimePicker, escoge fecha y hora, o fecha, o hora. (Se le pasa la propiedad 'mode')

type AndroidMode = 'date' | 'datetime' | 'time' | 'countdown'

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    placeholder: string,
    title: string
    mode?: AndroidMode
}

export function CampoFecha<T extends FieldValues>({
    name,
    placeholder,
    title,
    control,
    mode,
}: Props<T>) {

    //Controller para manejar los cambios de valores y el schema de zod
    const {field, fieldState} = useController({name, control})
    const error = fieldState.error?.message
    //Estado para manejar si esta abierto o no
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

    return (
        <View className="mb-4">
            <Text className='mb-2'>{title}</Text>
                    
            <Pressable 
            className={`border rounded-lg py-3 text-slate-900 bg-white flex ${error ? 'border-red-400' : 'border-slate-300'}`}
            onPress={() => setIsDatePickerOpen(true)}>

            {Platform.OS !== "ios" && (
                <Text className={field.value ? 'text-slate-900 pl-4': 'text-slate-400 pl-4'}>
                    {field.value ? field.value.toLocaleDateString('es-CR', 
                    {day: '2-digit', month: 'long', year: 'numeric'}): placeholder}
                </Text> )}
                        
                {isDatePickerOpen && (
                    <DateTimePicker
                    value={field.value ?? new Date(2000,0, 1)}
                    mode={mode}
                    
                    design="material"
                    maximumDate={new Date()}
                    minimumDate={new Date(1930, 0, 1)}
                    onChange={(evento, fecha) => {
                    if (Platform.OS === 'android') setIsDatePickerOpen(false)
                    if (evento.type === 'set' && fecha) field.onChange(fecha)
                    }}
                    />

                    )}
                    {/* //Para hacer espacio dentro del TextInput (en IOS no se puede poner texto dentro, ya que renderiza el componente de la fecha al tocar) */}
                    {!isDatePickerOpen && Platform.OS === 'ios' && (
                        <Text></Text>
                    )}
            </Pressable>
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}