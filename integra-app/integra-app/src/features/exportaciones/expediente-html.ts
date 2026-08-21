import type { Alergia } from "@/state/alergias"
import type { Cita, ResultadoCita } from "@/state/citas"
import type { Condicion } from "@/state/condiciones"
import type { ContactoEmergencia } from "@/state/contactos-emergencia"
import type { Medicamento } from "@/state/medicamentos"
import type { Medicion, TipoMedicion } from "@/state/mediciones"
import type { Perfil } from "@/state/usuario"
import { horariosOrdenados, formatearDias } from "@/state/medicamentos"
import { edadEnAnios, nombreCompleto } from "@/state/usuario"
import { resultadoDeCita } from "@/state/citas"
import { desdeCuando, seccionesIncluidas, type Exportacion } from "@/state/exportaciones"
import { formatearFecha, formatearHora, formatearHoraDeTexto } from "@/lib/fechas"
import { esc } from "@/lib/html"
import { ESTILOS } from "./expediente-estilos"

const ALIMENTOS: Record<string, string> = { con: "Con alimentos", sin: "Sin alimentos" }

export type DatosExpediente = {
    perfil: Perfil
    alergias: Alergia[]
    condiciones: Condicion[]
    medicamentos: Medicamento[]
    mediciones: Medicion[]
    tiposMedicion: Record<string, TipoMedicion>
    citas: Cita[]
    resultadosCita: Record<string, ResultadoCita>
    contactos: ContactoEmergencia[]
}

type Fila = { titulo: string; chip?: string | null; notas?: (string | null | undefined)[] }

function fila(f: Fila, clase = ""): string {
    const notas = (f.notas ?? []).filter(Boolean)
    return `<div class="fila ${clase}">
      <div class="cabeza"><span class="titulo">${esc(f.titulo)}</span>
      ${f.chip ? `<span class="chip">${esc(f.chip)}</span>` : ""}</div>
      ${notas.map((n) => `<p class="nota">${esc(n)}</p>`).join("")}
    </div>`
}

function seccion(titulo: string, contenido: string): string {
    const cuerpo = contenido || `<p class="vacio">Sin registros</p>`
    return `<section><h2>${esc(titulo)}</h2>${cuerpo}</section>`
}

function pauta(m: Medicamento): string {
    return horariosOrdenados(m)
        .map((h) => `${formatearHoraDeTexto(h.hora)} (${formatearDias(h.dias)})`)
        .join(" · ")
}

function medicamentoFila(m: Medicamento): string {
    return fila({
        titulo: `${m.nombre} ${m.dosis}${m.unidad}`,
        chip: m.forma,
        notas: [pauta(m), ALIMENTOS[m.con_alimentos ?? ""], m.indicaciones],
    })
}

function desdeElRango(fecha: Date | string, corte: Date | null): boolean {
    return corte === null || new Date(fecha).getTime() >= corte.getTime()
}

