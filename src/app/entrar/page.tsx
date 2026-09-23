import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioEntrar } from "@/components/FormularioEntrar";
import { PantallaEntrar } from "@/components/PantallaEntrar";
import { usuarioActual } from "@/lib/acceso";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Zona privada para socios, profesores y secretaría.",
  /* Que no salga en Google: no es una página para visitantes. */
  robots: { index: false },
};

export default async function Entrar({
  searchParams,
}: {
  /* En esta versión de Next.js los parámetros de la URL llegan en una promesa
     y hay que esperarlos. Aquí llega `volver`, que lo pone el proxy cuando
     alguien intenta abrir una página privada sin haber entrado. */
  searchParams: Promise<{ volver?: string }>;
}) {
  /* Ya ha entrado y vuelve aquí: al panel directamente. Se mira aquí y no en
     el proxy porque hace falta saber si la cuenta sigue de alta, y eso está
     en la base de datos. */
  if (await usuarioActual()) redirect("/panel");

  const { volver } = await searchParams;

  return (
    <PantallaEntrar
      titulo="Entra en tu cuenta"
      entradilla="Aquí ves tus grupos y tus horarios. Si llevas un grupo, además ves a tus alumnos y puedes cambiar sus horarios."
    >
      <FormularioEntrar volver={volver ?? ""} />
    </PantallaEntrar>
  );
}
