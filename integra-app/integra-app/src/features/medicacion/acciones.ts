import { toma$ } from "@/state/medicacion";
import { batch } from "@legendapp/state";

//Para marcar como tomada, se le asigna al registro de SQLite y se le cambia el estado a tomada, y la fecha en la que fue tomada a hora local.
export function marcarTomada(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'tomada',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null
    })
}

//El usuario decide saltarsela, se marca como omitida y se le manda la fecha de registro
export function marcarOmitida(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'omitida',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null,
    })
}

//El usuario decide posponerla, se cambia el estado a pospuesta y se le agrega los minutos a la fecha de hoy.
export function posponer(tomaId: string, minutos = 15){
    const hasta = new Date(Date.now() + minutos * 60_000)
    toma$[tomaId].assign({
        estado: 'pospuesta',
        registrada_en: null,
        pospuesta_hasta: hasta.toISOString(),
    })
}


//El usuario le da al boton de revertir, regresa la toma a su forma base, estado pendiente y sin registro.
export function revertir(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'pendiente',
        registrada_en: null,
        pospuesta_hasta: null,
    })
}

//Se le pasa un arreglo de IDs de tomas, y las marca todas como tomadas
export function marcarTodasTomadas(tomaIds: string[]) {
    batch(() => {
        for (const id of tomaIds) marcarTomada(id)
    })
}

