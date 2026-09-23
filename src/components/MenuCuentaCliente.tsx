"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { salir } from "@/app/entrar/acciones";

/**
 * El desplegable del avatar, ya con sesión de verdad.
 *
 * Solo se ocupa de abrirse y cerrarse: quién eres y qué enlaces te tocan lo
 * decide `MenuCuenta`, que se ejecuta en el servidor. Aquí no llega ningún
 * dato que no se pueda ver.
 */
export function MenuCuentaCliente({
  nombre,
  letras,
  rol,
  enlaces,
}: {
  nombre: string;
  letras: string;
  rol: string;
  enlaces: { href: string; texto: string }[];
}) {
  const caja = useRef<HTMLDivElement>(null);
  const ruta = usePathname();

  /*
   * Guardamos en qué página se abrió el menú, y no un simple sí/no: si la ruta
   * de ahora no es esa, está cerrado. Con eso se cierra solo al navegar, sin
   * tener que vigilar los cambios de página.
   */
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn === ruta;

  function cerrar() {
    setAbiertoEn(null);
  }

  /* Se cierra al pulsar fuera o con Escape. */
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) cerrar();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };

    document.addEventListener("click", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  return (
    <div className="avatar-wrap" ref={caja}>
      <button
        className="avatar avatar-letras"
        aria-haspopup="true"
        aria-expanded={abierto}
        aria-label={`Mi cuenta · ${nombre}`}
        onClick={(e) => {
          e.stopPropagation();
          setAbiertoEn(abierto ? null : ruta);
        }}
      >
        {letras}
      </button>

      <div className={`menu ${abierto ? "open" : ""}`.trim()}>
        <p className="menu-quien">
          <strong>{nombre}</strong>
          <span>{rol}</span>
        </p>
        <hr />

        {/*
         * El `onClick` hace falta porque algunos enlaces van a una sección de la
         * página en la que ya estás: al no cambiar de página, no se cerraría
         * solo. Y el clic dentro del menú tampoco cuenta como «pulsar fuera».
         */}
        {enlaces.map((enlace) => (
          <Link key={enlace.href} href={enlace.href} onClick={cerrar}>
            {enlace.texto}
          </Link>
        ))}

        <hr />
        <form action={salir}>
          <button type="submit" className="out">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
