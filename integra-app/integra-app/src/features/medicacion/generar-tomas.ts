import { comoLista } from "@/state/helpers"
import * as Crypto from 'expo-crypto'
import { medicamento$, medicamentosActivos, partirHora, Toma, toma$ } from "@/state/medicacion"
import { batch, syncState } from "@legendapp/state"

const DIAS_ATRAS = 7 //Variable que determina cuantos dias atras va a generar tomas

//Funcion para generar clave unica por toma Y poder chequearla a nivel local. Tiene dos componentes: el id del medicamento (puede ser igual en varias tomas) y el DateTime donde fue programado. Si queremos chequear si una toma es igual que la otra, la clave compara estas dos cosas hasta el segundo que se agrego. Asi se puede revisar si YA existe esa toma.

//Mismo par que el UNIQUE de la tabla toma
function generarClave(medicamentoId: string, programada: Date): string {
    return `${medicamentoId}|${programada.getTime()}`
} 

//Funcion para crear las filas de dosis que faltan. Devuelve el numero que creo
export function generarTomasPendientes(perfilId: string): number {
    
    const estadoTomas = syncState(toma$)
    const estadoMeds = syncState(medicamento$)

    if (!estadoTomas.isPersistLoaded.get()) return 0
    if (!estadoMeds.isPersistLoaded.get()) return 0

    if (!estadoTomas.isLoaded.get()) return 0
    if (!estadoMeds.isLoaded.get()) return 0

    //Se filtra la lista de medicamentos por los que tienen activos, y los ordena
    const medicamentos = medicamentosActivos(medicamento$.get(), perfilId)
    //Si no hay medicamentos activos, retorna 0
    if (medicamentos.length === 0) return 0

    //Un set que funciona como lista unica de TODAS las dosis que ya existen. Esto luego permite saber si ya existe una dosis con una sola funcion

    //La funcion primero convierte las Tomas a lista / arreglo, y de cada una se crea una clave
    const existentes = new Set(comoLista<Toma>(toma$.get()).map((t) => generarClave(t.medicamento_id, new Date(t.programada_para))))

    //Arreglo para ir acumulando las dosis a crear, de tipo Toma
    const nuevas: Toma[] = []

    const hoy = new Date()
    //Deja la fecha a medianoche para que no haya errores segun la hora
    hoy.setHours(0,0,0,0)

    //Bucle #1 - DIAS, empieza en 6 y termina en 0 (0 = hoy)   
    for (let atras = DIAS_ATRAS - 1; atras >= 0; atras--) {
        //Crea una copia de hoy para modificarla libremente
        const dia = new Date(hoy)

        //Le resta los dias y deja solo los meses
        dia.setDate(dia.getDate() - atras)

        //Numero del dia de la semana
        const diaSemana = dia.getDay()

        //Bucle 2 - Medicamentos

        for(const med of medicamentos) {

            //Fecha en el que se creo el medicamento, o null si no hay nada
            //Se necesita la fecha para compararla y no crear tomas antes de que el medicamento fue creado.

            if (!med.created_at) continue

            const creado = new Date(med.created_at)

            // Bucle 3 - Horarios de cada medicamento
            for (const horario of med.horarios ?? []) {
                //Si el horario NO incluye el dia de la semana del loop, pasar al siguiente
                if (!horario.dias.includes(diaSemana)) continue

                //Dividir el time a hora y minutos ("8:00" a {horas: 8, minuitos: 0})
                const {horas, minutos} = partirHora(horario.hora)

                //Copia del dia del primer loop
                const programada = new Date(dia)

                //Le asigna las horas y minutos del horario del medicamento
                programada.setHours(horas, minutos, 0, 0)


                //Si la fecha de creacion del medicamento existe Y la fecha de programacion es antes de su creacion, saltar este horario. Esto hace que no se pueda asignar tomas en el pasado, antes de que el medicamento sea asignado
                if (programada < creado) continue

                //Revisar en el set si la toma ya existe
                const k = generarClave(med.id, programada)
                if(existentes.has(k)) continue

                //Si no, agregarla al set
                existentes.add(k)

                //Finalmente, si la toma paso todos los filtros, se crea

                nuevas.push({
                    id: Crypto.randomUUID(),
                    perfil_id: perfilId,
                    medicamento_id: med.id,
                    horario_id: horario.id,
                    //El instante exacto
                    programada_para: programada.toISOString(),
                    estado: 'pendiente',
                    registrada_en: null,
                    pospuesta_hasta: null,
                })
            }
        }
    }

    //Si una toma es valida, escribirla
    if (nuevas.length > 0) {
        //Batch es una funcion de legend state que agrupa todas las escrituras en un ciclo y luego las manda cuando detecta que no se agrega nada mas. 
        batch(() => {
            for (const toma of nuevas) toma$[toma.id].set(toma)
        })
    }

    return nuevas.length
}