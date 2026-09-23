import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { FormularioClave } from "@/components/FormulariosClave";
import { PantallaEntrar } from "@/components/PantallaEntrar";
import { supabaseConfigurado } from "@/lib/entorno";
import { leerSesion } from "@/lib/sesion";

export const metadata: Metadata = {
  title: "Elegir contraseña",
  robots: { index: false },
};

/**
 * Elegir contraseña. Se llega aquí desde el enlace del correo, que deja la
 * sesión abierta; sin sesión, no hay de quién cambiar la contraseña.
 */
export default async function Clave() {
  await connection();
  if (!supabaseConfigurado() || !(await leerSesion())) redirect("/entrar");

  return (
    <PantallaEntrar
      titulo="Elige tu contraseña"
      entradilla="Es la que usarás a partir de ahora para entrar, junto con tu correo."
    >
      <FormularioClave />
    </PantallaEntrar>
  );
}
