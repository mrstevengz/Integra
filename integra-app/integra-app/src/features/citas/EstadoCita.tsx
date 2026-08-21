import { View, Text } from "react-native"

//Una entrada por cada valor del enum tipo_resultado de la base.
const ESTILOS: Record<string, { etiqueta: string; borde: string; texto: string }> = {
    "asistida":    { etiqueta: "Asistida",    borde: "border-success", texto: "text-success" },
    "no asistida": { etiqueta: "No asistida", borde: "border-warning", texto: "text-warning-on-subtle" },
    "cancelada":   { etiqueta: "Cancelada",   borde: "border-danger",  texto: "text-danger" },
}

export default function EstadoCita({ resultado }: { resultado: string }) {
    const e = ESTILOS[resultado] ?? {
        etiqueta: resultado, borde: "border-line-strong", texto: "text-content-muted",
    }

    return (
        <View className={`self-start rounded-chip border px-2 py-0.5 ${e.borde}`}>
            <Text className={`text-caption font-semibold ${e.texto}`}>{e.etiqueta}</Text>
        </View>
    )
}