/**
 * Las claves de Supabase, leídas de `.env.local` (en local) o de las variables
 * de entorno de Netlify (publicado).
 *
 * Ninguna lleva el prefijo `NEXT_PUBLIC_`, y es a propósito: sin él, Next.js
 * no las mete nunca en el JavaScript que se descarga el navegador. Aquí solo
 * habla con Supabase el servidor.
 *
 * Este archivo no importa nada de servidor para que lo pueda usar también el
 * proxy. La clave secreta, en cambio, solo se lee desde `supabase.ts`, que sí
 * va marcado como de servidor.
 */

function leer(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable ${nombre}. Copia .env.example a .env.local y ` +
        `rellénala con los datos de tu proyecto de Supabase (Settings → API).`,
    );
  }
  return valor;
}

/**
 * ¿Están puestas las claves? Sin ellas la parte pública de la web funciona
 * igual; lo único que no funciona es entrar.
 */
export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY,
  );
}

/** La dirección del proyecto y la clave pública, que sirve para el login. */
export function supabasePublico(): { url: string; clave: string } {
  return {
    url: leer("SUPABASE_URL"),
    clave: leer("SUPABASE_PUBLISHABLE_KEY"),
  };
}

/**
 * La clave secreta. Se salta todas las reglas de la base de datos, así que no
 * sale nunca del servidor ni se sube a GitHub.
 */
export function supabaseClaveSecreta(): string {
  return leer("SUPABASE_SECRET_KEY");
}
