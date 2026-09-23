"use client";

import { useActionState, useRef, useState } from "react";
import { guardarGrupo } from "@/app/panel/acciones";
import type { Horario } from "@/data/grupos";

/**
 * Editar los horarios de un grupo: cambiar los que hay, añadir y quitar filas,
 * y el aviso de estado que se lee junto al botón de solicitar plaza.
 *
 * Cada fila manda tres campos con el mismo nombre —`hora`, `nivel`,
 * `plazas`—, así que al otro lado llegan tres listas del mismo largo y en el
 * mismo orden. Es la forma más sencilla de mandar una tabla por un formulario.
 */

/** Una fila de la tabla. La `clave` es solo para React, no se manda. */
type Fila = Horario & { clave: number };

/** Los valores de «plazas» que ya se usan, para no tener que escribirlos. */
const PLAZAS_HABITUALES = [
  "Plazas disponibles",
  "Últimas plazas",
  "Completo",
  "Con audición",
];

export function FormularioGrupo({
  grupoId,
  horarios,
  estado,
}: {
  grupoId: string;
  horarios: Horario[];
  estado: string;
}) {
  const [resultado, accion, guardando] = useActionState(guardarGrupo, {
    mensaje: null,
    error: null,
  });

  const [filas, setFilas] = useState<Fila[]>(() =>
    horarios.map((horario, indice) => ({ ...horario, clave: indice })),
  );
  const proximaClave = useRef(horarios.length);

  function cambiar(clave: number, campo: keyof Horario, valor: string) {
    setFilas((actuales) =>
      actuales.map((fila) =>
        fila.clave === clave ? { ...fila, [campo]: valor } : fila,
      ),
    );
  }

  function anadirFila() {
    setFilas((actuales) => [
      ...actuales,
      { hora: "", nivel: "", plazas: "", clave: proximaClave.current++ },
    ]);
  }

  function quitarFila(clave: number) {
    setFilas((actuales) => actuales.filter((fila) => fila.clave !== clave));
  }

  return (
    <form className="form form-ancho" action={accion}>
      <input type="hidden" name="grupo" value={grupoId} />

      <div className="filas">
        <div className="filas-cab" aria-hidden="true">
          <span>Hora</span>
          <span>Nivel o subgrupo</span>
          <span>Plazas</span>
          <span />
        </div>

        {filas.map((fila, indice) => (
          <div className="fila" key={fila.clave}>
            <input
              name="hora"
              value={fila.hora}
              aria-label={`Hora de la fila ${indice + 1}`}
              placeholder="18.30 – 19.30"
              onChange={(e) => cambiar(fila.clave, "hora", e.target.value)}
            />
            <input
              name="nivel"
              value={fila.nivel}
              aria-label={`Nivel de la fila ${indice + 1}`}
              placeholder="Iniciación"
              onChange={(e) => cambiar(fila.clave, "nivel", e.target.value)}
            />
            <input
              name="plazas"
              value={fila.plazas}
              list="plazas-habituales"
              aria-label={`Plazas de la fila ${indice + 1}`}
              placeholder="Plazas disponibles"
              onChange={(e) => cambiar(fila.clave, "plazas", e.target.value)}
            />
            <button
              type="button"
              className="quitar"
              aria-label={`Quitar la fila ${indice + 1}`}
              onClick={() => quitarFila(fila.clave)}
            >
              ×
            </button>
          </div>
        ))}

        <datalist id="plazas-habituales">
          {PLAZAS_HABITUALES.map((valor) => (
            <option key={valor} value={valor} />
          ))}
        </datalist>
      </div>

      <button type="button" className="btn ghost sm" onClick={anadirFila}>
        Añadir un horario
      </button>

      <div className="campo" style={{ marginTop: 30 }}>
        <label htmlFor="estado">Aviso de estado</label>
        <input
          id="estado"
          name="estado"
          defaultValue={estado}
          placeholder="Empieza el 14 de septiembre"
        />
        <p className="ayuda">
          Se lee junto al botón de solicitar plaza, en Actividades y en el
          formulario. Déjalo vacío si no hace falta avisar de nada.
        </p>
      </div>

      {resultado.error && <p className="form-error">{resultado.error}</p>}
      {resultado.mensaje && <p className="form-ok">{resultado.mensaje}</p>}

      <button className="btn" type="submit" disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
