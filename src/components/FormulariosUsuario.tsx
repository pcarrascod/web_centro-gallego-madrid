"use client";

import { useActionState, useState } from "react";
import {
  anadirAlumno,
  darDeAlta,
  guardarFicha,
  quitarAlumno,
  reenviarInvitacion,
} from "@/app/panel/acciones";
import { type Rol, roles, todosLosRoles } from "@/lib/roles";

/**
 * Los formularios para dar de alta a gente: el de secretaría en Usuarios (con
 * rol y grupos), el de la ficha de cada persona, el botón de mandar la
 * invitación y el de los profesores en la ficha de su grupo.
 */

/** Un grupo, con lo justo para pintar su casilla. */
type GrupoCorto = { id: string; nombre: string };

/**
 * Las casillas de los grupos. A un administrador no se le enseñan, porque
 * llega a todos los grupos sin necesidad de estar en ninguno.
 */
function CasillasDeGrupos({
  grupos,
  marcados,
  rol,
}: {
  grupos: GrupoCorto[];
  marcados: string[];
  rol: Rol;
}) {
  if (rol === "admin") {
    return (
      <p className="ayuda">
        Un administrador ve y edita todos los grupos, no hace falta apuntarle a
        ninguno.
      </p>
    );
  }

  return (
    <fieldset className="casillas">
      <legend>{rol === "profesor" ? "Grupos que imparte" : "Grupos en los que está"}</legend>
      {grupos.map((grupo) => (
        <label key={grupo.id} className="casilla">
          <input
            type="checkbox"
            name="grupos"
            value={grupo.id}
            defaultChecked={marcados.includes(grupo.id)}
          />
          {grupo.nombre}
        </label>
      ))}
    </fieldset>
  );
}

