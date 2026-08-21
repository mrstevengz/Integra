import { Bandage, Droplet, Pill, Pipette, Syringe, Tablets, TestTubes, Wind } from 'lucide-react-native'
import { type FormaFarmaceutica } from "@/state/medicamentos"
import { color } from "@/theme/colors"

const ICONOS: Record<FormaFarmaceutica, typeof Pill> = {
    tableta: Tablets,
    capsula: Pill,
    jarabe: Droplet,
    suspension: TestTubes,
    inyeccion: Syringe,
    gotas: Pipette,
    crema: Droplet,
    inhalador: Wind,
    supositorio: Pill,
    parche: Bandage,
}

export function iconoDeForma(forma: FormaFarmaceutica | undefined) {
    const Icono = forma ? ICONOS[forma] : Pill
    return <Icono color={color.contentMuted}/>
}
