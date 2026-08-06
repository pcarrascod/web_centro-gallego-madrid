/**
 * Eventos puntuales: actuaciones, romerías, fiestas, puertas abiertas.
 *
 * Los ensayos semanales NO van aquí — esos salen de grupos.ts, porque se
 * repiten solos cada semana. Aquí solo lo que pasa una vez, con su fecha.
 *
 * Para añadir un evento, copia una línea y cambia los datos. Aparecerá
 * automáticamente en el calendario del mes que le toque.
 */

export type Evento = {
  /** Fecha en formato año-mes-día. Siempre con dos dígitos: "2026-09-05" */
  fecha: string;
  titulo: string;
  /** "18.30" o "11.00 – 14.00" */
  hora?: string;
  lugar: string;
  /** Frase suelta que se lee en la tarjeta de portada. */
  descripcion?: string;
  /** true = se pinta en azul en el calendario, en vez de en gris. */
  destacado?: boolean;
  /** Texto corto para la celda del calendario. Si no lo pones, se usa el título. */
  calendario?: string;
  /** true = puede salir en «Lo que viene», en la portada. */
  enPortada?: boolean;
};

export const eventos: Evento[] = [
  {
    fecha: "2026-09-05",
    titulo: "Puertas abiertas",
    hora: "11.00 – 14.00",
    lugar: "Sede de Carretas",
    descripcion: "Prueba una clase de cada grupo. Sin inscripción.",
    calendario: "Puertas abiertas · 11.00",
    destacado: true,
    enPortada: true,
  },
  {
    fecha: "2026-09-20",
    titulo: "Feira Galega",
    hora: "18.30",
    lugar: "Matadero Madrid",
    descripcion: "Actúan baile repertorio y banda.",
    calendario: "Feira Galega · Matadero",
    destacado: true,
    enPortada: true,
  },
  {
    fecha: "2026-09-26",
    titulo: "Ruada en la sede",
    hora: "20.00",
    lugar: "Sede de Carretas",
    calendario: "Ruada en la sede · 20.00",
    destacado: true,
  },
  {
    fecha: "2026-11-08",
    titulo: "Magosto",
    hora: "19.00",
    lugar: "Sede de Carretas",
    descripcion: "Castañas, ruada y queimada. Abierto a socios.",
    destacado: true,
    enPortada: true,
  },
];

/* ------------------------------------------------------------------ */
/* Utilidades de fecha. No hace falta tocar nada de aquí para abajo.  */
/* ------------------------------------------------------------------ */

export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Lunes primero, como en el calendario impreso español. */
export const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Convierte "2026-09-05" en un Date local.
 * Ojo: `new Date("2026-09-05")` lo interpreta en UTC y puede restar un día
 * según la zona horaria, por eso lo montamos a mano.
 */
export function aFecha(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** El inverso: de Date a "2026-09-05". */
export function aISO(f: Date): string {
  const mes = String(f.getMonth() + 1).padStart(2, "0");
  const dia = String(f.getDate()).padStart(2, "0");
  return `${f.getFullYear()}-${mes}-${dia}`;
}

/** Los próximos eventos marcados para portada, en orden. */
export function proximosEventos(desdeISO: string, limite = 3): Evento[] {
  return eventos
    .filter((e) => e.enPortada && e.fecha >= desdeISO)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, limite);
}

/** El mes en el que conviene abrir el calendario: el del próximo evento. */
export function mesDelProximoEvento(desdeISO: string): { anio: number; mes: number } | null {
  const siguiente = eventos
    .filter((e) => e.fecha >= desdeISO)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (!siguiente) return null;
  const f = aFecha(siguiente.fecha);
  return { anio: f.getFullYear(), mes: f.getMonth() };
}
