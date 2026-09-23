import "server-only";

import { type Grupo, grupos as gruposIniciales } from "@/data/grupos";
import {
  type Prenda,
  type Ropa,
  ropa as ropaInicial,
  ropaVacia,
} from "@/data/ropa";
import type { Rol } from "./roles";
import { clienteAdmin } from "./supabase";

/**
 * Donde se guardan los datos.
 *
 * Las personas y sus matrículas están ya en Supabase (tablas `usuarios` y
 * `matriculas`, ver `supabase/esquema.sql`). Los grupos y la ropa todavía no:
 * salen de `src/data/` y lo editado desde el panel se apunta en la memoria del
 * servidor, encima de esos valores. Eso quiere decir que, para grupos y ropa:
 *
 *   · Al parar `npm run dev` y volver a arrancar, se pierde lo editado y
 *     vuelven los valores de `src/data/`.
 *   · Publicado en Netlify no sirve: cada visita puede caer en un servidor
 *     distinto, con su propia memoria.
 *
 * Cuando se pasen también a Supabase, se cambian las funciones de abajo y el
 * resto de la web no se entera.
 *
 * Todo lo de aquí va con la clave secreta, sin comprobar permisos: eso lo hace
 * `acceso.ts` antes de llamar. Por eso las páginas no importan este archivo.
 */

/**
 * La temporada en curso. Las matrículas se guardan por temporada para no
 * perder el histórico; el panel solo enseña las de esta.
 *
 * Se cambia a mano cada septiembre. Al cambiarla, todo el mundo aparece sin
 * grupos hasta que se le matricule en la nueva.
 */
export const TEMPORADA = "2026-2027";

/* ---------- Usuarios ---------- */

/** Una persona del centro, tal como la usa la web. */
export type Usuario = {
  id: string;
  /** Nombre y apellidos juntos, que es como se enseña casi siempre. */
  nombre: string;
  /** Por separado, para el formulario de editar. */
  nombreDePila: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: Rol;
  /**
   * Los grupos de esta temporada. Según el rol, significa una cosa distinta:
   *
   *   profesor — los grupos que imparte (y por tanto puede editar).
   *   alumno   — los grupos en los que está matriculado.
   *   admin    — no se usa: un administrador llega a todos los grupos.
   */
  grupos: string[];
  /** `false` si está de baja: no aparece en las listas ni puede entrar. */
  activo: boolean;
  /** El id de su cuenta de acceso, o `null` si todavía no tiene. */
  authId: string | null;
  /**
   * Si fue un profesor quien la apuntó y pidió la invitación: el id de ese
   * profesor y cuándo. Mientras no tenga `authId`, está pendiente de aprobar.
   */
  invitacionPedida: { por: string | null; en: string } | null;
};

/** Lo que se pide de la base de datos, con las matrículas ya colgando. */
const COLUMNAS =
  "id, auth_id, nombre, apellidos, email, telefono, rol, activo, " +
  "invitacion_pedida_por, invitacion_pedida_en, " +
  "matriculas(grupo_id, temporada, fecha_baja)";

type Fila = {
  id: string;
  auth_id: string | null;
  nombre: string;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  invitacion_pedida_por: string | null;
  invitacion_pedida_en: string | null;
  matriculas: {
    grupo_id: string;
    temporada: string;
    fecha_baja: string | null;
  }[];
};

function aUsuario(fila: Fila): Usuario {
  const apellidos = fila.apellidos ?? "";
  return {
    id: fila.id,
    nombre: [fila.nombre, apellidos].filter(Boolean).join(" "),
    nombreDePila: fila.nombre,
    apellidos,
    email: fila.email ?? "",
    telefono: fila.telefono ?? "",
    rol: fila.rol,
    grupos: fila.matriculas
      .filter((m) => m.temporada === TEMPORADA && m.fecha_baja === null)
      .map((m) => m.grupo_id),
    activo: fila.activo,
    authId: fila.auth_id,
    invitacionPedida: fila.invitacion_pedida_en
      ? { por: fila.invitacion_pedida_por, en: fila.invitacion_pedida_en }
      : null,
  };
}

/**
 * Si la base de datos falla por algo que no esperamos, mejor romper con un
 * mensaje claro que seguir con datos a medias.
 */
function comprobar(error: { message: string } | null, que: string): void {
  if (error) throw new Error(`Supabase (${que}): ${error.message}`);
}

/** Los ids de `usuarios` son uuid; cualquier otra cosa no va a existir. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Todas las personas, de alta y de baja. */
export async function usuariosAhora(): Promise<Usuario[]> {
  const { data, error } = await clienteAdmin().from("usuarios").select(COLUMNAS);
  comprobar(error, "leer usuarios");
  return (data as unknown as Fila[]).map(aUsuario);
}

export async function usuarioPorId(id: string): Promise<Usuario | undefined> {
  if (!UUID.test(id)) return undefined;

  const { data, error } = await clienteAdmin()
    .from("usuarios")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();
  comprobar(error, "leer usuario");
  return data ? aUsuario(data as unknown as Fila) : undefined;
}

