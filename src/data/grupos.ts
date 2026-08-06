/**
 * Los grupos del centro y sus horarios.
 *
 * Este archivo alimenta DOS sitios a la vez:
 *   1. Las tarjetas de la página Actividades.
 *   2. Los ensayos que se repiten cada semana en el Calendario.
 *
 * Así que si un grupo cambia de día, lo cambias aquí una vez y queda
 * corregido en las dos páginas. Para añadir un grupo nuevo, copia un
 * bloque entero y cambia los valores.
 */

/**
 * Las cuatro familias de actividad, con su color en el calendario.
 * `etiqueta` se usa en la leyenda; `corta`, en los botones de filtro.
 */
export const categorias = {
  baile: { etiqueta: "Baile tradicional", corta: "Baile", clase: "c-baile" },
  pand: { etiqueta: "Canto y pandereta", corta: "Pandereta", clase: "c-pand" },
  banda: { etiqueta: "Banda de gaitas", corta: "Banda", clase: "c-banda" },
  coro: { etiqueta: "Coro", corta: "Coro", clase: "c-coro" },
} as const;

export type Categoria = keyof typeof categorias;

export type Horario = {
  /** Franja horaria tal cual se muestra: "18.00 – 19.00" */
  hora: string;
  /** Nivel o subgrupo: "Iniciación", "Infantil (6–12)"... */
  nivel: string;
  /** Plazas o condición: "6 plazas", "Completo", "Con audición" */
  plazas: string;
};

export type Grupo = {
  /** Identificador corto, sin espacios ni acentos. Se usa en la URL y en React. */
  id: string;
  categoria: Categoria;
  nombre: string;
  /** Versión corta, para que quepa en una celda del calendario: "Baile". */
  nombreCorto: string;
  /** Quién puede apuntarse y en qué sala. */
  quien: string;
  /** Día de ensayo, para el título de la tarjeta. */
  dia: string;
  /** 1 = lunes, 2 = martes ... 6 = sábado, 0 = domingo. Lo usa el calendario. */
  diaSemana: number;
  /** Hora con la que aparece el ensayo en el calendario: "10.30" */
  horaEnsayo: string;
  /** Texto del marcador mientras no haya foto real. */
  foto: string;
  horarios: Horario[];
  /** Aviso que se lee junto al botón cuando NO hay solicitud. */
  estado: string;
  /** Aviso que se lee cuando sí la hay. */
  estadoSolicitado: string;
  /** Deja true para mostrar la plaza como ya solicitada. */
  solicitado: boolean;
};

export const grupos: Grupo[] = [
  {
    id: "baile-tradicional",
    categoria: "baile",
    nombre: "Baile tradicional",
    nombreCorto: "Baile",
    quien: "Adultos e infantil · Salón grande",
    dia: "Sábado",
    diaSemana: 6,
    horaEnsayo: "10.30",
    foto: "Foto · Baile tradicional",
    horarios: [
      { hora: "10.30 – 11.30", nivel: "Repertorio", plazas: "Con audición" },
      { hora: "11.30 – 12.30", nivel: "Técnica", plazas: "3 plazas" },
      { hora: "11.30 – 12.30", nivel: "Infantil (6–12)", plazas: "Completo" },
      { hora: "12.30 – 13.00", nivel: "Ensayo con banda", plazas: "Repertorio" },
    ],
    estado: "Empieza el 7 de septiembre",
    estadoSolicitado: "Pendiente de confirmar por secretaría",
    solicitado: true,
  },
  {
    id: "canto-pandereta",
    categoria: "pand",
    nombre: "Canto y pandereta",
    nombreCorto: "Pandereta",
    quien: "Adultos · Sala de música",
    dia: "Lunes",
    diaSemana: 1,
    horaEnsayo: "18.00",
    foto: "Foto · Canto y pandereta",
    horarios: [
      { hora: "18.00 – 19.00", nivel: "Iniciación", plazas: "6 plazas" },
      { hora: "19.00 – 20.00", nivel: "Perfeccionamiento", plazas: "2 plazas" },
      { hora: "20.00 – 21.00", nivel: "Avanzado", plazas: "Con audición" },
    ],
    estado: "Empieza el 7 de septiembre",
    estadoSolicitado: "Pendiente de confirmar por secretaría",
    solicitado: false,
  },
  {
    id: "banda-gaitas",
    categoria: "banda",
    nombre: "Banda de gaitas",
    nombreCorto: "Banda",
    quien: "Gaita, percusión y bombo · Salón grande",
    dia: "Miércoles",
    diaSemana: 3,
    horaEnsayo: "19.00",
    foto: "Foto · Banda de gaitas",
    horarios: [
      { hora: "19.00 – 20.00", nivel: "Gaita, iniciación", plazas: "4 plazas" },
      { hora: "20.00 – 21.30", nivel: "Banda completa", plazas: "Con audición" },
    ],
    estado: "Instrumento propio o cedido por el centro",
    estadoSolicitado: "Pendiente de confirmar por secretaría",
    solicitado: false,
  },
  {
    id: "coro",
    categoria: "coro",
    nombre: "Coro",
    nombreCorto: "Coro",
    quien: "Voces mixtas · Sala de música",
    dia: "Jueves",
    diaSemana: 4,
    horaEnsayo: "19.30",
    foto: "Foto · Coro",
    horarios: [{ hora: "19.30 – 21.00", nivel: "Ensayo general", plazas: "Abierto" }],
    estado: "No hace falta saber solfeo",
    estadoSolicitado: "Pendiente de confirmar por secretaría",
    solicitado: false,
  },
];
