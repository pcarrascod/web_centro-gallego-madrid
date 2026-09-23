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
  /**
   * Los grupos a los que va dirigido, por su `id` en `grupos.ts`.
   *
   * **Si no lo pones, el evento es de todo el centro** y le sale a todo el
   * mundo: romerías, magostos, reuniones generales. Ponlo solo cuando el evento
   * sea de unos grupos concretos, como el inicio de temporada de cada clase, y
   * así en su panel cada socio ve lo suyo y no lo de los demás.
   *
   * Ojo: esto solo afecta al panel de cada socio. El calendario público sigue
   * enseñando todo a todo el mundo, que para eso es público.
   */
  grupos?: string[];
};

export const eventos: Evento[] = [
  {
    fecha: "2026-09-07",
    titulo: "Reunión informativa de grupos",
    hora: "19.30 – 21.00",
    lugar: "Sede de Carretas",
    descripcion: "Información relevante de cara a la temporada 2026-2027",
    calendario: "Reunión informativa · 19.30",
    destacado: true,
    enPortada: true,
  },
  {
    fecha: "2026-09-14",
    titulo: "Inicio pandereta y percusión 2026-2027",
    hora: "18.30",
    lugar: "Sede de Carretas",
    descripcion: "Clases de pandereta (todos los niveles) y percusión (iniciación)",
    calendario: "Inicio de la temporada · 18.30",
    destacado: true,
    enPortada: true,
    grupos: ["canto-pandereta", "percusion"],
  },
  {
    fecha: "2026-09-17",
    titulo: "Inicio coro 2026-2027",
    hora: "19.00",
    lugar: "Sede de Carretas",
    descripcion: "Clases de coro",
    calendario: "Inicio de la temporada · 19.00",
    destacado: true,
    enPortada: true,
    grupos: ["coro"],
  },
  {
    fecha: "2026-09-19",
    titulo: "Inicio banda, baile y gaita 2026-2027",
    hora: "10.00",
    lugar: "Sede de Carretas",
    calendario: "Inicio de la temporada · 10.00",
    destacado: true,
    grupos: ["banda-gaitas", "baile-tradicional"],
  },
  {
    fecha: "2026-11-08",
    titulo: "Magosto",
    hora: "19.00",
    lugar: "Sede de Carretas",
    descripcion: "Castañas, ruada y queimada. Abierto a socios.",
    destacado: true,
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

/** Los mismos, enteros, para escribir la fecha con letra. */
const DIAS_SEMANA_LARGOS = [
  "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo",
];

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

/**
 * Los próximos eventos que le tocan a una persona: los del centro entero, más
 * los de los grupos que le correspondan.
 *
 * A quien va a coro no le interesa el día que empieza la pandereta, y al
 * contrario. Pero el magosto es de todos.
 *
 * `misGrupos` son los grupos de esa persona: los que da si es profesora, los que
 * tiene matriculados si es alumna. A la secretaría se le pasan todos, porque es
 * quien organiza los eventos y le interesa verlos enteros.
 *
 * Estos no se filtran por `enPortada`: la portada es un escaparate y enseña tres
 * bien elegidos, mientras que aquí lo que importa es no perderse nada de lo suyo.
 */
export function eventosParaGrupos(
  misGrupos: readonly string[],
  desdeISO: string,
  limite = 4,
): Evento[] {
  return eventos
    .filter((e) => e.fecha >= desdeISO)
    .filter(
      (e) =>
        esDeTodos(e) || (e.grupos ?? []).some((g) => misGrupos.includes(g)),
    )
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, limite);
}

/**
 * Un evento es de todo el centro si no dice grupos.
 *
 * La lista vacía cuenta igual que no ponerla: si no, un `grupos: []` escrito por
 * descuido dejaría el evento sin que lo viera nadie, y sería un despiste difícil
 * de encontrar.
 */
function esDeTodos(evento: Evento): boolean {
  return !evento.grupos || evento.grupos.length === 0;
}

/**
 * "sábado". Va suelto porque en las tarjetas el día y el mes se pintan aparte,
 * en grande, y lo único que falta es saber si cae en fin de semana.
 */
export function diaDeLaSemana(iso: string): string {
  const f = aFecha(iso);
  /* getDay() da 0 para domingo; nuestras listas empiezan en lunes. */
  return DIAS_SEMANA_LARGOS[(f.getDay() + 6) % 7];
}

/** Cuántos días faltan, para poder decir «mañana» o «en 3 días». */
export function diasHasta(desdeISO: string, hastaISO: string): number {
  const unDia = 24 * 60 * 60 * 1000;
  const desde = aFecha(desdeISO).getTime();
  const hasta = aFecha(hastaISO).getTime();
  return Math.round((hasta - desde) / unDia);
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
