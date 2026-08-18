import { color } from "@/theme/colors"
import { GlassView } from "expo-glass-effect"
import { router } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { ReactNode } from "react"
import { Platform, Pressable, Text, TouchableOpacity, View } from "react-native"


//Topbar para todas las pantallas de la aplicacion. Aqui se puede modificar. Acepta el titulo y un booleano, para permitir retornar o no. (En las pantallas principales de (tabs) no se retorna)
type TopBarProps = {
    name: string
    canGoBack: boolean,
    grande?: boolean,
    subtitulo?: string     
    accion?: () => void      
    accionIcono?: ReactNode
    accionLabel?: string
}

export default function TopBar({
    name, canGoBack,
    grande = false, subtitulo, accion, accionIcono, accionLabel = 'Acción',
}: TopBarProps) {
   if (grande) {
        return (
            <View className="bg-surface px-5 pt-2 pb-3 flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                    {subtitulo && (
                        <Text className="text-caption text-content-muted" numberOfLines={1}>
                            {subtitulo}
                        </Text>
                    )}
                    <Text
                        className="text-large-title font-bold text-content"
                        style={{ letterSpacing: -0.8 }}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                </View>

                {accion && (
                    <Pressable
                        onPress={accion}
                        accessibilityRole="button"
                        accessibilityLabel={accionLabel}
                        hitSlop={8}
                        android_ripple={{ color: color.border, borderless: true, radius: 22 }}
                        style={{ height: 40, width: 40, marginTop: subtitulo ? 18 : 2 }}
                        className="rounded-full bg-surface-raised border border-line items-center justify-center active:bg-surface-sunken"
                    >
                        {accionIcono}
                    </Pressable>
                )}
            </View>
        )
    }

    //Variante compacta
    return (
        <View className="relative flex-row items-center justify-center px-2 py-3 bg-surface border-b border-line">
            {canGoBack && (
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                    android_ripple={{ color: color.border, borderless: true, radius: 22 }}
                    style={{ minHeight: 44, minWidth: 44 }}
                    className="absolute left-2 items-center justify-center rounded-full active:bg-surface"
                >
                    <ChevronLeft size={26} color={color.content} />
                </Pressable>         
            )}

            <Text className="text-subheading font-bold text-content px-14" numberOfLines={1}>
                {name}
            </Text>
        </View>
    )
}