import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import type { Grupo } from "@/data/grupos";
import type { Ropa } from "@/data/ropa";
import {
  type Usuario,
  grupoPorId,
  gruposAhora,
  ropaDe,
  usuarioPorAuthId,
  usuarioPorId,
  usuariosAhora,
} from "./almacen";
import { supabaseConfigurado } from "./entorno";
import { type Accion, puede, puedeEnGrupo } from "./roles";
import { estadoDeCuenta, leerSesion } from "./sesion";

/**
 * La puerta por la que pasa todo lo privado.
 *
 * La idea, que viene recomendada por la propia documentación de Next.js: en
 * vez de comprobar los permisos en cada página —donde antes o después uno se
 * olvida—, se comprueban aquí, pegados a los datos. Si una función de este
 * archivo te devuelve la lista de alumnos de un grupo, es porque ya ha
 * comprobado que puedes verla.
 *
 * Regla que no hay que romper: las páginas y los formularios del panel no
 * leen `src/data/` ni `almacen.ts` directamente. Preguntan aquí.
 */

export type { Usuario };

/**
 * Quién está usando la web ahora mismo, o `null` si no ha entrado.
 *
 * Va envuelta en `cache` de React: aunque la llamen cinco componentes de la
 * misma página, la sesión y la base de datos se consultan una sola vez.
 *
 * Úsala cuando no pasa nada por no tener sesión: la cabecera, por ejemplo,
 * que solo cambia el botón. Si la página es privada, usa `exigirUsuario`.
 */
export const usuarioActual = cache(async (): Promise<Usuario | null> => {
  /* Quién ha entrado depende de cada visita: esto impide que Next.js genere
     la página una sola vez al compilar, aunque falten las claves. */
  await connection();

  /* Sin Supabase configurado nadie ha podido entrar, y así la parte pública
     de la web se sigue viendo mientras tanto. */
  if (!supabaseConfigurado()) return null;

  const authId = await leerSesion();
  if (!authId) return null;

  /* La sesión puede ser válida y aun así no dejar pasar: si a la persona se
     le ha dado de baja, o si se ha borrado su ficha. Entonces es como no
     haber entrado. */
  const usuario = await usuarioPorAuthId(authId);
  return usuario?.activo ? usuario : null;
});

/**
 * Igual que `usuarioActual`, pero para páginas que no se pueden ver sin haber
 * entrado: si no hay sesión, manda a la pantalla de entrar y no sigue.
 */
export const exigirUsuario = cache(async (): Promise<Usuario> => {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  return usuario;
});

/**
 * El portero de los formularios, para las acciones que van sobre un grupo.
 *
 * Un formulario que guarda algo se puede llamar desde fuera de la web, sin
 * pasar por nuestros botones. Así que no vale con no enseñar el botón: hay
 * que volver a comprobar el permiso al guardar. Esta función es esa segunda
 * comprobación, y revienta a propósito si no se cumple.
 *
 * `grupoId` es lo que distingue «puede editar grupos» de «puede editar *este*
 * grupo»: un profesor pasa con los suyos y no con los demás.
 */
export async function exigirPermisoEnGrupo(
  accion: Accion,
  grupoId: string,
): Promise<Usuario> {
  const usuario = await usuarioActual();
  if (!usuario) throw new Error("Hay que entrar para hacer esto.");

  if (!puedeEnGrupo(usuario, accion, grupoId)) {
    throw new Error(
      `${usuario.nombre} no tiene permiso para «${accion}» en «${grupoId}».`,
    );
  }
  return usuario;
}

/**
 * Lo mismo, para las acciones que no van sobre un grupo concreto, como
 * gestionar las cuentas del centro.
 */
export async function exigirPermiso(accion: Accion): Promise<Usuario> {
  const usuario = await usuarioActual();
  if (!usuario) throw new Error("Hay que entrar para hacer esto.");

  if (!puede(usuario.rol, accion)) {
    throw new Error(`${usuario.nombre} no tiene permiso para «${accion}».`);
  }
  return usuario;
}

