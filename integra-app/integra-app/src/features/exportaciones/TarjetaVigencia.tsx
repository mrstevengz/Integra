import Ionicons from "@expo/vector-icons/Ionicons"
import { Pressable, Text, View } from "react-native"
import { color } from "@/theme/colors"

type TarjetaVigenciaProps = {
    etiqueta: string
    detalle: string
    activa: boolean
    onPress: () => void
}

export default function TarjetaVigencia({ etiqueta, detalle, activa, onPress }: TarjetaVigenciaProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center gap-3 p-4 mb-3 rounded-card border ${
                activa
                    ? 'border-content bg-surface-raised'
                    : 'border-line bg-surface-raised active:bg-surface-sunken'
            }`}
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