import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseConfigurado, supabasePublico } from "@/lib/entorno";

/**
 * El portero de la puerta de la calle.
 *
 * Este archivo se ejecuta antes de que Next.js decida qué página servir, y
 * hace dos cosas:
 *
 *   1. Renovar la sesión. La sesión de Supabase dura una hora y se renueva
 *      sola, pero solo se puede renovar donde se pueden escribir cookies, y
 *      las páginas no pueden. Por eso se hace aquí, en todas las visitas: si
 *      no, la cabecera dejaría de reconocerte al cabo de una hora.
 *   2. Mandar a la pantalla de entrar a quien abra el panel sin sesión, sin
 *      llegar a montar la página privada.
 *
 * Ojo con lo que NO hace: no mira qué rol tienes. Los permisos de verdad se
 * comprueban en `src/lib/acceso.ts`, pegados a los datos. Esto es un atajo
 * cómodo, no una cerradura.
 *
 * (En Next.js 16 esto se llama «proxy». En versiones anteriores era
 * `middleware.ts`: es lo mismo con otro nombre.)
 */

export async function proxy(peticion: NextRequest) {
  /* Sin Supabase configurado, la parte pública de la web funciona igual. */
  if (!supabaseConfigurado()) return NextResponse.next();

  let respuesta = NextResponse.next({ request: peticion });
  const { url, clave } = supabasePublico();

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll: () => peticion.cookies.getAll(),
      setAll(cookiesNuevas, cabeceras) {
        /* La cookie renovada tiene que llegar a dos sitios: a la página que se
           va a pintar ahora (en la petición) y al navegador (en la respuesta),
           para que la guarde para la próxima vez. */
        for (const { name, value } of cookiesNuevas) {
          peticion.cookies.set(name, value);
        }
        respuesta = NextResponse.next({ request: peticion });
        for (const { name, value, options } of cookiesNuevas) {
          respuesta.cookies.set(name, value, options);
        }
        for (const [nombre, valor] of Object.entries(cabeceras)) {
          respuesta.headers.set(nombre, valor);
        }
      },
    },
  });

  /* Esta llamada es la que renueva la sesión si hace falta. */
  const { data } = await supabase.auth.getClaims();
  const haySesion = Boolean(data?.claims);

  const ruta = peticion.nextUrl.pathname;

  /* Página privada sin sesión: a entrar, y nos acordamos de a dónde iba para
     devolverle allí en cuanto entre. */
  if (!haySesion && ruta.startsWith("/panel")) {
    const destino = new URL("/entrar", peticion.nextUrl);
    destino.searchParams.set("volver", ruta);

    const redireccion = NextResponse.redirect(destino);
    for (const cookie of respuesta.cookies.getAll()) {
      redireccion.cookies.set(cookie);
    }
    return redireccion;
  }

  return respuesta;
}

/**
 * Todas las páginas, porque en todas la cabecera mira si has entrado. Se
 * saltan los archivos estáticos: imágenes, estilos y el JavaScript de Next.js.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
