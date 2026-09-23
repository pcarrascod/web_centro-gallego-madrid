import type { Metadata } from "next";
import { FormularioOlvide } from "@/components/FormulariosClave";
import { PantallaEntrar } from "@/components/PantallaEntrar";

export const metadata: Metadata = {
  title: "He olvidado la contraseña",
  robots: { index: false },
};

export default function Olvide() {
  return (
    <PantallaEntrar
      titulo="Elige una contraseña nueva"
      entradilla="Escribe el correo con el que entras y te mandamos un enlace para elegir otra."
    >
      <FormularioOlvide />
    </PantallaEntrar>
  );
}
