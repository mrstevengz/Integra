import { View, Text } from "react-native"

type VistaPreviaQRProps = {
    texto: string
}

export default function VistaPreviaQR({ texto }: VistaPreviaQRProps) {
    const bloques = texto.split("\n\n")

    return (
        <View className="bg-surface-raised rounded-card border border-line p-5">
            {bloques.map((bloque, i) => {
                const lineas = bloque.split("\n")

                //Primer bloque: identidad. Ultimo: el pie de fecha.
                if (i === 0) {
                    return (
                        <View key={i} className="mb-5">
                            {lineas.map((l, j) => (
                                <Text
                                    key={j}
                                    className={
                                        j === 1
                                            ? "text-heading font-bold text-content"
                                            : "text-caption text-content-muted"
                                    }
                                >
                                    {l}
                                </Text>
                            ))}
                        </View>
                    )
                }

                if (lineas.length === 1) {
                    return (
                        <Text key={i} className="text-caption text-content-subtle mt-3">
                            {lineas[0]}
                        </Text>
                    )
                }

                return (
                    <View key={i} className="mb-5">
                        <Text className="text-label font-bold tracking-wider text-content-subtle mb-2">
                            {lineas[0]}
                        </Text>
                        {lineas.slice(1).map((l, j) => (
                            <Text key={j} className="text-body text-content leading-6">
                                {l}
                            </Text>
                        ))}
                    </View>
                )
            })}
        </View>
    )
}