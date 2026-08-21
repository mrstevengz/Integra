import { View, Text } from "react-native"
import type { EstadoExportacion as Estado } from "@/state/exportaciones"

const ESTILOS: Record<Estado, { etiqueta: string; borde: string; texto: string }> = {
    activa:   { etiqueta: "Activo",   borde: "border-success",     texto: "text-success" },
    vencida:  { etiqueta: "Vencido",  borde: "border-line-strong", texto: "text-content-muted" },
    revocada: { etiqueta: "Revocado", borde: "border-danger",      texto: "text-danger" },
}

export default function EstadoExportacion({ estado }: { estado: Estado }) {
    const e = ESTILOS[estado]

    return (
        <View className={`self-start rounded-chip border px-2 py-0.5 ${e.borde}`}>
            <Text className={`text-caption font-semibold ${e.texto}`}>{e.etiqueta}</Text>
        </View>
    )
}