import type { Metadata } from "next";
import { Foto } from "@/components/Foto";
import { centro } from "@/data/centro";
import { historia } from "@/data/historia";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "El Centro Gallego de Madrid nació en 1892 como lugar de encuentro para los gallegos que llegaban a la capital. Siete grupos ensayan cada semana en la sede de la calle Carretas.",
};

export default function Nosotros() {
  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <p className="eyebrow">Nosotros</p>
          <h1 style={{ maxWidth: "16ch" }}>
            Llevamos Galicia
            <br />a la calle Carretas
          </h1>
          <p className="lead" style={{ marginTop: 26, fontSize: "1.2rem" }}>
            El {centro.nombreCompleto} nació en {centro.fundacion} como lugar de encuentro
            para los gallegos que llegaban a la capital. Hoy sigue haciendo lo mismo:
            enseñar, ensayar y salir a la calle.
          </p>
        </div>
      </div>

      <div className="wrap">
        <Foto
          texto="Foto histórica · Socios fundadores, c. 1900"
          style={{ aspectRatio: "21/9" }}
        />
      </div>

      <div className="section">
        <div className="wrap two">
          <div>
            <p className="eyebrow">Qué hacemos</p>
            <h2>Enseñar, ensayar, actuar</h2>
            <p style={{ marginTop: 20 }}>
              Siete grupos ensayan cada semana en la sede: baile tradicional en dos
              niveles, canto y pandereta en tres, banda de gaitas y coro. Los grupos de
              repertorio actúan fuera — romerías, festivales y las fiestas gallegas de
              Madrid.
            </p>
            <p>
              El centro también organiza clases de gallego, la biblioteca de tradición
              oral y las cenas de socios que dan sentido a todo lo demás.
            </p>
            <div className="pull">
              «Aquí se aprende un pasodoble y se acaba aprendiendo de dónde viene una
              familia entera.»
            </div>
            <p className="small">Manuela Riveiro, socia desde 1978</p>
          </div>

          <div>
            <p className="eyebrow">Historia</p>
            <ul className="timeline">
              {historia.map((hito) => (
                <li key={hito.anio}>
                  <span className="yr">{hito.anio}</span>
                  <div>
                    <h3>{hito.titulo}</h3>
                    <p>{hito.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="wrap">
          <div className="stats">
            {centro.cifras.map((c) => (
              <div className="stat" key={c.etiqueta}>
                <strong>{c.valor}</strong>
                <span>{c.etiqueta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section tint">
        <div className="wrap two">
          <div>
            <p className="eyebrow">La sede</p>
            <h2>{centro.direccion.calle}</h2>
            <p style={{ marginTop: 20 }}>
              {centro.direccion.comoLlegar} Salón de ensayo con suelo de madera, sala de
              música, archivo de trajes y bar de socios.
            </p>
            <p className="small">
              <strong style={{ color: "var(--lousa)" }}>Secretaría</strong>
              <br />
              {centro.secretaria.horario}
              <br />
              {centro.secretaria.email} · {centro.secretaria.telefono}
            </p>
            <p style={{ marginTop: 24 }}>
              <a
                className="btn ghost"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${centro.direccion.calle}, ${centro.direccion.ciudad}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cómo llegar
              </a>
            </p>
          </div>
          <Foto
            texto={`Mapa · ${centro.direccion.calle}`}
            style={{ aspectRatio: "4/3" }}
          />
        </div>
      </div>
    </div>
  );
}