/** La ficha que corresponde a una cuenta de acceso. */
export async function usuarioPorAuthId(
  authId: string,
): Promise<Usuario | undefined> {
  const { data, error } = await clienteAdmin()
    .from("usuarios")
    .select(COLUMNAS)
    .eq("auth_id", authId)
    .maybeSingle();
  comprobar(error, "leer usuario");
  return data ? aUsuario(data as unknown as Fila) : undefined;
}

/** La ficha que tiene ese correo, si hay alguna. */
export async function usuarioPorEmail(
  email: string,
): Promise<Usuario | undefined> {
  const { data, error } = await clienteAdmin()
    .from("usuarios")
    .select(COLUMNAS)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  comprobar(error, "buscar por correo");
  return data ? aUsuario(data as unknown as Fila) : undefined;
}

/** Lo que se rellena al dar de alta a alguien. */
export type DatosNuevos = {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: Rol;
};

/**
 * Crear la ficha de una persona, todavía sin cuenta de acceso.
 * Devuelve su id, o un error si el correo ya está dado de alta.
 */
export async function crearFicha(
  datos: DatosNuevos,
  /** Si la crea un profesor: su id. La invitación queda pendiente de aprobar. */
  pedidaPor?: string,
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await clienteAdmin()
    .from("usuarios")
    .insert({
      nombre: datos.nombre,
      apellidos: datos.apellidos || null,
      email: datos.email.toLowerCase(),
      telefono: datos.telefono || null,
      rol: datos.rol,
      ...(pedidaPor
        ? {
            invitacion_pedida_por: pedidaPor,
            invitacion_pedida_en: new Date().toISOString(),
          }
        : {}),
    })
    .select("id")
    .single();

  /* 23505 es «ya existe»: el índice de correos únicos ha saltado. */
  if (error?.code === "23505") {
    return { error: "Ya hay una persona dada de alta con ese correo." };
  }
  comprobar(error, "crear usuario");
  return { id: data!.id as string };
}

/** Apuntar en la ficha qué cuenta de acceso es la suya. */
export async function enlazarCuenta(id: string, authId: string): Promise<void> {
  const { error } = await clienteAdmin()
    .from("usuarios")
    .update({ auth_id: authId })
    .eq("id", id);
  comprobar(error, "enlazar cuenta");
}

export async function guardarDatos(
  id: string,
  datos: Pick<DatosNuevos, "nombre" | "apellidos" | "telefono">,
): Promise<void> {
  const { error } = await clienteAdmin()
    .from("usuarios")
    .update({
      nombre: datos.nombre,
      apellidos: datos.apellidos || null,
      telefono: datos.telefono || null,
    })
    .eq("id", id);
  comprobar(error, "guardar datos");
}

/**
 * Cambiar el correo de la ficha. Devuelve `false` si ya lo tiene otra
 * persona. (El de la cuenta de acceso se cambia aparte, en `sesion.ts`.)
 */
export async function guardarCorreo(id: string, email: string): Promise<boolean> {
  const { error } = await clienteAdmin()
    .from("usuarios")
    .update({ email: email.trim().toLowerCase() })
    .eq("id", id);
  if (error?.code === "23505") return false;
  comprobar(error, "guardar correo");
  return true;
}

export async function guardarRol(id: string, rol: Rol): Promise<void> {
  const supabase = clienteAdmin();

  const { error } = await supabase.from("usuarios").update({ rol }).eq("id", id);
  comprobar(error, "guardar rol");

  /* Las matrículas dicen a qué título está cada uno en el grupo. Si alguien
     pasa de alumno a profesor, sus grupos de esta temporada pasan a ser grupos
     que imparte. Un administrador no usa sus matrículas, así que se dejan. */
  if (rol !== "admin") {
    const { error: errorMatriculas } = await supabase
      .from("matriculas")
      .update({ papel: rol })
      .eq("usuario_id", id)
      .eq("temporada", TEMPORADA);
    comprobar(errorMatriculas, "guardar rol");
  }
}

/**
 * Dejar a una persona exactamente en estos grupos esta temporada.
 *
 * Lo que se quita no se borra: se le pone fecha de baja, para que quede el
 * histórico de quién estuvo en qué grupo.
 */
export async function guardarGrupos(
  id: string,
  papel: "profesor" | "alumno",
  grupos: string[],
): Promise<void> {
  const supabase = clienteAdmin();
  const hoy = new Date().toISOString().slice(0, 10);

  const quitar = supabase
    .from("matriculas")
    .update({ fecha_baja: hoy })
    .eq("usuario_id", id)
    .eq("temporada", TEMPORADA)
    .is("fecha_baja", null);

  const { error: errorQuitar } =
    grupos.length > 0
      ? await quitar.not("grupo_id", "in", `(${grupos.join(",")})`)
      : await quitar;
  comprobar(errorQuitar, "quitar matrículas");

  if (grupos.length === 0) return;

  const { error: errorPoner } = await supabase.from("matriculas").upsert(
    grupos.map((grupoId) => ({
      usuario_id: id,
      grupo_id: grupoId,
      temporada: TEMPORADA,
      papel,
      fecha_baja: null,
    })),
    { onConflict: "usuario_id,grupo_id,temporada" },
  );
  comprobar(errorPoner, "guardar matrículas");
}

