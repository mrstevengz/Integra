"use client"

import Link from "next/link"

import { House, Pill, Stethoscope, BookOpenText, ClipboardClock  } from "lucide-react"
import useNavigation from "@/hook/use-navigation"

export default function NavBar() {

    //Importa las constantes de useNavigation
    const {
        isHomeActive,
        isCitasActive,
        isMedicamentosActive,
        isMedicionesActive
    } = useNavigation()

        //Si no esta en ninguna de estas paginas, no renderizar nada
        if (!isHomeActive && !isCitasActive && !isMedicamentosActive && !isMedicionesActive) {
            return 
        }

        return(
        //Navbar fijado abajo y se esconde en resoluciones grandes
        <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-center mb-8 sm:hidden">
            <div className="flex flex-row items-center justify-around gap-10 backdrop-blur-md bg-white/30 border border-white/20 rounded-full p-4 shadow-md">
                <Link href="/inicio" className={`flex items-center justify-center rounded-full p-3 transition-colors  ${isHomeActive ? "bg-black/75 text-white" : "text-black/60 "}`}>
                    <House size={25} strokeWidth={2}/>
                </Link>
                <Link href="/medicamentos" className={`flex items-center justify-center rounded-full p-3 ${isMedicamentosActive ? "bg-black/75 text-white" : "text-black/60"}`}>
                    <Pill size={25} strokeWidth={2}/>
                </Link>
                <Link href="/mediciones" className={`flex items-center justify-center rounded-full p-3  ${isMedicionesActive ? "bg-black/75 text-white" : "text-black/60"}`}>
                    <Stethoscope size={25} strokeWidth={2}/>
                </Link>
                <Link href="/citas" className={`flex items-center justify-center rounded-full p-3 ${isCitasActive ? "bg-black/75 text-white" : "text-black/60"}`}>
                    <ClipboardClock size={25} strokeWidth={2}/>
                </Link>
            </div>
        </div>
    )
}