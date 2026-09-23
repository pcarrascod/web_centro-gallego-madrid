import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseClaveSecreta, supabasePublico } from "./entorno";

/**
 * Las dos formas de hablar con Supabase. Solo se usan desde `sesion.ts` y
 * `almacen.ts`: el resto de la web no sabe que Supabase existe.
 */

/**
 * El cliente de la persona que está usando la web: entra, sale y cambia su
 * contraseña. Guarda la sesión en cookies `httpOnly`, firmadas por Supabase,
 * así que ya no hay forma de fabricarse una a mano como con la maqueta.
 */
export async function clienteConSesion() {
  const almacen = await cookies();
  const { url, clave } = supabasePublico();

  return createServerClient(url, clave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll(cookiesNuevas) {
        /* Una página no puede escribir cookies, solo los formularios y el
           proxy. Si Supabase intenta renovar la sesión mientras se pinta una
           página, fallaría: no pasa nada, porque el proxy ya la renueva en
           cada visita antes de llegar aquí. */
        try {
          for (const { name, value, options } of cookiesNuevas) {
            almacen.set(name, value, options);
          }
        } catch {}
      },
    },
  });
}

/**
 * El cliente de la secretaría, con la clave secreta: lee y escribe en todas
 * las tablas y puede invitar a gente. No lleva la sesión de nadie, así que
 * cada función que lo use tiene que haber comprobado antes el permiso — de eso
 * se encarga `acceso.ts`.
 */
export function clienteAdmin() {
  const { url } = supabasePublico();

  return createClient(url, supabaseClaveSecreta(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
