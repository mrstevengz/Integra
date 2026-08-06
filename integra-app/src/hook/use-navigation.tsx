'use client'

import { usePathname } from "next/navigation"

export default function useNavigation() {
    //usePathname obtiene el nombre de la ruta donde se encuentra el usuario
    const pathname = usePathname()

    return {
        //Variables sencillas, devuelve true si el pathname coincide con la ruta, si no falso.
        isHomeActive: pathname === '/inicio',
        isCitasActive: pathname === '/citas',
        isMedicamentosActive: pathname === '/medicamentos',
        isMedicionesActive: pathname === '/mediciones'
    }

}