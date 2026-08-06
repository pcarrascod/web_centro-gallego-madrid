import Link from "next/link";
import type { Grupo } from "@/data/grupos";
import { Foto } from "./Foto";

/**
 * Una tarjeta de la página Actividades.
 *
 * El botón lleva al formulario de solicitud con el grupo ya seleccionado.
 */
export function TarjetaActividad({ grupo }: { grupo: Grupo }) {
  return (
    <article className="act">
      <Foto texto={grupo.foto} />
      <div className="act-body">
        <h3>{grupo.nombre}</h3>
        <p className="who">{grupo.quien}</p>
        <span className="day-label">{grupo.dia}</span>

        <ul className="sched">
          {grupo.horarios.map((h) => (
            <li key={`${h.hora}-${h.nivel}`}>
              <time>{h.hora}</time>
              <span className="lvl">{h.nivel}</span>
              <span className="free">{h.plazas}</span>
            </li>
          ))}
        </ul>

        <div className="act-foot">
          <Link className="btn sm" href={`/solicitar?grupo=${grupo.id}`}>
            Solicitar plaza
          </Link>
          <span className="state">{grupo.estado}</span>
        </div>
      </div>
    </article>
  );
}
