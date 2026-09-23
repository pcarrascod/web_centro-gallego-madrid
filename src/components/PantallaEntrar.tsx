import type { ReactNode } from "react";

/**
 * El marco común de las pantallas de entrar, olvidé la contraseña y elegir
 * contraseña: título, una frase de explicación y el formulario debajo.
 */
export function PantallaEntrar({
  titulo,
  entradilla,
  children,
}: {
  titulo: string;
  entradilla: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <div className="section">
        <div className="wrap wrap-estrecho">
          <p className="eyebrow">Zona privada</p>
          <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", maxWidth: "16ch" }}>
            {titulo}
          </h1>
          <p className="lead" style={{ margin: "20px 0 44px" }}>
            {entradilla}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
