import Link from "next/link";
import { Cta } from "@/components/Cta";
import { Foto } from "@/components/Foto";
import { centro } from "@/data/centro";
import { MESES, aFecha, aISO, proximosEventos } from "@/data/eventos";

/* Se regenera cada hora para que «Lo que viene» no se quede atrás. */
export const revalidate = 3600;

export default function Inicio() {
  const hoy = aISO(new Date());
  const citas = proximosEventos(hoy, 3);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-band" aria-hidden="true" />
        <div className="hero-in">
          <div className="hero-card">
            <p className="eyebrow">{centro.temporada}</p>
            <h1>
              Galicia
              <br />
              suena en
              <br />
              <em>Madrid</em>
            </h1>
            <p className="lead" style={{ marginTop: 22 }}>
              Coro, baile, pandereta, gaita, percusión y cantos de taberna. Cada semana, en la calle Carretas, desde{" "}
              {centro.fundacion}.
            </p>
            <div className="hero-acciones">
              <Link className="btn" href="/actividades">
                Ver actividades
              </Link>
              <Link className="btn ghost" href="/calendario">
                Calendario
              </Link>
            </div>
            <div className="hero-meta">
              {centro.destacados.map((d) => (
                <div key={d.etiqueta}>
                  <strong>{d.valor}</strong>
                  {d.etiqueta}
                </div>
              ))}
            </div>
          </div>
          <Foto
            texto="Foto · a Determinar"
            className="hero-photo"
          />
        </div>
      </div>

      <div className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Próximas citas</p>
              <h2>Lo que viene</h2>
            </div>
            <Link className="link" href="/calendario">
              Todo el calendario
            </Link>
          </div>
          <div className="dates">
            {citas.map((cita) => {
              const fecha = aFecha(cita.fecha);
              return (
                <article className="date" key={cita.fecha + cita.titulo}>
                  <p className="mon">{MESES[fecha.getMonth()]}</p>
                  <p className="day">{String(fecha.getDate()).padStart(2, "0")}</p>
                  <h3>{cita.titulo}</h3>
                  <p className="small">
                    {cita.lugar} · {cita.hora}
                    <br />
                    {cita.descripcion}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section tint">
        <div className="wrap two">
          <div>
            <p className="eyebrow">Nosotros</p>
            <h2>Una casa gallega en el centro de Madrid</h2>
            <p className="lead" style={{ marginTop: 20 }}>
              Somos una asociación cultural sin ánimo de lucro. Enseñamos y mantenemos
              vivo el baile, la música y la lengua de Galicia para quien vive lejos de
              ella — y para quien nunca ha estado.
            </p>
            <p>
              <Link className="link" href="/nosotros">
                Conoce el centro
              </Link>
            </p>
          </div>
          <Foto texto="Foto · Sede, salón de ensayos" style={{ aspectRatio: "5/4" }} />
        </div>
      </div>

      <Cta
        eyebrow="Hazte socio"
        titulo="No hace falta ser gallego. Ni saber cantar, bailar o tocar."
        texto={`Los grupos de iniciación empiezan de cero cada septiembre. La cuota de socio es de ${centro.cuotaMensual} al mes e incluye todas las clases.`}
        boton="Solicitar plaza"
        href="/solicitar"
      />
    </div>
  );
}