/* ---------- Consultas ---------- */

/** En orden alfabético, como en una lista de clase. */
function porNombre(a: Usuario, b: Usuario): number {
  return a.nombre.localeCompare(b.nombre, "es");
}

/**
 * Los grupos del usuario: los que imparte si es profesor, los que tiene
 * matriculados si es alumno. Un administrador no tiene grupos «suyos», así
 * que le devolvemos todos, que es lo que le interesa ver.
 */
export async function misGrupos(): Promise<Grupo[]> {
  const usuario = await exigirUsuario();
  if (usuario.rol === "admin") return gruposAhora();

  /* Recorremos `gruposAhora()` y no `usuario.grupos` para que salgan en el
     orden de `grupos.ts`, y para que un id mal escrito no rompa la página. */
  return gruposAhora().filter((grupo) => usuario.grupos.includes(grupo.id));
}

/** Todos los grupos del centro. Es información pública, no hace falta filtro. */
export async function todosLosGrupos(): Promise<Grupo[]> {
  return gruposAhora();
}

export async function grupo(id: string): Promise<Grupo | undefined> {
  return grupoPorId(id);
}

/**
 * Los alumnos matriculados en un grupo, con su teléfono y su correo.
 *
 * Son datos de contacto de personas, así que la comprobación se hace aquí y
 * no en la página: solo pasan el administrador y el profesor de *ese* grupo.
 */
export async function alumnosDeGrupo(grupoId: string): Promise<Usuario[]> {
  await exigirPermisoEnGrupo("ver:alumnos", grupoId);

  return (await usuariosAhora())
    .filter(
      (usuario) =>
        usuario.activo &&
        usuario.rol === "alumno" &&
        usuario.grupos.includes(grupoId),
    )
    .sort(porNombre);
}

/**
 * Todas las cuentas del centro, de alta y de baja, para la pantalla de
 * usuarios. Solo para quien pueda gestionarlas: el administrador.
 */
export async function todasLasCuentas(): Promise<Usuario[]> {
  await exigirPermiso("gestionar:usuarios");
  return (await usuariosAhora()).sort(porNombre);
}

/**
 * La ficha de una persona, para editarla desde la pantalla de usuarios, con el
 * punto en el que está su cuenta de acceso. Solo para el administrador.
 */
export async function fichaDeUsuario(id: string): Promise<
  | (Usuario & { cuenta: "sin-cuenta" | "pendiente" | "activa" })
  | undefined
> {
  await exigirPermiso("gestionar:usuarios");

  const usuario = await usuarioPorId(id);
  if (!usuario) return undefined;

  const cuenta = usuario.authId ? await estadoDeCuenta(usuario.authId) : null;
  return { ...usuario, cuenta: cuenta ?? "sin-cuenta" };
}

/**
 * La ficha de ropa de quien esté mirando.
 *
 * No lleva comprobación de permiso porque son sus propios datos, igual que su
 * nombre o su teléfono: cada uno ve lo suyo. El permiso `editar:mi-ropa` es lo
 * que decide si a ese rol le sale la sección, no si puede verse a sí mismo.
 *
 * No hay forma de pedir la ropa de *otra* persona, y es a propósito: eso llega
 * cuando hagamos la pantalla de secretaría, y entonces sí llevará permiso.
 */
export async function miRopa(): Promise<Ropa> {
  const usuario = await exigirUsuario();
  return ropaDe(usuario.id);
}

/**
 * Quién imparte un grupo. Sale de las matrículas de cada profesor, así que no
 * hay que mantenerlo en dos sitios.
 */
export async function profesoresDeGrupo(grupoId: string): Promise<Usuario[]> {
  return (await usuariosAhora()).filter(
    (usuario) =>
      usuario.activo &&
      usuario.rol === "profesor" &&
      usuario.grupos.includes(grupoId),
  );
}
