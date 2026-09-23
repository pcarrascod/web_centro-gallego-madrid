import Link from "next/link";
import type { Usuario } from "@/lib/acceso";
import { iniciales } from "@/lib/nombres";
import { puede, roles } from "@/lib/roles";

/**
 * La franja de arriba de todas las páginas del panel: quién eres, con qué rol,
 * y los sitios a los que puedes ir.
 *
 * Los enlaces salen de los permisos, no de una lista escrita a mano: el enlace
 * a Usuarios no aparece para quien no puede gestionarlas. Aun así eso es solo
 * cortesía —quien escriba la dirección a mano no entra igualmente, porque la
 * página también lo comprueba—.
 */
export function PanelCabecera({
  usuario,
  activo,
}: {
  usuario: Usuario;
  activo: "panel" | "usuarios";
}) {
  return (
    <div className="panel-cab">
      <div className="panel-quien">
        <span className="avatar avatar-letras" aria-hidden="true">
          {iniciales(usuario.nombre)}
        </span>
        <div>
          <strong className="panel-nombre">{usuario.nombre}</strong>
          <span className="pill">{roles[usuario.rol].etiqueta}</span>
        </div>
      </div>

      <nav className="panel-nav">
        <Link href="/panel" aria-current={activo === "panel" ? "page" : undefined}>
          Mi panel
        </Link>
        {puede(usuario.rol, "gestionar:usuarios") && (
          <Link
            href="/panel/usuarios"
            aria-current={activo === "usuarios" ? "page" : undefined}
          >
            Usuarios
          </Link>
        )}
      </nav>
    </div>
  );
}
