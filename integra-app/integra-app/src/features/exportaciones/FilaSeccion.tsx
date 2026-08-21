import Ionicons from "@expo/vector-icons/Ionicons"
import { Pressable, Text, View } from "react-native"
import { color } from "@/theme/colors"

type FilaSeccionProps = {
    etiqueta: string
    detalle: string
    activa: boolean
    onPress: () => void
}

export default function FilaSeccion({ etiqueta, detalle, activa, onPress }: FilaSeccionProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-start gap-3 py-4 border-b border-line active:bg-surface-sunken"
        >
            <Ionicons
                name={activa ? 'radio-button-on-outline' : 'radio-button-off-outline'}
                size={24}
                color={activa ? color.content : color.contentDisabled}
            />
            <View className="flex-1">
                <Text className="text-body text-content">{etiqueta}</Text>
                <Text className="text-caption text-content-subtle mt-1">{detalle}</Text>
            </View>
        </Pressable>
    )
}