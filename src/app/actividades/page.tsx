import type { Metadata } from "next";
import { Cta } from "@/components/Cta";
import { TarjetaActividad } from "@/components/TarjetaActividad";
import { grupos } from "@/data/grupos";

export const metadata: Metadata = {
  title: "Actividades",
  description:
    "Baile tradicional, canto y pandereta, banda de gaitas y coro. Horarios, niveles y plazas disponibles en el Centro Gallego de Madrid.",
};

export default function Actividades() {
  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <p className="eyebrow">Actividades</p>
          <h1 style={{ fontSize: "clamp(2.4rem,5vw,3.6rem)" }}>
            Siete grupos,
            <br />
            una sede
          </h1>
          <p className="lead" style={{ margin: "20px 0 44px" }}>
            Pide plaza en el grupo que quieras. La secretaría confirma en 48 horas y te
            dice qué ropa necesitas.
          </p>

          <div className="acts">
            {grupos.map((grupo) => (
              <TarjetaActividad grupo={grupo} key={grupo.id} />
            ))}
          </div>
        </div>
      </div>

      <Cta
        eyebrow="¿Dudas?"
        titulo="Ven un sábado y míralo"
        texto="Los ensayos de baile están abiertos a quien quiera asistir. Pregunta por Marisa en la puerta."
        boton="Ver horarios"
        href="/calendario"
      />
    </div>
  );
}
