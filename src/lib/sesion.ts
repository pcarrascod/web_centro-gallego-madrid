import "server-only";

import { clienteAdmin, clienteConSesion } from "./supabase";

/**
 * Las cuentas de acceso: entrar, salir, invitar y cambiar la contraseña.
 *
 * Todo esto lo hace Supabase Auth. Las contraseñas las guarda Supabase,
 * cifradas: ni la web ni la secretaría las ven nunca. Lo que nos devuelve es
 * un identificador de cuenta (`auth_id`), y la ficha de la persona —nombre,
 * rol, grupos— vive aparte, en la tabla `usuarios`, enlazada por ese id.
 *
 * Este es el único archivo que llama a `supabase.auth`. Si algún día se cambia
 * de sistema de login, se cambia aquí.
 */

/**
 * El id de la cuenta que ha entrado, o `null` si no hay sesión.
 *
 * `getClaims` comprueba la firma del token, así que una cookie inventada o
 * caducada da `null`. (Lo que no hay que usar para esto es `getSession`, que
 * se cree lo que diga la cookie sin mirar la firma.)
 */
export async function leerSesion(): Promise<string | null> {
  const supabase = await clienteConSesion();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

/** Comprueba correo y contraseña. Devuelve el id de la cuenta, o `null`. */
export async function entrarConClave(
  email: string,
  clave: string,
): Promise<string | null> {
  const supabase = await clienteConSesion();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: clave,
  });
  return error ? null : data.user.id;
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await clienteConSesion();
  await supabase.auth.signOut();
}

/* ---------- Invitaciones y contraseñas ---------- */

/** Los dos correos que llevan a elegir contraseña. */
export type TipoDeEnlace = "invite" | "recovery";

export function esTipoDeEnlace(valor: unknown): valor is TipoDeEnlace {
  return valor === "invite" || valor === "recovery";
}

/**
 * Comprobar el enlace que llega por correo. Si vale, deja la sesión abierta
 * para que la persona pueda elegir su contraseña a continuación.
 *
 * El enlace solo sirve una vez y caduca a las 24 horas.
 */
export async function verificarEnlace(
  tokenHash: string,
  tipo: TipoDeEnlace,
): Promise<boolean> {
  const supabase = await clienteConSesion();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: tipo,
  });
  return !error;
}

/** Poner contraseña nueva a la cuenta que tiene la sesión abierta. */
export async function cambiarClave(clave: string): Promise<string | null> {
  const supabase = await clienteConSesion();
  const { error } = await supabase.auth.updateUser({ password: clave });
  if (!error) return null;

  if (error.code === "same_password") {
    return "Esa es la contraseña que ya tenías. Elige otra.";
  }
  if (error.code === "weak_password") {
    return "Esa contraseña es demasiado fácil de adivinar. Prueba con otra más larga.";
  }
  return "No se ha podido guardar la contraseña. Vuelve a abrir el enlace del correo.";
}

/**
 * Mandar el correo de «has olvidado la contraseña».
 *
 * No dice si el correo existe o no, por lo mismo que la pantalla de entrar:
 * si lo dijera, cualquiera podría averiguar quién es socio del centro.
 */
export async function pedirCambioDeClave(email: string): Promise<void> {
  const supabase = await clienteConSesion();
  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
}

/**
 * Crear la cuenta de alguien y mandarle el correo para que elija contraseña.
 *
 * Si la cuenta ya existía pero la persona nunca llegó a abrir el enlace, se le
 * vuelve a mandar la invitación. Si ya lo abrió, Supabase no deja invitarla
 * otra vez, así que se le manda el correo de «elegir contraseña nueva», que
 * lleva al mismo sitio. Eso cubre también a quien abrió la invitación y cerró
 * la página antes de llegar a guardar la contraseña.
 *
 * `authId` es `null` en ese segundo caso: la cuenta ya estaba enlazada.
 */
export async function invitar(
  email: string,
): Promise<{ authId: string | null } | { error: string }> {
  const correo = email.trim().toLowerCase();
  const supabase = clienteAdmin();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(correo);

  if (!error) return { authId: data.user.id };

  if (error.code === "email_exists") {
    const { error: errorRecuperar } =
      await supabase.auth.resetPasswordForEmail(correo);
    if (!errorRecuperar) return { authId: null };
    return {
      error: `No se ha podido mandar el correo: ${errorRecuperar.message}`,
    };
  }
  if (error.code === "over_email_send_rate_limit") {
    return {
      error:
        "Supabase no deja mandar más correos por ahora. Espera un rato, o " +
        "configura un servidor de correo propio (ver README).",
    };
  }
  return { error: `No se ha podido mandar la invitación: ${error.message}` };
}

/**
 * En qué punto está la cuenta de alguien:
 *
 *   "pendiente" — se le invitó, pero todavía no ha elegido contraseña.
 *   "activa"    — ya ha entrado alguna vez.
 *   null        — la cuenta ya no existe en Supabase.
 */
export async function estadoDeCuenta(
  authId: string,
): Promise<"pendiente" | "activa" | null> {
  const { data, error } = await clienteAdmin().auth.admin.getUserById(authId);
  if (error || !data.user) return null;
  return data.user.last_sign_in_at ? "activa" : "pendiente";
}
