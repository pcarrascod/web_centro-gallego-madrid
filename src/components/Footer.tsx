import Link from "next/link";
import { centro, menuSocio, navegacion } from "@/data/centro";
import { CruzSantiago } from "./CruzSantiago";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <CruzSantiago color="#fff" />
              <span>
                <span className="brand-name">{centro.nombre}</span>
                <br />
                <span className="brand-sub" style={{ color: "#9095AC" }}>
                  {centro.subtitulo}
                </span>
              </span>
            </div>
            <p
              className="small"
              style={{ color: "rgba(255,255,255,.7)", maxWidth: "34ch" }}
            >
              {centro.direccion.calle} · {centro.direccion.cp} {centro.direccion.ciudad}
              <br />
              Secretaría: {centro.secretaria.horario.toLowerCase()}
            </p>
          </div>

          <div>
            <h4>Navegar</h4>
            {navegacion.map((enlace) => (
              <Link key={enlace.href} href={enlace.href}>
                {enlace.texto}
              </Link>
            ))}
          </div>

          <div>
            <h4>Socios</h4>
            {menuSocio.map((enlace) => (
              <a key={enlace.texto} href={enlace.href}>
                {enlace.texto}
              </a>
            ))}
          </div>
        </div>

        <div className="fine">
          <span>
            © {new Date().getFullYear()} {centro.nombreCompleto}
          </span>
          <span>Aviso legal · Privacidad · Contacto</span>
        </div>
      </div>
    </footer>
  );
}
