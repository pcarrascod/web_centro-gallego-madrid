import type { Metadata } from "next";
import Link from "next/link";
import { FormularioConfirmar } from "@/components/FormulariosClave";
import { PantallaEntrar } from "@/components/PantallaEntrar";

export const metadata: Metadata = {
  title: "Activar la cuenta",
  robots: { index: false },
};

/**
 * La página a la que llevan los correos de invitación y de «he olvidado la
 * contraseña». La dirección la ponen las plantillas de correo de Supabase
 * (ver README): `/entrar/confirmar?token_hash=…&type=invite` o `type=recovery`.
 */
export default async function Confirmar({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type: tipo } = await searchParams;
  const esInvitacion = tipo === "invite";

  if (!tokenHash || !tipo) {
    return (
      <PantallaEntrar
        titulo="Falta algo en el enlace"
        entradilla="Abre el enlace directamente desde el correo, sin copiar solo un trozo."
      >
        <p className="small">
          <Link className="link" href="/entrar/olvide">
            Pedir un enlace nuevo
          </Link>
        </p>
      </PantallaEntrar>
    );
  }

  return (
    <PantallaEntrar
      titulo={esInvitacion ? "Te damos la bienvenida" : "Contraseña nueva"}
      entradilla={
        esInvitacion
          ? "Secretaría te ha dado de alta en la zona privada del centro. Pulsa continuar para elegir tu contraseña."
          : "Pulsa continuar para elegir tu contraseña nueva."
      }
    >
      <FormularioConfirmar tokenHash={tokenHash} tipo={tipo} />
    </PantallaEntrar>
  );
}
