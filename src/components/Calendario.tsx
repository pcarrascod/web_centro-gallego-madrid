"use client";

import { useMemo, useState } from "react";
import { DIAS_SEMANA, MESES, eventos } from "@/data/eventos";
import { categorias, grupos, type Categoria } from "@/data/grupos";

type Marca = {
  texto: string;
  clase: string;
  destacado: boolean;
  detalle?: string;
};

/**
 * Calendario mensual.
 *
 * A diferencia de la maqueta, aquí no hay ningún mes escrito a mano: la
 * rejilla se calcula, los ensayos se repiten según el `diaSemana` de cada
 * grupo, y los eventos puntuales se leen de eventos.ts. Las flechas
 * funcionan y puedes navegar a cualquier mes.
 */
export function Calendario({
  anioInicial,
  mesInicial,
  hoyISO,
}: {
  anioInicial: number;
  /** 0 = enero, 11 = diciembre */
  mesInicial: number;
  hoyISO: string;
}) {
  const [anio, setAnio] = useState(anioInicial);
  const [mes, setMes] = useState(mesInicial);
  const [activas, setActivas] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.keys(categorias).map((c) => [c, true]))
  );

  function cambiarMes(delta: number) {
    const f = new Date(anio, mes + delta, 1);
    setAnio(f.getFullYear());
    setMes(f.getMonth());
  }

  /** Días del mes, cada uno con sus marcas ya filtradas. */
  const celdas = useMemo(() => {
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    /* getDay() da 0 para domingo; la rejilla empieza en lunes. */
    const hueco = (new Date(anio, mes, 1).getDay() + 6) % 7;

    const dias = Array.from({ length: diasEnMes }, (_, i) => {
      const dia = i + 1;
      const diaSemana = new Date(anio, mes, dia).getDay();
      const iso = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

      const marcas: Marca[] = [];

      /* Primero los eventos puntuales: son lo importante del día. */
      for (const ev of eventos.filter((e) => e.fecha === iso)) {
        marcas.push({
          texto: ev.calendario ?? ev.titulo,
          clase: "c-evento",
          destacado: Boolean(ev.destacado),
          detalle: [ev.hora, ev.lugar].filter(Boolean).join(" · "),
        });
      }

      /* Después los ensayos semanales, si su filtro está activo. */
      for (const g of grupos) {
        if (g.diaSemana !== diaSemana) continue;
        if (!activas[g.categoria]) continue;
        marcas.push({
          texto: `${g.nombreCorto} ${g.horaEnsayo}`,
          clase: categorias[g.categoria].clase,
          destacado: false,
          detalle: g.quien,
        });
      }

      return { dia, iso, marcas };
    });

    const sobran = (7 - ((hueco + diasEnMes) % 7)) % 7;
    return { hueco, dias, sobran };
  }, [anio, mes, activas]);

  return (
    <>
      <div className="cal-bar">
        <button className="arrow" aria-label="Mes anterior" onClick={() => cambiarMes(-1)}>
          ‹
        </button>
        <button className="arrow" aria-label="Mes siguiente" onClick={() => cambiarMes(1)}>
          ›
        </button>
        <div className="month">
          {MESES[mes]} {anio}
        </div>
        <div className="filters">
          {(Object.keys(categorias) as Categoria[]).map((c) => (
            <button
              key={c}
              className="chip"
              aria-pressed={activas[c]}
              onClick={() => setActivas((v) => ({ ...v, [c]: !v[c] }))}
            >
              <i className={`dot ${categorias[c].clase}`} />
              {categorias[c].corta}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-cal">
        {DIAS_SEMANA.map((d) => (
          <div className="dow" key={d}>
            {d}
          </div>
        ))}

        {Array.from({ length: celdas.hueco }, (_, i) => (
          <div className="cell empty" key={`antes-${i}`} />
        ))}

        {celdas.dias.map((celda) => (
          <div
            className={`cell ${celda.iso === hoyISO ? "today" : ""}`.trim()}
            key={celda.iso}
          >
            <span className="n">{celda.dia}</span>
            {celda.marcas.map((m, i) => (
              <div
                className={`ev ${m.destacado ? "big" : ""}`.trim()}
                key={`${celda.iso}-${i}`}
                title={m.detalle}
              >
                <i className={`dot ${m.clase}`} />
                <span>{m.texto}</span>
              </div>
            ))}
          </div>
        ))}

        {Array.from({ length: celdas.sobran }, (_, i) => (
          <div className="cell empty" key={`despues-${i}`} />
        ))}
      </div>

      <div className="legend">
        {(Object.keys(categorias) as Categoria[]).map((c) => (
          <span key={c}>
            <i className={`dot ${categorias[c].clase}`} />
            {categorias[c].etiqueta}
          </span>
        ))}
        <span>
          <i className="dot c-evento" />
          Actuación o evento
        </span>
      </div>
    </>
  );
}
