import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

type Secciones = {
    datosPersonales: boolean
    condicionesYAlergias: boolean
    medicacionActiva: boolean
    historialMedicacion: boolean
    mediciones: boolean
    citas: boolean
    contactosEmergencia: boolean
}

type Exportacion = {
    perfil_id: string
    codigo: string
    secciones: Secciones
    rango_historial: '1m' | '3m' | '6m' | 'todo'
    expira_en: string
    revocada_en: string | null
}

const MESES_POR_RANGO: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6 }

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
}

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function tokenDeLaRuta(url: string): string | null {
    const partes = new URL(url).pathname.split('/').filter(Boolean)
    const token = partes[partes.length - 1]
    return token && token !== 'expediente' ? token : null
}

function desdeCuando(rango: string): string | null {
    if (rango === 'todo') return null
    const desde = new Date()
    desde.setMonth(desde.getMonth() - MESES_POR_RANGO[rango])
    return desde.toISOString()
}

function responder(cuerpo: unknown, status = 200): Response {
    return new Response(JSON.stringify(cuerpo), {
        status,
        headers: {
            ...CORS,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    })
}

function error(mensaje: string, status: number): Response {
    return responder({ error: mensaje }, status)
}

async function cargarDatos(exportacion: Exportacion) {
    const perfilId = exportacion.perfil_id
    const incluye = exportacion.secciones
    const desde = desdeCuando(exportacion.rango_historial)

    const propias = (tabla: string) =>
        supabase.from(tabla).select('*').eq('perfil_id', perfilId).eq('deleted', false)

    const necesitaMedicamentos = incluye.medicacionActiva || incluye.historialMedicacion

    const [perfil, alergias, condiciones, medicamentos, mediciones, tipos, citas, resultados, contactos] =
        await Promise.all([
            supabase.from('perfiles').select('*').eq('id', perfilId).single(),
            incluye.condicionesYAlergias ? propias('alergias') : null,
            incluye.condicionesYAlergias ? propias('condiciones') : null,
            necesitaMedicamentos ? propias('medicamentos') : null,
            incluye.mediciones
                ? (desde ? propias('mediciones').gte('medido_en', desde) : propias('mediciones'))
                : null,
            incluye.mediciones ? supabase.from('tipomedicion').select('*') : null,
            incluye.citas
                ? (desde ? propias('citas').gte('programada_para', desde) : propias('citas'))
                : null,
            incluye.citas ? propias('citas_resultado') : null,
            incluye.contactosEmergencia ? propias('contactosemergencia') : null,
        ])

    return {
        perfil: perfil.data,
        alergias: alergias?.data ?? [],
        condiciones: condiciones?.data ?? [],
        medicamentos: medicamentos?.data ?? [],
        mediciones: mediciones?.data ?? [],
        tipos: tipos?.data ?? [],
        citas: citas?.data ?? [],
        resultados: resultados?.data ?? [],
        contactos: contactos?.data ?? [],
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS })
    }

    if (req.method !== 'GET') {
        return error('Metodo no permitido', 405)
    }

    const token = tokenDeLaRuta(req.url)
    if (!token) {
        return error('Enlace incompleto', 400)
    }

    const { data, error: fallo } = await supabase
        .from('exportaciones_expediente')
        .select('perfil_id, codigo, secciones, rango_historial, expira_en, revocada_en')
        .eq('token', token)
        .eq('deleted', false)
        .maybeSingle()

    if (fallo) {
        console.error('[expediente] error de consulta', fallo.message)
        return error('No se pudo abrir el expediente', 500)
    }

    if (!data) {
        return error('Este enlace no existe', 404)
    }

    const exportacion = data as Exportacion

    if (exportacion.revocada_en) {
        return error('La persona revoco el acceso a este expediente', 410)
    }

    if (new Date(exportacion.expira_en).getTime() <= Date.now()) {
        return error('Este enlace ya vencio', 410)
    }

    const datos = await cargarDatos(exportacion)

    if (!datos.perfil) {
        return error('No se encontro el expediente', 404)
    }

    return responder({
        codigo: exportacion.codigo,
        expira_en: exportacion.expira_en,
        secciones: exportacion.secciones,
        ...datos,
    })
})