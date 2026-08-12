import { toma$ } from "@/state/medicacion";
import { batch } from "@legendapp/state";

export function marcarTomada(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'tomada',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null
    })
}

//El usuario decide saltarsela
export function marcarOmitida(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'omitida',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null,
    })
}

export function posponer(tomaId: string, minutos = 15){
    const hasta = new Date(Date.now() + minutos * 60_000)
    toma$[tomaId].assign({
        estado: 'pospuesta',
        registrada_en: null,
        pospuesta_hasta: hasta.toISOString(),
    })
}

export function revertir(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'pendiente',
        registrada_en: null,
        pospuesta_hasta: null,
    })
}

export function marcarTodasTomadas(tomaIds: string[]) {
    batch(() => {
        for (const id of tomaIds) marcarTomada(id)
    })
}