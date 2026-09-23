import Link from "next/link";
import { usuarioActual } from "@/lib/acceso";
import { iniciales } from "@/lib/nombres";
import { puede, roles } from "@/lib/roles";
import { MenuCuentaCliente } from "./MenuCuentaCliente";

/**
 * El trozo de la cabecera que depende de quién esté mirando: un botón de
 * entrar, o el avatar con su menú.
 *
 * Se ejecuta en el servidor y va suelto —envuelto en `Suspense` desde el
 * layout— a propósito: así el resto de la página no espera a que se lea la
 * cookie para empezar a aparecer.
 */
export async function MenuCuenta() {
  const usuario = await usuarioActual();

  if (!usuario) {
    return (
      <Link className="btn sm" href="/entrar">
        Entrar
      </Link>
    );
  }

  /*
   * Los enlaces salen de los permisos, no de una lista fija, así que a nadie le
   * aparece algo que no puede abrir.
   *
   * Los dos primeros llevan a secciones del panel y no a páginas aparte: un
   * alumno tiene todo lo suyo —clases, ropa y eventos— en la misma página, y
   * partirla en tres solo obligaría a ir y volver.
   */
  const enlaces = [
    {
      href: "/panel#mis-clases",
      texto: usuario.rol === "alumno" ? "Mis clases" : "Mi panel",
    },
  ];

  if (puede(usuario.rol, "editar:mi-ropa")) {
    enlaces.push({ href: "/panel#mi-ropa", texto: "Mi ropa" });
  }
  if (puede(usuario.rol, "gestionar:usuarios")) {
    enlaces.push({ href: "/panel/usuarios", texto: "Usuarios" });
  }

  return (
    <MenuCuentaCliente
      nombre={usuario.nombre}
      letras={iniciales(usuario.nombre)}
      rol={roles[usuario.rol].etiqueta}
      enlaces={enlaces}
    />
  );
}
