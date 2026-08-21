import { convertirALista } from "@/state/consultas";
import { tomas$ } from "@/state/tomas";
import { batch } from "@legendapp/state";

//Para marcar como tomada, se le asigna al registro de SQLite y se le cambia el estado a tomada, y la fecha en la que fue tomada a hora local.
export function marcarComoTomada(tomaId: string) {
    tomas$[tomaId].assign({
        estado: 'tomada',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null
    })
}

//El usuario decide saltarsela, se marca como omitida y se le manda la fecha de registro
export function marcarComoOmitida(tomaId: string) {
    tomas$[tomaId].assign({
        estado: 'omitida',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null,
    })
}

//El usuario decide posponerla, se cambia el estado a pospuesta y se le agrega los minutos a la fecha de hoy.
export function posponerToma(tomaId: string, minutos = 15){
    const hasta = new Date(Date.now() + minutos * 60_000)
    tomas$[tomaId].assign({
        estado: 'pospuesta',
        registrada_en: null,
        pospuesta_hasta: hasta.toISOString(),
    })
}


//El usuario le da al boton de revertir, regresa la toma a su forma base, estado pendiente y sin registro.
export function revertirAccion(tomaId: string) {
    tomas$[tomaId].assign({
        estado: 'pendiente',
        registrada_en: null,
        pospuesta_hasta: null,
    })
}

//Se le pasa un arreglo de IDs de tomas, y las marca todas como tomadas
export function marcarTodasTomadas(tomaIds: string[]) {
    //batch() acepta una funcion que se va a realizar en LegendState varias veces.
    batch(() => {
        for (const id of tomaIds) marcarComoTomada(id)
    })
}

//Revertir marcar todas tomadas
export function revertirTodasTomadas(tomaIds: string[]) {
     batch(() => {
        for (const id of tomaIds) revertirAccion(id)
    })
}

//Elimina las tomas futuras con estado 'pendiente' (esto es para cuando se edite una toma, se creen nuevos horarios basado en el cambio que hubo)
export function eliminarTomasFuturasPendientes(medicamentoId: string) {
    const hoy = new Date()

    //Filtra la lista de tomas para obtener las tomas que tienen el id del medicamento que le paso, tienen estado pendiente o pospuesto, y la fecha de programado es hoy o mayor (al futuro)
    const aEliminar = convertirALista(tomas$.get()).filter((t) => 
        t.medicamento_id === medicamentoId && (t.estado === 'pendiente' || t.estado === 'pospuesta')
    )

    //Para cada toma, eliminarla (se generara una nueva al confirmar el editar)
    batch(() => {
        for (const t of aEliminar) tomas$[t.id].delete()
    })
}