export function FormularioAlta({ grupos }: { grupos: GrupoCorto[] }) {
  const [estado, accion, enviando] = useActionState(darDeAlta, {
    error: null,
    valores: null,
  });
  const antes = estado.valores;

  /* El rol va controlado porque de él depende qué casillas salen. */
  const [rol, setRol] = useState<Rol>("alumno");

  return (
    <form className="form form-ancho" action={accion}>
      <div className="campos-dos">
        <div className="campo">
          <label htmlFor="alta-nombre">Nombre</label>
          <input id="alta-nombre" name="nombre" required autoComplete="off" defaultValue={antes?.nombre} />
        </div>
        <div className="campo">
          <label htmlFor="alta-apellidos">Apellidos</label>
          <input id="alta-apellidos" name="apellidos" autoComplete="off" defaultValue={antes?.apellidos} />
        </div>
        <div className="campo">
          <label htmlFor="alta-email">Correo electrónico</label>
          <input id="alta-email" name="email" type="email" required autoComplete="off" defaultValue={antes?.email} />
          <p className="ayuda">Le llegará aquí la invitación para elegir contraseña.</p>
        </div>
        <div className="campo">
          <label htmlFor="alta-telefono">Teléfono</label>
          <input id="alta-telefono" name="telefono" type="tel" autoComplete="off" defaultValue={antes?.telefono} />
        </div>
        <div className="campo">
          <label htmlFor="alta-rol">Rol</label>
          <select
            id="alta-rol"
            name="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
          >
            {todosLosRoles.map((r) => (
              <option key={r} value={r}>
                {roles[r].etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="campo">
        <CasillasDeGrupos grupos={grupos} marcados={antes?.grupos ?? []} rol={rol} />
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}

      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Dando de alta…" : "Dar de alta y mandar invitación"}
      </button>
    </form>
  );
}

export function FormularioFicha({
  usuario,
  grupos,
}: {
  usuario: {
    id: string;
    nombreDePila: string;
    apellidos: string;
    email: string;
    telefono: string;
    rol: Rol;
    grupos: string[];
  };
  grupos: GrupoCorto[];
}) {
  const [estado, accion, guardando] = useActionState(guardarFicha, {
    mensaje: null,
    error: null,
  });

  return (
    <form className="form form-ancho" action={accion}>
      <input type="hidden" name="usuario" value={usuario.id} />

      <div className="campos-dos">
        <div className="campo">
          <label htmlFor="ficha-nombre">Nombre</label>
          <input id="ficha-nombre" name="nombre" required defaultValue={usuario.nombreDePila} />
        </div>
        <div className="campo">
          <label htmlFor="ficha-apellidos">Apellidos</label>
          <input id="ficha-apellidos" name="apellidos" defaultValue={usuario.apellidos} />
        </div>
        <div className="campo">
          <label htmlFor="ficha-email">Correo electrónico</label>
          <input id="ficha-email" name="email" type="email" required defaultValue={usuario.email} />
          <p className="ayuda">Es con lo que entra. Si lo cambias, entra con el nuevo desde ya.</p>
        </div>
        <div className="campo">
          <label htmlFor="ficha-telefono">Teléfono</label>
          <input id="ficha-telefono" name="telefono" type="tel" defaultValue={usuario.telefono} />
        </div>
      </div>

      <div className="campo">
        <CasillasDeGrupos grupos={grupos} marcados={usuario.grupos} rol={usuario.rol} />
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}
      {estado.mensaje && <p className="form-ok">{estado.mensaje}</p>}

      <button className="btn" type="submit" disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

export function BotonReenviar({
  usuarioId,
  texto,
}: {
  usuarioId: string;
  texto: string;
}) {
  const [estado, accion, enviando] = useActionState(reenviarInvitacion, {
    mensaje: null,
    error: null,
  });

  return (
    <form action={accion}>
      <input type="hidden" name="usuario" value={usuarioId} />

      {estado.error && <p className="form-error">{estado.error}</p>}
      {estado.mensaje && <p className="form-ok">{estado.mensaje}</p>}

      <button className="btn ghost sm" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : texto}
      </button>
    </form>
  );
}

/**
 * Apuntar a un alumno desde la ficha de un grupo. Sin rol ni grupos que elegir:
 * es alumno, y va a este grupo.
 */
export function FormularioAlumno({
  grupoId,
  pideAprobacion,
}: {
  grupoId: string;
  /** `true` si lo usa un profesor: la invitación la aprueba secretaría. */
  pideAprobacion: boolean;
}) {
  const [estado, accion, enviando] = useActionState(anadirAlumno, {
    mensaje: null,
    error: null,
    valores: null,
  });
  const antes = estado.valores;

  return (
    <form className="form form-ancho" action={accion}>
      <input type="hidden" name="grupo" value={grupoId} />

      <div className="campos-dos">
        <div className="campo">
          <label htmlFor="alumno-nombre">Nombre</label>
          <input id="alumno-nombre" name="nombre" required autoComplete="off" defaultValue={antes?.nombre} />
        </div>
        <div className="campo">
          <label htmlFor="alumno-apellidos">Apellidos</label>
          <input id="alumno-apellidos" name="apellidos" autoComplete="off" defaultValue={antes?.apellidos} />
        </div>
        <div className="campo">
          <label htmlFor="alumno-email">Correo electrónico</label>
          <input id="alumno-email" name="email" type="email" required autoComplete="off" defaultValue={antes?.email} />
          <p className="ayuda">
            Si ya es alumno del centro, se le apunta a este grupo sin más.
          </p>
        </div>
        <div className="campo">
          <label htmlFor="alumno-telefono">Teléfono</label>
          <input id="alumno-telefono" name="telefono" type="tel" autoComplete="off" defaultValue={antes?.telefono} />
        </div>
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}
      {estado.mensaje && <p className="form-ok">{estado.mensaje}</p>}

      <button className="btn" type="submit" disabled={enviando}>
        {enviando
          ? "Apuntando…"
          : pideAprobacion
            ? "Apuntar y pedir la invitación"
            : "Apuntar y mandar la invitación"}
      </button>
    </form>
  );
}

/**
 * Quitar a un alumno de un grupo. Pregunta antes, porque está en una lista
 * donde es fácil pulsar la fila equivocada.
 */
export function BotonQuitar({
  grupoId,
  usuarioId,
  nombre,
  nombreGrupo,
}: {
  grupoId: string;
  usuarioId: string;
  nombre: string;
  nombreGrupo: string;
}) {
  return (
    <form
      action={quitarAlumno}
      onSubmit={(e) => {
        if (!confirm(`¿Quitar a ${nombre} de ${nombreGrupo}? Seguirá en sus otros grupos.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="grupo" value={grupoId} />
      <input type="hidden" name="usuario" value={usuarioId} />
      <button className="btn ghost sm" type="submit" aria-label={`Quitar a ${nombre} del grupo`}>
        Quitar
      </button>
    </form>
  );
}
