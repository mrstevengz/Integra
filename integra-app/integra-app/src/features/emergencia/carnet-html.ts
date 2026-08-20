import { Alergia } from "@/state/alergia"
import { Condicion } from "@/state/condicion"
import { ContactoEmergencia } from "@/state/contactosemergencia"
import { Medicamento, horariosOrdenadosdeMedicamento, listaDiasAString, formatearHoraAString } from "@/state/medicacion"
import { Perfil} from "@/state/usuario"
import { ESTILOS } from "./carnet-estilos"
import { esc, edadEnAnios, fechaCorta, fechaDeHoy, porCreacion, ORDEN_RELACION } from "./formato"

//APARTADO DEL LOGO
// const LOGO = `
// <svg width="31" height="31" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
//   <rect width="44" height="44" rx="11" fill="#1C469C"/>
//   <path d="M22 12 V32 M12 22 H32" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>
// </svg>`

const ALIMENTOS: Record<string, string> = { con: "Con alimentos", sin: "Sin alimentos" }

type Fila = { titulo: string; chip?: string | null; notas?: (string | null | undefined)[] }

function fila(f: Fila, clase = ""): string {
    const notas = (f.notas ?? []).filter(Boolean)
    return `<div class="fila ${clase}">
      <div class="cabeza"><span class="titulo">${esc(f.titulo)}</span>
      ${f.chip ? `<span class="chip">${esc(f.chip)}</span>` : ""}</div>
      ${notas.map((n) => `<p class="nota">${esc(n)}</p>`).join("")}
    </div>`
}

function seccion(titulo: string, filas: string[]): string {
    return filas.length ? `<section><h2>${esc(titulo)}</h2>${filas.join("")}</section>` : ""
}

function pauta(m: Medicamento): string {
    return horariosOrdenadosdeMedicamento(m)
        .map((h) => `${formatearHoraAString(h.hora)} (${listaDiasAString(h.dias)})`)
        .join(" · ")
}

export type DatosCarnet = {
    perfil: Perfil
    alergias: Alergia[]
    contactos: ContactoEmergencia[]
    condiciones: Condicion[]
    medicamentos: Medicamento[]
    qrBase64: string   
}

export function armarCarnetHTML(d: DatosCarnet): string {
    const p = d.perfil
    const nombre = `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim()
    const anios = p.fecha_nacimiento ? edadEnAnios(p.fecha_nacimiento) : null
    const nacimiento = p.fecha_nacimiento ? fechaCorta(p.fecha_nacimiento) : ""
    const qr = `data:image/png;base64,${d.qrBase64}`

    const contactos = [...d.contactos].sort((a, b) =>
        (ORDEN_RELACION[a.relacion] ?? 99) - (ORDEN_RELACION[b.relacion] ?? 99) || porCreacion(a, b))

    const cuerpo =
        seccion("Alergias", [...d.alergias].sort(porCreacion).map((a) =>
            fila({ titulo: a.nombre, chip: a.severidad, notas: [a.detalles] }, "alergia"))) +

        seccion("Contactos de emergencia", contactos.map((c) =>
            fila({ titulo: c.nombre, chip: c.telefono,
                   notas: [c.relacion && `Contacto ${c.relacion.toLowerCase()}`] }, "contacto"))) +

        seccion("Condiciones médicas", [...d.condiciones].sort(porCreacion).map((c) =>
            fila({ titulo: c.nombre, chip: c.tipo, notas: [c.detalles] }))) +

        seccion("Medicación activa", [...d.medicamentos].filter((m) => m.activo).sort(porCreacion).map((m) =>
            fila({ titulo: `${m.nombre} ${m.dosis}${m.unidad}`, chip: m.forma,
                   notas: [pauta(m), ALIMENTOS[m.con_alimentos ?? ""], m.indicaciones] })))

    //El <!DOCTYPE html> evita una pagina en blanco al final en iOS cuando hay
    //margenes de pagina.
    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8" /><style>${ESTILOS}</style></head>
<body>
  <header class="cabecera">
    <div class="marca">
      <div><div class="marca-nombre">INTEGRA</div>
           <div class="marca-bajada">Carnet de emergencia médica</div></div>
    </div>
    <div class="cabecera-derecha">Generado el ${fechaDeHoy()}<br />
      Documento personal — no sustituye el expediente clínico</div>
  </header>

  <div class="identidad">
    <div>
      <h1>${esc(nombre)}</h1>
      <div class="datos">
        ${anios != null ? `<span><b>${anios}</b> años</span>` : ""}
        ${nacimiento ? `<span>Nacimiento: ${esc(nacimiento)}</span>` : ""}
        ${p.genero ? `<span>${esc(p.genero)}</span>` : ""}
        ${p.telefono ? `<span>Tel. ${esc(p.telefono)}</span>` : ""}
      </div>
      ${p.medico_tratante ? `<div class="datos" style="margin-top:4px">Médico tratante: ${esc(p.medico_tratante)}</div>` : ""}
    </div>
    ${p.tipo_sangre ? `<div class="sangre"><i>SANGRE</i><b>${esc(p.tipo_sangre)}</b></div>` : ""}
  </div>

  <div class="bloque-qr">
    <img src="${qr}" alt="Código QR de emergencia" />
    <div>
      <h3>Acceso rápido para personal médico</h3>
      <p>Apunte la cámara de cualquier teléfono al código. Muestra alergias,
         contactos de emergencia, condiciones y medicación activa.</p>
      <p><b>No requiere internet</b> ni instalar ninguna aplicación: la
         información viaja dentro del propio código.</p>
    </div>
  </div>

  ${cuerpo}

  <footer class="pie">
    La información proviene del expediente cargado por la persona usuaria y puede
    no estar completa ni actualizada. Ante una emergencia, priorice el criterio clínico.
  </footer>

  <div class="pagina-carnet">
    <p class="nota" style="margin-bottom:9px">Recorte por la línea punteada y guarde
      la tarjeta en su billetera. Funciona aunque el teléfono esté sin batería.</p>
    <div class="carnet">
      <img src="${qr}" alt="Código QR de emergencia" />
      <div>
        <div class="carnet-rotulo">INTEGRA · EMERGENCIA</div>
        <div class="carnet-nombre">${esc(nombre)}</div>
        ${anios != null ? `<div class="carnet-dato">${anios} años${nacimiento ? ` · ${esc(nacimiento)}` : ""}</div>` : ""}
        ${contactos[0] ? `<div class="carnet-dato">${esc(contactos[0].nombre)} · ${esc(contactos[0].telefono)}</div>` : ""}
        ${p.tipo_sangre ? `<div class="carnet-sangre">${esc(p.tipo_sangre)}</div>` : ""}
      </div>
    </div>
  </div>
</body></html>`
}