export function armarExpedienteHTML(exportacion: Exportacion, datos: DatosExpediente): string {
    const { perfil } = datos
    const incluye = exportacion.secciones
    const corte = desdeCuando(exportacion.rango_historial)

    const anios = perfil.fecha_nacimiento ? edadEnAnios(perfil.fecha_nacimiento) : null

    const datosPersonales = !incluye.datosPersonales ? "" : seccion("Datos personales", `
      <div class="rejilla">
        ${anios != null ? `<span><b>${anios}</b> años</span>` : ""}
        ${perfil.fecha_nacimiento ? `<span>Nacimiento: <b>${esc(formatearFecha(new Date(perfil.fecha_nacimiento), { conAnio: true }))}</b></span>` : ""}
        ${perfil.cedula ? `<span>Cedula: <b>${esc(perfil.cedula)}</b></span>` : ""}
        ${perfil.genero ? `<span>Genero: <b>${esc(perfil.genero)}</b></span>` : ""}
        ${perfil.tipo_sangre ? `<span>Sangre: <b>${esc(perfil.tipo_sangre)}</b></span>` : ""}
        ${perfil.telefono ? `<span>Telefono: <b>${esc(perfil.telefono)}</b></span>` : ""}
        ${perfil.medico_tratante ? `<span>Medico tratante: <b>${esc(perfil.medico_tratante)}</b></span>` : ""}
      </div>`)

    const condicionesYAlergias = !incluye.condicionesYAlergias ? "" :
        seccion("Alergias", datos.alergias
            .map((a) => fila({ titulo: a.nombre, chip: a.severidad, notas: [a.detalles] }, "alergia"))
            .join("")) +
        seccion("Condiciones medicas", datos.condiciones
            .map((c) => fila({ titulo: c.nombre, chip: c.tipo, notas: [c.detalles] }))
            .join(""))

    const medicacionActiva = !incluye.medicacionActiva ? "" : seccion("Medicacion activa",
        datos.medicamentos.filter((m) => m.activo).map(medicamentoFila).join(""))

    const historialMedicacion = !incluye.historialMedicacion ? "" : seccion("Historial de medicacion",
        datos.medicamentos.filter((m) => !m.activo).map(medicamentoFila).join(""))

    const medicionesEnRango = datos.mediciones.filter((m) => desdeElRango(m.medido_en, corte))

    const mediciones = !incluye.mediciones ? "" : seccion("Mediciones de salud",
        medicionesEnRango.length === 0 ? "" : `
        <table>
          <tr><th>Fecha</th><th>Tipo</th><th>Valor</th><th>Contexto</th></tr>
          ${medicionesEnRango.map((m) => {
            const tipo = datos.tiposMedicion[m.tipo_medicion_id]
            const medido = new Date(m.medido_en)
            const valor = m.valor_secundario != null
                ? `${m.valor}/${m.valor_secundario}`
                : `${m.valor}`
            return `<tr>
              <td>${esc(formatearFecha(medido))} ${esc(formatearHora(medido))}</td>
              <td>${esc(tipo?.nombre ?? "")}</td>
              <td>${esc(valor)} ${esc(tipo?.unidad ?? "")}</td>
              <td>${esc(m.contexto ?? "")}</td>
            </tr>`
          }).join("")}
        </table>`)

    const citasEnRango = datos.citas.filter((c) => desdeElRango(c.programada_para, corte))

    const citas = !incluye.citas ? "" : seccion("Citas medicas",
        citasEnRango.map((c) => {
            const resultado = resultadoDeCita(datos.resultadosCita, c.id)
            const cuando = new Date(c.programada_para)
            return fila({
                titulo: `${c.especialidad} — ${c.medico ?? "Sin medico"}`,
                chip: resultado?.tipo_resultado ?? "Pendiente",
                notas: [
                    `${formatearFecha(cuando, { conAnio: true })} ${formatearHora(cuando)} · ${c.institucion}`,
                    resultado?.diagnostico,
                    resultado?.instruccion,
                    resultado?.nota_cancelacion,
                ],
            })
        }).join(""))

    const contactos = !incluye.contactosEmergencia ? "" : seccion("Contactos de emergencia",
        datos.contactos
            .map((c) => fila({ titulo: c.nombre, chip: c.telefono, notas: [c.relacion] }, "contacto"))
            .join(""))

    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8" /><style>${ESTILOS}</style></head>
<body>
  <header class="cabecera">
    <div>
      <div class="marca">INTEGRA</div>
      <div class="bajada">Expediente medico personal</div>
    </div>
    <div class="cabecera-derecha">
      ${esc(exportacion.codigo)}<br />
      Generado el ${esc(formatearFecha(new Date(), { conAnio: true }))}<br />
      ${seccionesIncluidas(exportacion).length} secciones incluidas
    </div>
  </header>

  <h1>${esc(nombreCompleto(perfil))}</h1>

  ${datosPersonales}
  ${condicionesYAlergias}
  ${medicacionActiva}
  ${historialMedicacion}
  ${mediciones}
  ${citas}
  ${contactos}

  <footer class="pie">
    Documento generado por INTEGRA a pedido de la persona usuaria. La informacion
    proviene de su expediente y puede no estar completa ni actualizada.
    Ante una emergencia, priorice el criterio clinico.
  </footer>
</body></html>`
}