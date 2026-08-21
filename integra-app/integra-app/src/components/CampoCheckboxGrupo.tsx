import { Control, FieldValues, Path, useController } from "react-hook-form"
import { View, Text, Pressable } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { OpcionPicker } from "./CampoSelect"

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    title: string
    opciones: OpcionPicker[]
}

//Grupo de casillas de seleccion unica. Solo una accion puede esta seleccionada a la vez
export function CampoCheckboxGrupo<T extends FieldValues>({
    name, control, title, opciones
}: Props<T>) {
    const {field, fieldState} = useController({name, control})
    const error = fieldState.error?.message

    return (
        <View className="mb-4">
            <Text className="mb-2 text-lg">{title}</Text>

            <View className={`gap-3 ${opciones.length > 2 ? 'flex-col' : 'flex-row'}`}>
                {opciones.map((opcion) => {
                    const seleccionada = field.value === opcion.valor
                    return (
                        <Pressable
                            key={opcion.valor}
                            onPress={() => field.onChange(opcion.valor)}
                            className={`flex-1 flex-row items-center gap-2 border rounded-lg py-3 px-3 bg-surface-raised ${
                                seleccionada ? 'border-black bg-black/5' : error ? 'border-red-400' : 'border-slate-300'
                            }`}
                        >
                            <Ionicons
                                name={seleccionada ? 'radio-button-on-outline' : 'radio-button-off-outline'}
                                size={25}
                                color={seleccionada ? '#000000' : '#94a3b8'}
                            />
                            <Text className="text-base">{opcion.etiqueta}</Text>
                        </Pressable>
                    )
                })}
            </View>

            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}
