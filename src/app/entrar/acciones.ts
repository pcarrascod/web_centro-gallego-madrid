"use server";

import { redirect } from "next/navigation";
import { usuarioPorAuthId } from "@/lib/almacen";
import {
  cambiarClave,
  cerrarSesion,
  entrarConClave,
  esTipoDeEnlace,
  leerSesion,
  pedirCambioDeClave,
  verificarEnlace,
} from "@/lib/sesion";

/**
 * Entrar, salir y todo lo que tiene que ver con la contraseña.
 *
 * `"use server"` arriba significa que estas funciones se ejecutan en el
 * servidor aunque las llame un botón del navegador. La contraseña viaja, se
 * comprueba allí y nunca llega al código de la página.
 */

/** Lo que el formulario le devuelve a la pantalla: un error, o nada. */
export type EstadoEntrar = { error: string | null };

/** Lo mismo, para los formularios que además dicen «hecho». */
export type EstadoAviso = { mensaje: string | null; error: string | null };

/** Lo mínimo para una contraseña. Supabase pide 6; nosotros, algo más. */
const LARGO_MINIMO = 8;

export async function entrar(
  _anterior: EstadoEntrar,
  datos: FormData,
): Promise<EstadoEntrar> {
  const email = String(datos.get("email") ?? "");
  const clave = String(datos.get("clave") ?? "");
  const volver = String(datos.get("volver") ?? "");

  const authId = await entrarConClave(email, clave);

  /* El mismo mensaje si el correo no existe que si la contraseña está mal: si
     dijéramos «ese correo no está dado de alta», cualquiera podría ir probando
     correos para averiguar quién es socio del centro. */
  if (!authId) {
    return { error: "El correo o la contraseña no son correctos." };
  }

  /* La contraseña está bien, pero la cuenta tiene que tener una ficha de alta
     en el centro. Aquí sí se puede ser claro: quien llega hasta este punto ya
     ha demostrado que la cuenta es suya. */
  const usuario = await usuarioPorAuthId(authId);
  if (!usuario?.activo) {
    await cerrarSesion();
    return {
      error:
        "Tu cuenta está dada de baja. Si crees que es un error, habla con secretaría.",
    };
  }

  /* `redirect` corta aquí: lo que venga después no se ejecuta. */
  redirect(destinoSeguro(volver));
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/");
}

/**
 * «He olvidado la contraseña»: manda el correo con el enlace para elegir una
 * nueva. Siempre contesta lo mismo, exista el correo o no.
 */
export async function pedirEnlace(
  _anterior: EstadoAviso,
  datos: FormData,
): Promise<EstadoAviso> {
  const email = String(datos.get("email") ?? "").trim();
  if (!email) return { mensaje: null, error: "Escribe tu correo." };

  await pedirCambioDeClave(email);

  return {
    mensaje:
      "Si ese correo tiene cuenta, te acaba de llegar un enlace para elegir " +
      "contraseña. Mira también en la carpeta de spam.",
    error: null,
  };
}

/**
 * El botón «Continuar» de la página a la que lleva el correo.
 *
 * Se pide pulsar un botón en vez de comprobar el enlace nada más abrirlo
 * porque algunos correos (Outlook, sobre todo) abren los enlaces por su
 * cuenta para ver si son peligrosos, y como el enlace solo vale una vez, lo
 * gastarían antes de que llegase la persona.
 */
export async function confirmarEnlace(
  _anterior: EstadoEntrar,
  datos: FormData,
): Promise<EstadoEntrar> {
  const tokenHash = String(datos.get("token_hash") ?? "");
  const tipo = datos.get("tipo");

  if (!tokenHash || !esTipoDeEnlace(tipo) || !(await verificarEnlace(tokenHash, tipo))) {
    return {
      error:
        "Este enlace ya no vale: caduca a las 24 horas y solo sirve una vez. " +
        "Pide otro desde «He olvidado la contraseña».",
    };
  }

  redirect("/entrar/clave");
}

/** Elegir contraseña, después de haber abierto el enlace del correo. */
export async function elegirClave(
  _anterior: EstadoEntrar,
  datos: FormData,
): Promise<EstadoEntrar> {
  const clave = String(datos.get("clave") ?? "");
  const repetida = String(datos.get("repetida") ?? "");

  if (!(await leerSesion())) {
    return {
      error: "Se ha cerrado la sesión. Vuelve a abrir el enlace del correo.",
    };
  }
  if (clave.length < LARGO_MINIMO) {
    return {
      error: `La contraseña tiene que tener al menos ${LARGO_MINIMO} caracteres.`,
    };
  }
  if (clave !== repetida) {
    return { error: "Las dos contraseñas no coinciden." };
  }

  const error = await cambiarClave(clave);
  if (error) return { error };

  redirect("/panel");
}

/**
 * A dónde mandar a alguien después de entrar.
 *
 * Si venía de una página privada, el proxy nos ha pasado su dirección y le
 * devolvemos allí. Pero eso llega en la URL, y la URL la escribe quien quiera:
 * si aceptásemos cualquier valor, alguien podría repartir un enlace a nuestra
 * pantalla de entrar que acabase soltando a la víctima en su web, ya con la
 * confianza de haber entrado en la nuestra. Así que solo admitimos rutas de
 * dentro: empiezan por una barra y no por dos (`//otra-web.com` es de fuera).
 */
function destinoSeguro(volver: string): string {
  const esDeCasa =
    volver.startsWith("/") && !volver.startsWith("//") && !volver.startsWith("/\\");
  return esDeCasa ? volver : "/panel";
}
