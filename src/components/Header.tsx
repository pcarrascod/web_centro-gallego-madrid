"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { centro, navegacion } from "@/data/centro";
import { CruzSantiago } from "./CruzSantiago";

/**
 * `cuenta` es el botón de entrar o el avatar con su menú, según haya sesión o
 * no. Llega ya montado desde el layout porque eso hay que decidirlo en el
 * servidor, leyendo la cookie, y aquí estamos en el navegador.
 */
export function Header({ cuenta }: { cuenta: React.ReactNode }) {
  const ruta = usePathname();

  /*
   * El menú móvil tiene que cerrarse al cambiar de página. En vez de guardar
   * «abierto sí o no» y cerrarlo cuando la ruta cambia, guardamos *en qué
   * página* se abrió: si la ruta de ahora no es esa, está cerrado. Así se
   * cierra solo al navegar, sin tener que vigilar nada.
   */
  const [abiertaEn, setAbiertaEn] = useState<string | null>(null);
  const navAbierta = abiertaEn === ruta;

  return (
    <header className="header">
      <div className="header-in">
        <Link className="brand" href="/">
          <CruzSantiago />
          <span>
            <span className="brand-name">{centro.nombre}</span>
            <br />
            <span className="brand-sub">{centro.subtitulo}</span>
          </span>
        </Link>

        <nav className={`nav ${navAbierta ? "open" : ""}`.trim()}>
          {navegacion.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              aria-current={ruta === enlace.href ? "page" : undefined}
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>

        <div className="tools">
          <select className="lang" aria-label="Idioma" defaultValue="Castellano">
            <option>Castellano</option>
            <option>Galego</option>
          </select>

          {cuenta}

          <button
            className="burger"
            aria-label="Menú"
            aria-expanded={navAbierta}
            onClick={() => setAbiertaEn(navAbierta ? null : ruta)}
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
              <path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
