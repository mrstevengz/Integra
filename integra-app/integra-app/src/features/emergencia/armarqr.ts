import { getAge } from "@/app/(tabs)/expediente";
import { Alergia } from "@/state/alergia";
import { Condicion } from "@/state/condicion";
import { ContactoEmergencia } from "@/state/contactosemergencia";
import { Medicamento } from "@/state/medicacion";
import { Perfil } from "@/state/usuario";

//Topes para armar el QR
const TOPE_CONDICIONES = 4; //Solo 4 condiciones se muestran en el QR
const TOPE_MEDICAMENTOS = 5; //Solo 5 medicamentos se muestran en el QR

export const LARGO = 700; //Tamaño del QR, arriba de esto y cuesta enforcarlo en la camara.

function filtrarPorCreacion<T extends { created_at?: string | null }>(
  a: T,
  b: T,
): number {
  return (a.created_at ?? "1").localeCompare(b.created_at ?? "1");
}

function seccion(titulo: string, lineas: string[], tope?: number): string {
  if (lineas.length === 0) return "";

  const visibles = tope ? lineas.slice(0, tope) : lineas;
  const resto = lineas.length - visibles.length;
  const extra = resto > 0 ? `\n(+${resto} mas en la app)` : "";

  return `\n\n${titulo}\n${visibles.join("\n")}${extra}`;
}

export function armarQREmergencia(
  perfil: Perfil,
  alergias: Alergia[],
  contactos: ContactoEmergencia[],
  condiciones: Condicion[],
  medicamentos: Medicamento[],
): string {
  const nombre = `${perfil.nombre} ${perfil.apellidos}`.trim();

  const edad = perfil.fecha_nacimiento
    ? `${getAge(perfil.fecha_nacimiento)} años`
    : null;
  const nacimiento = perfil.fecha_nacimiento
    ? `- Fecha de nacimiento: ${new Date(perfil.fecha_nacimiento).toLocaleDateString()}`
    : "";

  const identidad = [edad, nacimiento].filter(Boolean).join(" ");

  const sangre = perfil.tipo_sangre ? "Sangre: " + perfil.tipo_sangre : "";
  const informacion = [identidad, sangre].filter(Boolean).join(" - ");

  const cabecera = ["INTEGRA - EMERGENCIA", nombre, informacion]
    .filter(Boolean)
    .join("\n");

  //Alergias

  const alergiasLista = alergias
    .sort(filtrarPorCreacion)
    .map((a) => (a.severidad ? `${a.nombre} (${a.severidad})` : a.nombre));

  const contactosLista = contactos
    .sort(filtrarPorCreacion)
    .slice(0, 3)
    .map((c) => (c.telefono ? `${c.nombre} ('${c.telefono})'` : c.nombre));

  const condicionesLista = condiciones
    .sort(filtrarPorCreacion)
    .slice(0, TOPE_CONDICIONES)
    .map((c) => c.nombre);

  const medicamentosLista = medicamentos
    .sort(filtrarPorCreacion)
    .filter((m) => m.activo)
    .slice(0, TOPE_MEDICAMENTOS)
    .map((m) => `${m.nombre} ${m.dosis}${m.unidad}`.trim());

  const textoQR =
    cabecera +
    seccion("ALERGIAS", alergiasLista) +
    seccion("CONTACTO", contactosLista) +
    seccion("CONDICIONES", condicionesLista, TOPE_CONDICIONES) +
    seccion("MEDICAMENTOS", medicamentosLista, TOPE_MEDICAMENTOS) +
    `\n\nGenerado ${new Date().toLocaleDateString()} por INTEGRA`;

  return textoQR;
}
