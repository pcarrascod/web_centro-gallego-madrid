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
 * Las familias de actividad, con su color en el calendario.
 * `etiqueta` se usa en la leyenda; `corta`, en los botones de filtro.
 *
 * Para añadir una categoría nueva: pon aquí la línea con su `clase`, y
 * define el color de esa clase en globals.css, junto a las demás `.c-*`.
 * El botón de filtro y la entrada de la leyenda aparecen solos.
 */
export const categorias = {
  baile: { etiqueta: "Baile tradicional", corta: "Baile", clase: "c-baile" },
  pand: { etiqueta: "Canto y pandereta", corta: "Pandereta", clase: "c-pand" },
  banda: { etiqueta: "Banda de gaitas", corta: "Banda", clase: "c-banda" },
  coro: { etiqueta: "Coro", corta: "Coro", clase: "c-coro" },
  perc: { etiqueta: "Percusión", corta: "Percusión", clase: "c-perc" },
  taberna: { etiqueta: "Cantos de taberna", corta: "Taberna", clase: "c-taberna" },
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
  /**
   * 1 = lunes, 2 = martes ... 6 = sábado, 0 = domingo. Lo usa el calendario.
   * Si el grupo ensaya varios días, ponlos en una lista: `[1, 6]`.
   */
  diaSemana: number | number[];
  /**
   * Hora con la que aparece el ensayo en el calendario: "10.30".
   * Si el grupo ensaya a horas distintas según el día, pon una por día,
   * con el mismo número de día que en `diaSemana`:
   *
   *     diaSemana: [1, 6],
   *     horaEnsayo: { 1: "19.30", 6: "11.30" },
   */
  horaEnsayo: string | Record<number, string>;
  /** Texto del marcador mientras no haya foto real. */
  foto: string;
  horarios: Horario[];
  /**
   * Aviso que se lee junto al botón de solicitar, en la tarjeta y en el
   * formulario: "Empieza el 14 de septiembre", "Instrumento propio"...
   */
  estado: string;
};

export const grupos: Grupo[] = [
  {
    id: "baile-tradicional",
    categoria: "baile",
    nombre: "Baile tradicional",
    nombreCorto: "Baile",
    quien: "Adultos · Salón grande",
    dia: "Sábado",
    diaSemana: 6,
    horaEnsayo: "10.30",
    foto: "Foto · Baile tradicional",
    horarios: [
      { hora: "10.30 – 11.30", nivel: "Repertorio", plazas: "Con audición" },
      { hora: "11.30 – 12.30", nivel: "Técnica", plazas: "Plazas disponibles" },
      { hora: "12.30 – 13.00", nivel: "Ensayo con banda", plazas: "Repertorio" },
    ],
    estado: "Empieza el 19 de septiembre",
  },
  {
    id: "canto-pandereta",
    categoria: "pand",
    nombre: "Panderereteiras",
    nombreCorto: "Pandereta",
    quien: "Adultos · Salón o Sala Airiños",
    dia: "Lunes",
    diaSemana: 1,
    horaEnsayo: "18.00",
    foto: "Foto · Canto y pandereta",
    horarios: [
      { hora: "18.30 – 19.30", nivel: "Iniciación", plazas: "Plazas disponibles" },
      { hora: "19.30 – 20.30", nivel: "Intermedio", plazas: "Plazas disponibles" },
      { hora: "20.30 – 21.00", nivel: "Oficial", plazas: "Con audición" },
    ],
    estado: "Empieza el 14 de septiembre",
  },
  {
    id: "banda-gaitas",
    categoria: "banda",
    nombre: "Banda de gaitas",
    nombreCorto: "Banda",
    quien: "Gaita, percusión y bombo · Salón grande o Biblioteca",
    dia: "Sábado",
    diaSemana: 6,
    horaEnsayo: "10.30",
    foto: "Foto · Banda de gaitas",
    horarios: [
      { hora: "10.30 – 12.00", nivel: "Ensayo con flautas", plazas: "Plazas disponibles" },
      { hora: "12.30 – 13.00", nivel: "Banda completa con baile", plazas: "Con audición" },
      { hora: "13.00 – 14.00", nivel: "Banda completa", plazas: "Con audición" },
      { hora: "14.00 – 14.30", nivel: "Banda completa con Cantos de taberna", plazas: "Plazas disponibles" },
    ],
    estado: "Instrumento propio",
  },
  {
    id: "coro",
    categoria: "coro",
    nombre: "Coro",
    nombreCorto: "Coro",
    quien: "Voces mixtas · Sala de música",
    dia: "Jueves",
    diaSemana: 4,
    horaEnsayo: "19.00",
    foto: "Foto · Coro",
    horarios: [{ hora: "19.00 – 21.00", nivel: "Ensayo general", plazas: "Plazas disponibles" }],
    estado: "No hace falta saber solfeo",
  },
  {
    id: "percusion",
    categoria: "perc",
    nombre: "Percusión",
    nombreCorto: "Percusión",
    quien: "Percusión · Sala Airiños",
    dia: "Lunes, Sábado",
    diaSemana: [1, 6],
    horaEnsayo: { 1: "19.30", 6: "11.30" },
    foto: "Foto · Percusión",
    horarios: [
      { hora: "19.30 – 20.30", nivel: "[Lunes] Percusión iniciación", plazas: "Plazas disponibles" },
      { hora: "11.30 – 12.30", nivel: "[Sábado] Percusión intermedio", plazas: "Plazas disponibles" }
    ],
    estado: "No hace falta saber percusión",
  },
  {
    id: "cantosTaberna",
    categoria: "taberna",
    nombre: "Cantos de taberna",
    nombreCorto: "Taberna",
    quien: "Todos · Sala Airiños",
    dia: "Sábado",
    diaSemana: 6,
    horaEnsayo: "13.30",
    foto: "Foto · Cantos de taberna",
    horarios: [
      { hora: "13.30 – 14.30", nivel: "Cantos de taberna", plazas: "Plazas disponibles" }
    ],
    estado: "No hace falta saber cantar",
  },
];
