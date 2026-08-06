import { centro } from "@/data/centro";
import { CruzSantiago } from "./CruzSantiago";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div className="brand">
            <CruzSantiago color="#fff" />
            <span>
              <span className="brand-name">{centro.nombre}</span>
              <br />
              <span className="brand-sub" style={{ color: "#9095AC" }}>
                {centro.subtitulo}
              </span>
            </span>
          </div>

          <p className="small footer-dir">
            {centro.direccion.calle} · {centro.direccion.cp} {centro.direccion.ciudad}
            <br />
            Secretaría: {centro.secretaria.horario.toLowerCase()}
          </p>
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
