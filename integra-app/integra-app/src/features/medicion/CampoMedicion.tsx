import { esDoble, TipoMedicion } from "@/state/medicion";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { TextInput, Text, View, Pressable, TouchableOpacity } from "react-native";
import { pasoDe, redondear } from "./medicion-schema";

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    tipo: TipoMedicion
    doble: boolean
}

export default function CampoMedicion<T extends FieldValues>({name, control, tipo, doble}: Props<T>) {
    const {field, fieldState} = useController({name, control})

    const error = fieldState.error?.message
    
    const paso = pasoDe(tipo.rango_min, tipo.rango_max)
    
    const handleButton = (amount: number, type: string) => {
        const currVal = Number(field.value) || 0

        if (type === 'add') field.onChange(redondear((currVal + amount)))
        else field.onChange(redondear((currVal - amount)))
        
    }

    return (
        <View className="flex flex-col pb-10">
            <View className={`flex ${doble ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                <TextInput
                value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="phone-pad"
                className={` text-slate-900 font-bold text-[80px] ${error && 'text-red-600'}`}
                />
                {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}

                <Text>{tipo.unidad}</Text>
            </View>
            <View className="flex flex-row items-center gap-6">
                <TouchableOpacity
                onPress={() => handleButton(paso, 'restar')}
                className="bg-transparent border-slate-300 border rounded-xl px-6 py-2">
                    <Text className="text-[40px]">-</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-black border rounded-xl px-6 py-2"
                onPress={() => handleButton(paso, 'add')}>
                    <Text className="text-[40px] text-white">+</Text>
                </TouchableOpacity>
            </View>
           
        </View>
    )
}