/**
 * Apuntar a alguien a un grupo más esta temporada, sin tocar los que ya
 * tenía. Si ya estuvo y se le quitó, vuelve.
 */
export async function anadirAGrupo(
  id: string,
  grupoId: string,
  papel: "profesor" | "alumno",
): Promise<void> {
  const { error } = await clienteAdmin().from("matriculas").upsert(
    { usuario_id: id, grupo_id: grupoId, temporada: TEMPORADA, papel, fecha_baja: null },
    { onConflict: "usuario_id,grupo_id,temporada" },
  );
  comprobar(error, "apuntar al grupo");
}

/**
 * Sacar a alguien de un grupo esta temporada. No se borra la matrícula: se le
 * pone fecha de baja, para que quede el histórico. Sus otros grupos no se
 * tocan.
 */
export async function quitarDeGrupo(id: string, grupoId: string): Promise<void> {
  const { error } = await clienteAdmin()
    .from("matriculas")
    .update({ fecha_baja: new Date().toISOString().slice(0, 10) })
    .eq("usuario_id", id)
    .eq("grupo_id", grupoId)
    .eq("temporada", TEMPORADA)
    .is("fecha_baja", null);
  comprobar(error, "quitar del grupo");
}

/**
 * Borrar del todo una ficha. Solo se puede con quien nunca llegó a tener
 * cuenta: es para las invitaciones que secretaría rechaza, que no tienen
 * historial que conservar. Para todo lo demás está la baja.
 *
 * Devuelve `false` si no se ha borrado porque la persona ya tiene cuenta.
 */
export async function borrarFichaSinCuenta(id: string): Promise<boolean> {
  const { data, error } = await clienteAdmin()
    .from("usuarios")
    .delete()
    .eq("id", id)
    .is("auth_id", null)
    .select("id");
  comprobar(error, "borrar ficha");
  return (data ?? []).length > 0;
}

/** Dar de baja (o volver a dar de alta) sin borrar nada. */
export async function guardarActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await clienteAdmin()
    .from("usuarios")
    .update({
      activo,
      fecha_baja: activo ? null : new Date().toISOString().slice(0, 10),
    })
    .eq("id", id);
  comprobar(error, "dar de baja");
}

/* ---------- Grupos ---------- */

/** Lo que un profesor o un administrador puede editar de un grupo. */
export type CambioGrupo = Pick<Grupo, "horarios" | "estado">;

/** Los cambios en los grupos: id de grupo → horarios y estado nuevos. */
const gruposCambiados = new Map<string, CambioGrupo>();

/** Todos los grupos, con lo editado desde el panel ya aplicado. */
export function gruposAhora(): Grupo[] {
  return gruposIniciales.map((grupo) => {
    const cambio = gruposCambiados.get(grupo.id);
    return cambio ? { ...grupo, ...cambio } : grupo;
  });
}

export function grupoPorId(id: string): Grupo | undefined {
  return gruposAhora().find((grupo) => grupo.id === id);
}

export function guardarGrupo(grupoId: string, cambio: CambioGrupo): void {
  gruposCambiados.set(grupoId, cambio);
}

/* ---------- Ropa ---------- */

/** Las fichas de ropa editadas desde el panel: id de usuario → ficha entera. */
const ropaCambiada = new Map<string, Ropa>();

/**
 * La ficha de ropa de alguien. Si no ha tocado nada, la de `src/data/ropa.ts`;
 * y si tampoco está ahí, una vacía, que es con la que empieza un socio nuevo.
 */
export function ropaDe(usuarioId: string): Ropa {
  return (
    ropaCambiada.get(usuarioId) ??
    ropaInicial.find((ficha) => ficha.usuarioId === usuarioId) ??
    ropaVacia(usuarioId)
  );
}

/**
 * Guardar lo que la persona declara como suyo: sus medidas y sus prendas
 * propias.
 *
 * Las prestadas no se tocan aquí a propósito. No vienen en el formulario
 * —quien lo rellena no puede editarlas—, así que si guardásemos solo lo que
 * llega, se borrarían todas de golpe. Se conservan tal cual estaban.
 */
export function guardarRopaPropia(
  usuarioId: string,
  medidas: Ropa["medidas"],
  propias: Prenda[],
): void {
  const prestadas = ropaDe(usuarioId).prendas.filter(
    (prenda) => prenda.origen === "prestada",
  );

  ropaCambiada.set(usuarioId, {
    usuarioId,
    medidas,
    prendas: [...prestadas, ...propias],
  });
}
