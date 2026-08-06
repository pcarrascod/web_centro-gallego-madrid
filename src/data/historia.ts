/** La cronología de la página Nosotros. Añade hitos donde toque, en orden. */

export type Hito = {
  anio: string;
  titulo: string;
  texto: string;
};

export const historia: Hito[] = [
  {
    anio: "1892",
    titulo: "Fundación",
    texto: "Un grupo de emigrantes gallegos abre la primera sede en la calle del Príncipe.",
  },
  {
    anio: "1949",
    titulo: "Primer grupo de baile",
    texto: "Nace la sección de folclore, hoy el corazón del centro.",
  },
  {
    anio: "1981",
    titulo: "Sede de Carretas",
    texto: "El centro se traslada a su sede actual, con salón de ensayos propio.",
  },
  {
    anio: "2007",
    titulo: "Banda de gaitas",
    texto: "Se forma la banda, que acompaña al baile en las actuaciones.",
  },
  {
    anio: "2026",
    titulo: "Recuperación de la banda",
    texto: "Se crea el grupo folclórico del Centro Gallego",
  },
];
