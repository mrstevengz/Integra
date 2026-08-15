import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View, Text } from "react-native";

export type ContactoEmergenciaProps = {
    nombre: string;
    relacion: string
    telefono: string
    onPress: () => void
}

export default function ContactoEmergenciaBox({nombre, relacion, telefono, onPress}: ContactoEmergenciaProps) {
    return (
         <Pressable className="flex flex-row items-center gap-3 p-4 px-5 bg-white border-b-2 border-black/20 active:bg-slate-200"
            onPress={onPress}>
            <Ionicons size={28} name="person-circle"/>
        
            <View className="flex-1">
                <Text className="text-lg font-semibold">{nombre}</Text>
            <View className="flex flex-row gap-2">
                <Text className="text-black/50">{relacion ?? 'Sin definir'}</Text>
                <Text className="text-black/30">·</Text>
                <Text className="text-black/50">{telefono ?? 'Sin definir'}</Text>
            </View>
            </View>
        </Pressable>
    )
}