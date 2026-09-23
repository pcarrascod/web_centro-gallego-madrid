import Link from "next/link";
import {
  MESES,
  type Evento,
  aFecha,
  diaDeLaSemana,
  diasHasta,
} from "@/data/eventos";

/**
 * Los próximos eventos del calendario, para que un socio no se pierda una
 * actuación por no haber mirado.
 *
 * Van en tarjetas, una al lado de otra, con la misma pinta que las de la
 * portada: el día en grande, para localizarlo de un vistazo. Cada tarjeta lleva
 * la fecha exacta *y* cuánto falta, que son dos cosas distintas — «7 de
 * septiembre» sirve para apuntarlo, «en 5 días» para saber si corre prisa.
 *
 * Quién ve qué se decide antes de llegar aquí, en `eventosParaGrupos`: este
 * componente solo pinta la lista que le dan.
 */
export function ProximosEventos({
  eventos,
  hoyISO,
}: {
  eventos: Evento[];
  hoyISO: string;
}) {
  if (eventos.length === 0) {
    return (
      <p className="small">
        No hay nada a la vista, ni del centro ni de tus clases. Puede que sí haya
        cosas de otros grupos:{" "}
        <Link className="link" href="/calendario">
          míralo en el calendario
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      <ol className="eventos">
        {eventos.map((evento) => {
          const fecha = aFecha(evento.fecha);

          return (
            <li key={`${evento.fecha}-${evento.titulo}`}>
              <p className="mon">{MESES[fecha.getMonth()]}</p>
              <p className="day">{String(fecha.getDate()).padStart(2, "0")}</p>

              <h3>{evento.titulo}</h3>
              <p className="small">
                {[diaDeLaSemana(evento.fecha), evento.hora, evento.lugar]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {evento.descripcion && (
                <p className="small">{evento.descripcion}</p>
              )}

              <p className="evento-falta">
                {cuantoFalta(diasHasta(hoyISO, evento.fecha))}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="small" style={{ marginTop: 22 }}>
        <Link className="link" href="/calendario">
          Ver el calendario completo
        </Link>
      </p>
    </>
  );
}

/**
 * «hoy», «mañana», «en 34 días»: dice de un tirón si algo corre prisa, cosa que
 * una fecha sola no dice.
 *
 * Cuenta en días hasta los tres meses en vez de redondear a meses antes. Con
 * meses, tres ensayos del 14, el 17 y el 19 de septiembre ponían los tres «en un
 * mes»: se perdía el orden y parecía un error. Y como la fecha exacta está justo
 * encima, en grande, aquí lo útil es la precisión.
 */
function cuantoFalta(dias: number): string {
  if (dias <= 0) return "hoy";
  if (dias === 1) return "mañana";
  if (dias < 90) return `en ${dias} días`;

  const meses = Math.round(dias / 30);
  return `en ${meses} meses`;
}
