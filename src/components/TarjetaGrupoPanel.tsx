import Link from "next/link";
import type { Grupo } from "@/data/grupos";
import type { Usuario } from "@/lib/acceso";
import { puedeEnGrupo } from "@/lib/roles";

/**
 * Un grupo visto desde el panel: los horarios, el aviso de estado, y —si el
 * rol lo permite— el enlace a la ficha donde se ven los alumnos y se editan
 * los horarios.
 *
 * El enlace y su texto se deciden preguntando por los permisos sobre *este*
 * grupo, no por el rol: al profesor le sale en los suyos y no en los demás.
 */
export function TarjetaGrupoPanel({
  grupo,
  usuario,
}: {
  grupo: Grupo;
  usuario: Usuario;
}) {
  const verAlumnos = puedeEnGrupo(usuario, "ver:alumnos", grupo.id);
  const editar = puedeEnGrupo(usuario, "editar:grupo", grupo.id);

  const textoEnlace =
    verAlumnos && editar
      ? "Alumnos y horarios"
      : verAlumnos
        ? "Ver los alumnos"
        : "Editar los horarios";

  return (
    <article className="ficha">
      <div className="ficha-cab">
        <h3>{grupo.nombre}</h3>
        <span className="day-label">{grupo.dia}</span>
      </div>

      <ul className="sched">
        {grupo.horarios.map((horario) => (
          <li key={`${horario.hora}-${horario.nivel}`}>
            <time>{horario.hora}</time>
            <span className="lvl">{horario.nivel}</span>
            <span className="free">{horario.plazas}</span>
          </li>
        ))}
      </ul>

      <div className="act-foot">
        {(verAlumnos || editar) && (
          <Link className="btn sm" href={`/panel/grupos/${grupo.id}`}>
            {textoEnlace}
          </Link>
        )}
        {grupo.estado && <span className="state">{grupo.estado}</span>}
      </div>
    </article>
  );
}
