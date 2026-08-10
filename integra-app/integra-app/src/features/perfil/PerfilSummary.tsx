import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

type PerfilSummaryProps = {
    nombre: string;
    edad: string;
    genero: string | null
    cedula: string | null
}

export default function PerfilSummary({nombre, edad, genero, cedula}: PerfilSummaryProps) {
    return (
        <Pressable className="flex flex-row gap-4 p-4 border-b border-black/20 active:bg-black/5"
            onPress={() => router.navigate("/expediente/perfil")}>
            <View className="flex-2 w-24 h-24 rounded-full flex items-center justify-center bg-slate-300">
                <Ionicons name="person-sharp" size={40}/>
            </View>
            <View className="flex-1">
                <Text className="text-3xl font-semibold">{nombre}</Text>
                <Text className="text-lg color-black/50">{edad} años | {genero ? genero : 'Por definir'}</Text>
                <Text className="text-lg color-black/50">Cedula: {cedula ? cedula : 'Por definir'}</Text>
            </View>
        </Pressable>
    )
}