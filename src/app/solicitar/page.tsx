import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioSolicitud } from "@/components/FormularioSolicitud";

export const metadata: Metadata = {
  title: "Solicitar plaza",
  description:
    "Pide plaza en uno de los grupos del Centro Gallego de Madrid. Secretaría confirma en 48 horas.",
};

export default function Solicitar() {
  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <p className="eyebrow">Solicitar plaza</p>
          <h1 style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", maxWidth: "18ch" }}>
            Cuéntanos quién eres
          </h1>
          <p className="lead" style={{ margin: "20px 0 44px" }}>
            Secretaría lo revisa y te contesta en 48 horas. Hace falta ser socio para
            pedir plaza, no hace falta tener experiencia.
          </p>

          {/* useSearchParams necesita esta espera para poder prerenderizar la página. */}
          <Suspense fallback={<p className="small">Cargando el formulario…</p>}>
            <FormularioSolicitud />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
