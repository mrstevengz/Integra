import { View, Text, Pressable, Platform, TouchableWithoutFeedback, Modal, TouchableOpacity } from 'react-native'
import { Control, FieldValues, Path, useController } from 'react-hook-form'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { GlassView} from 'expo-glass-effect'


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
    const [tempDate, setTempDate] = useState(field.value ?? new Date(2000, 0, 1))
    const [tempTime, setTempTime] = useState(field.value ?? new Date())

    const abrirPicker = () => {
    if (mode === 'time') {
        setTempTime(field.value ?? new Date())
    } else {
        setTempDate(field.value ?? new Date(2000, 0, 1))
    }
    setIsDatePickerOpen(true)
}

    const confirmarIOS = () => {
    field.onChange(mode === 'time' ? tempTime : tempDate)
    setIsDatePickerOpen(false)
    }

    const cancelarIOS = () => setIsDatePickerOpen(false)
    
    return (
        <View className="mb-4">
            <Text className='mb-2 text-lg'>{title}</Text>
                    
            <Pressable
                className={`border rounded-lg py-4 px-4 bg-white flex ${error ? 'border-red-400' : 'border-slate-300'}`}
                onPress={abrirPicker}>
                <Text numberOfLines={1}
                    ellipsizeMode="tail"
                    className={field.value ? 'text-slate-900 text-lg' : 'text-slate-400 text-lg'}
                    >
                    {field.value
                    ? mode === 'time'
                    ? field.value.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
                    : field.value.toLocaleDateString('es-CR', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })
                    : placeholder}

                </Text>
            </Pressable>

        {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        
        {isDatePickerOpen && Platform.OS === 'android' && (
                <DateTimePicker
                    value={field.value ?? (mode === 'time' ? new Date() : new Date(2000, 0, 1))}

                    mode={mode}
                    design="material"
                    minimumDate={new Date(1930, 0, 1)}
                    onChange={(evento, fecha) => {
                        setIsDatePickerOpen(false)
                        if (evento.type === 'set' && fecha) field.onChange(fecha)
                    }}
                />
        )}

        {Platform.OS === 'ios' && (
                <Modal
                    visible={isDatePickerOpen}
                    transparent
                    animationType="slide"
                    onRequestClose={cancelarIOS}
                >
                    <TouchableWithoutFeedback onPress={cancelarIOS}>
                        <View className="flex-1 justify-end bg-black/40">
                        <TouchableWithoutFeedback>
                                <View className="bg-white rounded-t-2xl pb-8" style={{ minHeight: 200 }}>
                                    <View className="flex-row justify-between items-center px-4 py-3 border-b border-slate-200">
                                        <GlassView
                                        style={{ borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
                                        glassEffectStyle="regular"
                                        tintColor="#e2e8f0"
                                        isInteractive
                                    >

                                            <TouchableOpacity onPress={cancelarIOS}>
                                                <Text className="text-slate-500 text-base">Cancelar</Text>
                                            </TouchableOpacity>
                                        </GlassView>

                                        <Text className="text-slate-900 font-semibold">{title}</Text>

                                        <GlassView
                                        style={{ borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
                                        glassEffectStyle="regular"
                                        tintColor="#e2e8f0"
                                        isInteractive
                                        >

                                            <TouchableOpacity onPress={confirmarIOS}>
                                                <Text className="text-blue-600 font-semibold text-base">Listo</Text>
                                            </TouchableOpacity>
                                        </GlassView>
                                    </View>

                                    <View className="items-center">
                                        <DateTimePicker
                                            value={mode === 'time' ? tempTime : tempDate}
                                            mode={mode}
                                            is24Hour={false}
                                            display="spinner"
                                            themeVariant="light"
                                            locale="es-ES"
                                            style={{ width: '100%', height: 220 }}
                                            minimumDate={new Date(1930, 0, 1)}
                                            onChange={
                                            (_, fecha) => {
                                                    if (!fecha) return
                                                    if (mode === 'time') setTempTime(fecha)
                                                    else setTempDate(fecha)
                                                }
                                            }
                                        />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>

    )
}