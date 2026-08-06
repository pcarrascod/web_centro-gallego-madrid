import type { Metadata } from "next";
import { Calendario } from "@/components/Calendario";
import { aISO, mesDelProximoEvento } from "@/data/eventos";

export const metadata: Metadata = {
  title: "Calendario",
  description:
    "Ensayos semanales y actuaciones del Centro Gallego de Madrid, mes a mes. Filtra por grupo para ver solo lo tuyo.",
};

/* Se regenera cada hora para que el día de hoy quede marcado correctamente. */
export const revalidate = 3600;

export default function PaginaCalendario() {
  const hoy = new Date();
  const hoyISO = aISO(hoy);

  /* Abre en el mes del próximo evento; si no queda ninguno, en el mes actual. */
  const inicio = mesDelProximoEvento(hoyISO) ?? {
    anio: hoy.getFullYear(),
    mes: hoy.getMonth(),
  };

  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <p className="eyebrow">Calendario</p>
          <h1 style={{ fontSize: "clamp(2.4rem,5vw,3.6rem)" }}>Ensayos y actuaciones</h1>
          <p className="lead" style={{ margin: "20px 0 44px" }}>
            Todo lo del centro en un sitio. Filtra por grupo para ver solo lo tuyo.
          </p>

          <Calendario anioInicial={inicio.anio} mesInicial={inicio.mes} hoyISO={hoyISO} />
        </div>
      </div>
    </div>
  );
}
