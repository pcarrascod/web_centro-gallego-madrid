/**
 * Preparar la base de datos de Supabase. Se ejecuta desde la terminal:
 *
 *   npm run preparar-base
 *       Copia los grupos de `src/data/grupos.ts` a la tabla `grupos`. Hace
 *       falta porque las matrículas apuntan a esa tabla: sin el grupo allí, no
 *       se puede matricular a nadie en él. Se puede repetir sin miedo, y hay
 *       que repetirlo cada vez que se añada un grupo nuevo a `grupos.ts`.
 *
 *   npm run preparar-base -- --admin correo@ejemplo.com "Nombre" "Apellidos"
 *       Lo mismo, y además da de alta a una administradora y le manda la
 *       invitación. Es la forma de crear la primera cuenta: desde la web no se
 *       puede, porque para dar de alta a alguien hay que ser ya administradora.
 *
 * Lee las claves de `.env.local`.
 */

import { createClient } from "@supabase/supabase-js";
import { grupos } from "../src/data/grupos.ts";

const url = process.env.SUPABASE_URL;
const secreta = process.env.SUPABASE_SECRET_KEY;
if (!url || !secreta) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local.");
  process.exit(1);
}

const supabase = createClient(url, secreta, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parar(que, error) {
  console.error(`✗ ${que}: ${error.message}`);
  process.exit(1);
}

/* ---------- Grupos ---------- */

const { error: errorGrupos } = await supabase.from("grupos").upsert(
  grupos.map((grupo, orden) => ({
    id: grupo.id,
    categoria: grupo.categoria,
    nombre: grupo.nombre,
    nombre_corto: grupo.nombreCorto,
    quien: grupo.quien,
    dia: grupo.dia,
    foto: grupo.foto ?? null,
    estado: grupo.estado ?? null,
    orden,
  })),
  { onConflict: "id" },
);
if (errorGrupos) parar("Copiar los grupos", errorGrupos);
console.log(`✓ ${grupos.length} grupos copiados.`);

/* ---------- La primera administradora ---------- */

const posicion = process.argv.indexOf("--admin");
if (posicion === -1) process.exit(0);

const [email, nombre, apellidos] = process.argv.slice(posicion + 1);
if (!email || !nombre) {
  console.error('Uso: npm run preparar-base -- --admin correo@ejemplo.com "Nombre" "Apellidos"');
  process.exit(1);
}
const correo = email.trim().toLowerCase();

/* Si ya tiene ficha, se le hace administradora; si no, se le crea. */
const { data: existente, error: errorBuscar } = await supabase
  .from("usuarios")
  .select("id, auth_id")
  .eq("email", correo)
  .maybeSingle();
if (errorBuscar) parar("Buscar la ficha", errorBuscar);

let ficha = existente;
if (ficha) {
  const { error } = await supabase
    .from("usuarios")
    .update({ rol: "admin", activo: true, fecha_baja: null })
    .eq("id", ficha.id);
  if (error) parar("Hacerla administradora", error);
} else {
  const { data, error } = await supabase
    .from("usuarios")
    .insert({ nombre, apellidos: apellidos || null, email: correo, rol: "admin" })
    .select("id, auth_id")
    .single();
  if (error) parar("Crear la ficha", error);
  ficha = data;
}
console.log(`✓ Ficha de ${nombre} lista, como administradora.`);

const { data: invitacion, error: errorInvitar } =
  await supabase.auth.admin.inviteUserByEmail(correo);

/* Si ya abrió una invitación antes, Supabase no deja mandar otra: se le manda
   el correo de «elegir contraseña nueva», que lleva al mismo sitio. */
if (errorInvitar?.code === "email_exists") {
  const { error } = await supabase.auth.resetPasswordForEmail(correo);
  if (error) parar("Mandar el correo de contraseña", error);
  console.log(`✓ Ya tenía cuenta: enviado a ${correo} el enlace para elegir contraseña.`);
  process.exit(0);
}
if (errorInvitar) parar("Mandar la invitación", errorInvitar);

const { error: errorEnlazar } = await supabase
  .from("usuarios")
  .update({ auth_id: invitacion.user.id })
  .eq("id", ficha.id);
if (errorEnlazar) parar("Enlazar la cuenta", errorEnlazar);

console.log(`✓ Invitación enviada a ${correo}. Mira el correo (y el spam).`);
