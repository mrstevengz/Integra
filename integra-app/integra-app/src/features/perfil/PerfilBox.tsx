import { Link, router } from "expo-router";
import { View, Text } from "react-native";

type PerfilBoxProps = {
    titulo: string;
    children: React.ReactNode
    link: string
    linkName: string
}

type PerfilBoxTextProps = {
    titulo: string
    data: string | null
}

//PerfilBox funciona como un contenedor para PerfilBoxText. Recibe un titulo, link y nombre del link, y se le pasa mas componentes en {children}
export default function PerfilBox({titulo, children, link, linkName}: PerfilBoxProps) {
    return (
        <View className="flex flex-col">
            <View className="flex flex-row justify-between items-center px-4 my-4">
                <Text className="text-neutral-700 text-md font-semibold uppercase tracking-wider"
                onPress={() => router.navigate(link)}>{titulo}</Text>
                <Link className = "font-light text-black/40 active:text-black" href={link}>{linkName}</Link>
            </View>
            {children}
        </View>
    )
}

//Fila para poner dentro de PerfilBox y renderizar la informacion del usuario. Recibe un campo generico de data (puede ser fecha de nacimiento, doctor, etc) y un titulo que se le da en la pantalla
export function PerfilBoxText({titulo, data}: PerfilBoxTextProps) {
    return (
    <View className="flex flex-row justify-between p-4 px-5 bg-white border-b-2 border-black/20 group-active:bg-slate-200 ">
        <Text className="text-black/50">{titulo}</Text>
        <Text>{data ?? 'Sin definir'}</Text>
    </View>
    )
}