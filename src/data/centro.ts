/**
 * Datos generales del centro.
 * Todo lo que aparece en cabecera, pie y cifras sale de aquí:
 * cámbialo en este archivo y se actualiza en todas las páginas a la vez.
 */

import { grupos } from "./grupos";

const FUNDACION = 1892;

/** Se cuentan solos a partir de grupos.ts, para que no se queden desfasados. */
const numeroDeGrupos = String(grupos.length);
const anios = String(new Date().getFullYear() - FUNDACION);

export const centro = {
  nombre: "Centro Gallego",
  nombreCompleto: "Centro Gallego de Madrid",
  subtitulo: "de Madrid · 1892",
  fundacion: FUNDACION,
  temporada: "Temporada 2026 · 2027",

  direccion: {
    calle: "Calle Carretas 14, 3ª planta",
    cp: "28012",
    ciudad: "Madrid",
    comoLlegar: "A dos minutos de Sol.",
  },

  secretaria: {
    horario: "Martes y jueves, 18.00 – 20.30",
    email: "info@centrogallegodemadrid.es",
    telefono: "91 070 42 29",
  },

  /** Las cifras del hero de Inicio. */
  destacados: [
    { valor: numeroDeGrupos, etiqueta: "grupos" },
    { valor: "???", etiqueta: "socios" },
    { valor: anios, etiqueta: "años" },
  ],

  /** La franja de cifras de la página Nosotros. */
  cifras: [
    { valor: "???", etiqueta: "Socios" },
    { valor: numeroDeGrupos, etiqueta: "Grupos" },
    { valor: "??", etiqueta: "Actuaciones al año" },
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
