import type { Metadata } from "next";
import { Cta } from "@/components/Cta";
import { TarjetaActividad } from "@/components/TarjetaActividad";
import { todosLosGrupos } from "@/lib/acceso";

export const metadata: Metadata = {
  title: "Actividades",
  description:
    "Baile tradicional, canto y pandereta, banda de gaitas y coro. Horarios, niveles y plazas disponibles en el Centro Gallego de Madrid.",
};

/*
 * Los grupos se piden a `lib/acceso` y no a `data/grupos` para que aquí se
 * vean los horarios que un profesor haya cambiado desde el panel. Es
 * información pública: no hay que haber entrado para verla.
 */
export default async function Actividades() {
  const grupos = await todosLosGrupos();

  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <p className="eyebrow">Actividades</p>
          <h1 style={{ fontSize: "clamp(2.4rem,5vw,3.6rem)" }}>
            Seis grupos,
            <br />
            una sede
          </h1>
          <p className="lead" style={{ margin: "20px 0 44px" }}>
            Pide plaza en el grupo que quieras
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
        titulo="Ven a un ensayo y pruébalo"
        texto="Los ensayos están abiertos a todo el mundo. Ven a vernos y a probar, sin compromiso."
        boton="Ver horarios"
        href="/calendario"
      />
    </div>
  );
}
