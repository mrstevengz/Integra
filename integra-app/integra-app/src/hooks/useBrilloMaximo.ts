import { useCallback } from "react"
import { useFocusEffect } from "expo-router"
import * as Brightness from "expo-brightness"

export function useBrilloMaximo(activo: boolean) {
    useFocusEffect(
        useCallback(() => {
            if (!activo) return

            let previo: number | null = null
            let cancelado = false

            ;(async () => {
                try {
                    previo = await Brightness.getBrightnessAsync()
                    if (!cancelado) await Brightness.setBrightnessAsync(1)
                } catch (e) {
                    console.warn('[brillo] no se pudo ajustar', e)
                }
            })()

            return () => {
                cancelado = true
                if (previo != null) Brightness.setBrightnessAsync(previo).catch(() => {})
            }
        }, [activo]),
    )
}