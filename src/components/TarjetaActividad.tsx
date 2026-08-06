"use client";

import { useState } from "react";
import type { Grupo } from "@/data/grupos";
import { Foto } from "./Foto";

/**
 * Una tarjeta de la página Actividades.
 *
 * Aviso: el botón «Solicitar plaza» hoy solo cambia de aspecto — no envía
 * nada a secretaría. Para que la solicitud llegue de verdad hace falta
 * añadir un formulario o una base de datos (ver README).
 */
export function TarjetaActividad({ grupo }: { grupo: Grupo }) {
  const [solicitado, setSolicitado] = useState(grupo.solicitado);

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
          <button
            className="btn sm join"
            aria-pressed={solicitado}
            onClick={() => setSolicitado((v) => !v)}
          >
            {solicitado ? "Solicitado" : "Solicitar plaza"}
          </button>
          <span className="state">
            {solicitado ? grupo.estadoSolicitado : grupo.estado}
          </span>
        </div>
      </div>
    </article>
  );
}
