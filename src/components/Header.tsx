"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { centro, menuSocio, navegacion } from "@/data/centro";
import { CruzSantiago } from "./CruzSantiago";

export function Header() {
  const ruta = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [navAbierta, setNavAbierta] = useState(false);
  const avatar = useRef<HTMLDivElement>(null);

  /* El menú del avatar se cierra al pulsar fuera o con Escape. */
  useEffect(() => {
    if (!menuAbierto) return;
    const fuera = (e: MouseEvent) => {
      if (!avatar.current?.contains(e.target as Node)) setMenuAbierto(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAbierto(false);
    };
    document.addEventListener("click", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [menuAbierto]);

  /* Al cambiar de página se cierra el menú móvil. */
  useEffect(() => {
    setNavAbierta(false);
  }, [ruta]);

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

          <div className="avatar-wrap" ref={avatar}>
            <button
              className="avatar"
              aria-haspopup="true"
              aria-expanded={menuAbierto}
              aria-label="Mi cuenta"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAbierto((v) => !v);
              }}
            />
            <div className={`menu ${menuAbierto ? "open" : ""}`.trim()}>
              {menuSocio.map((enlace) => (
                <a key={enlace.texto} href={enlace.href}>
                  {enlace.texto}
                </a>
              ))}
              <hr />
              <a href="#" className="out">
                Cerrar sesión
              </a>
            </div>
          </div>

          <button
            className="burger"
            aria-label="Menú"
            aria-expanded={navAbierta}
            onClick={() => setNavAbierta((v) => !v)}
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
