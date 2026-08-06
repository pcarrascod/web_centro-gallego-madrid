/**
 * Datos generales del centro.
 * Todo lo que aparece en cabecera, pie y cifras sale de aquí:
 * cámbialo en este archivo y se actualiza en todas las páginas a la vez.
 */

export const centro = {
  nombre: "Centro Gallego",
  nombreCompleto: "Centro Gallego de Madrid",
  subtitulo: "de Madrid · 1892",
  fundacion: 1892,
  temporada: "Temporada 2026 · 2027",

  direccion: {
    calle: "Calle Carretas 14, 2º",
    cp: "28012",
    ciudad: "Madrid",
    comoLlegar: "A dos minutos de Sol.",
  },

  secretaria: {
    horario: "Martes y jueves, 18.00 – 20.30",
    email: "secretaria@centrogallegomadrid.es",
    telefono: "91 000 00 00",
  },

  cuotaMensual: "12 €",

  /** Las cifras del hero de Inicio. */
  destacados: [
    { valor: "7", etiqueta: "grupos" },
    { valor: "340", etiqueta: "socios" },
    { valor: "134", etiqueta: "años" },
  ],

  /** La franja de cifras de la página Nosotros. */
  cifras: [
    { valor: "340", etiqueta: "Socios" },
    { valor: "7", etiqueta: "Grupos" },
    { valor: "18", etiqueta: "Actuaciones al año" },
    { valor: "12 €", etiqueta: "Cuota mensual" },
  ],
} as const;

/** Enlaces de la navegación principal. El orden es el que se ve. */
export const navegacion = [
  { href: "/", texto: "Inicio" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/calendario", texto: "Calendario" },
  { href: "/actividades", texto: "Actividades" },
] as const;

/** Enlaces del menú del avatar (zona de socios, todavía sin funcionalidad). */
export const menuSocio = [
  { href: "#", texto: "Configuración" },
  { href: "#", texto: "Mi ropa" },
  { href: "#", texto: "Clases" },
  { href: "#", texto: "Eventos" },
] as const;
