"use client";

import { useActionState, useRef, useState } from "react";
import { guardarMiRopa } from "@/app/panel/acciones";
import {
  type Prenda,
  type Ropa,
  type TipoPrenda,
  estados,
  medidas as catalogoDeMedidas,
  prendasPorOrigen,
  tiposDePrenda,
} from "@/data/ropa";

/**
 * «Mi ropa», la sección del panel de un alumno.
 *
 * Tiene dos mitades bien distintas, y la diferencia es de quién es la prenda:
 *
 *   · Lo que presta el centro se lee y no se toca. Lo lleva secretaría, que es
 *     quien sabe qué hay en el armario y qué está descosido.
 *   · Lo propio y las tallas los escribe la persona, porque es la única que lo
 *     sabe, y al centro le sirve para saber qué le tiene que prestar.
 */

/** Una fila del formulario. La `clave` es solo para React, no se manda. */
type Fila = { tipo: string; talla: string; nota: string; clave: number };

export function MiRopa({ ropa }: { ropa: Ropa }) {
  const [resultado, accion, guardando] = useActionState(guardarMiRopa, {
    mensaje: null,
    error: null,
  });

  const prestadas = prendasPorOrigen(ropa.prendas, "prestada");
  const propiasIniciales = prendasPorOrigen(ropa.prendas, "propia");

  const [filas, setFilas] = useState<Fila[]>(() =>
    propiasIniciales.map((prenda, indice) => ({
      tipo: prenda.tipo,
      talla: prenda.talla ?? "",
      nota: prenda.nota ?? "",
      clave: indice,
    })),
  );
  const proximaClave = useRef(propiasIniciales.length);

  function cambiar(clave: number, campo: keyof Omit<Fila, "clave">, valor: string) {
    setFilas((actuales) =>
      actuales.map((fila) =>
        fila.clave === clave ? { ...fila, [campo]: valor } : fila,
      ),
    );
  }

  function anadirFila() {
    setFilas((actuales) => [
      ...actuales,
      { tipo: "", talla: "", nota: "", clave: proximaClave.current++ },
    ]);
  }

  function quitarFila(clave: number) {
    setFilas((actuales) => actuales.filter((fila) => fila.clave !== clave));
  }

  return (
    <>
      {/* ---------- Lo que presta el centro: solo lectura ---------- */}
      <h3 className="panel-h3">Prestado por el centro</h3>

      {prestadas.length === 0 ? (
        <p className="small">
          Ahora mismo no tienes nada del centro. Cuando te presten algo para una
          actuación, aparecerá aquí.
        </p>
      ) : (
        <ul className="prendas">
          {prestadas.map((prenda, indice) => (
            <PrendaPrestada prenda={prenda} key={`${prenda.tipo}-${indice}`} />
          ))}
        </ul>
      )}

      <p className="small" style={{ marginTop: 14 }}>
        Esto lo lleva secretaría: si algo está roto, ha cambiado de talla o ya lo
        has devuelto, avísales y lo corrigen.
      </p>

      {/* ---------- Lo tuyo: esto sí lo escribes tú ---------- */}
      <form action={accion} style={{ marginTop: 44 }}>
        <h3 className="panel-h3">Tus tallas</h3>
        <p className="small" style={{ margin: "0 0 20px" }}>
          Rellena lo que sepas y deja en blanco lo que no. Con esto el centro
          puede prepararte el traje sin tener que medirte otra vez.
        </p>

        <div className="medidas">
          {(Object.keys(catalogoDeMedidas) as (keyof typeof catalogoDeMedidas)[]).map(
            (clave) => (
              <div className="campo" key={clave}>
                <label htmlFor={`medida-${clave}`}>
                  {catalogoDeMedidas[clave].etiqueta}
                </label>
                <input
                  id={`medida-${clave}`}
                  name={`medida-${clave}`}
                  defaultValue={ropa.medidas[clave] ?? ""}
                  placeholder={catalogoDeMedidas[clave].ayuda}
                />
              </div>
            ),
          )}
        </div>

        <h3 className="panel-h3" style={{ marginTop: 40 }}>
          Prendas que son tuyas
        </h3>
        <p className="small" style={{ margin: "0 0 20px" }}>
          Lo que ya tengas por tu cuenta. Apuntarlo evita que el centro te preste
          algo que no necesitas.
        </p>

        {filas.length > 0 && (
          <div className="filas">
            <div className="filas-cab" aria-hidden="true">
              <span>Prenda</span>
              <span>Talla</span>
              <span>Nota</span>
              <span />
            </div>

            {filas.map((fila, indice) => (
              <div className="fila" key={fila.clave}>
                <select
                  name="tipo"
                  value={fila.tipo}
                  aria-label={`Prenda de la fila ${indice + 1}`}
                  onChange={(e) => cambiar(fila.clave, "tipo", e.target.value)}
                >
                  <option value="">Elige una prenda</option>
                  {(Object.keys(tiposDePrenda) as TipoPrenda[]).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tiposDePrenda[tipo]}
                    </option>
                  ))}
                </select>
                <input
                  name="talla"
                  value={fila.talla}
                  aria-label={`Talla de la fila ${indice + 1}`}
                  placeholder="M, 38…"
                  onChange={(e) => cambiar(fila.clave, "talla", e.target.value)}
                />
                <input
                  name="nota"
                  value={fila.nota}
                  aria-label={`Nota de la fila ${indice + 1}`}
                  placeholder="Opcional"
                  onChange={(e) => cambiar(fila.clave, "nota", e.target.value)}
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
          </div>
        )}

        <button
          type="button"
          className="btn ghost sm"
          onClick={anadirFila}
          style={{ marginTop: filas.length > 0 ? 10 : 0 }}
        >
          Añadir una prenda mía
        </button>

        {resultado.error && (
          <p className="form-error" style={{ marginTop: 26 }}>
            {resultado.error}
          </p>
        )}
        {resultado.mensaje && (
          <p className="form-ok" style={{ marginTop: 26 }}>
            {resultado.mensaje}
          </p>
        )}

        <p style={{ marginTop: 26 }}>
          <button className="btn" type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar mi ropa"}
          </button>
        </p>
      </form>
    </>
  );
}

/** Una prenda del centro: qué es, qué talla y si hay algo que arreglar. */
function PrendaPrestada({ prenda }: { prenda: Prenda }) {
  return (
    <li>
      <span className="prenda-nombre">{tiposDePrenda[prenda.tipo]}</span>
      {prenda.talla && <span className="prenda-talla">talla {prenda.talla}</span>}
      <span
        className={`prenda-estado ${prenda.estado === "bien" ? "" : "avisa"}`.trim()}
      >
        {estados[prenda.estado]}
      </span>
      {prenda.nota && <span className="prenda-nota">{prenda.nota}</span>}
    </li>
  );
}
