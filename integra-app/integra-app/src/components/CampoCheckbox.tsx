import { Control, FieldValues, Path, useController } from "react-hook-form"
import { View, Text, Pressable } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    title: string
}

//Casilla individual, guarda un booleano
export function CampoCheckbox<T extends FieldValues>({
    name, control, title
}: Props<T>) {
    const {field} = useController({name, control})
    const activo = !!field.value

    return (
        <Pressable onPress={() => field.onChange(!activo)} className="flex-row items-center gap-2">
            <Ionicons
                name={activo ? 'radio-button-on-outline' : 'radio-button-off-outline'}
                size={22}
                color={activo ? '#000000' : '#94a3b8'}
            />
            <Text className="text-lg">{title}</Text>
        </Pressable>
    )
}
