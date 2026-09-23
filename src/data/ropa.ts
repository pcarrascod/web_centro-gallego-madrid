/**
 * El traje: qué tiene cada persona y de dónde ha salido.
 *
 * La distinción que manda en todo este archivo es el **origen** de cada
 * prenda:
 *
 *   propia   — es de la persona. La declara ella, porque es la única que lo
 *              sabe, y al centro le interesa tenerlo apuntado para saber a
 *              quién hay que prestarle qué.
 *   prestada — es del centro y está en su poder temporalmente. La apunta
 *              secretaría, con su estado, y la persona solo la consulta.
 *
 * Las medidas van aparte de las prendas: sirven para preparar un traje que
 * todavía no existe, así que no cuelgan de ninguna prenda concreta.
 */

/**
 * Las prendas del traje, para no escribirlas a mano cada vez y que no acaben
 * cinco formas distintas de escribir «mantelo» en la base de datos.
 *
 * Es una lista larga a propósito: el traje cambia mucho entre grupos y entre
 * comarcas, y cada persona coge de aquí lo que use. Para añadir una prenda,
 * pon una línea más.
 */
export const tiposDePrenda = {
  camisa: "Camisa",
  chaleco: "Chaleco",
  xustillo: "Xustillo",
  dengue: "Dengue",
  mantelo: "Mantelo",
  saia: "Saia",
  refaixo: "Refaixo",
  mandil: "Mandil",
  faixa: "Faixa",
  calzon: "Calzón",
  medias: "Medias",
  zocas: "Zocas",
  zapatillas: "Zapatillas",
  pano: "Pano de cabeza",
  monteira: "Monteira",
  manton: "Mantón",
} as const;

export type TipoPrenda = keyof typeof tiposDePrenda;

/** De dónde ha salido la prenda. Es la distinción principal. */
export type Origen = "propia" | "prestada";

/**
 * Cómo está la prenda. Solo se usa de verdad en las prestadas, que son las
 * que el centro tiene que reponer o arreglar.
 */
export const estados = {
  bien: "Bien",
  arreglar: "Hay que arreglarla",
  cambiar: "Hay que cambiarla",
} as const;

export type Estado = keyof typeof estados;

export type Prenda = {
  tipo: TipoPrenda;
  origen: Origen;
  /** La talla de esta prenda concreta, tal cual esté puesta: "M", "38". */
  talla?: string;
  estado: Estado;
  /** Cualquier cosa que haga falta decir: «descosida por el bajo». */
  nota?: string;
};

/**
 * Las medidas de la persona. Están cerradas a estas cuatro para que el
 * formulario sea siempre el mismo y los datos se puedan comparar entre socios.
 */
export const medidas = {
  camisa: { etiqueta: "Camisa", ayuda: "S, M, L, XL…" },
  cintura: { etiqueta: "Cintura", ayuda: "en centímetros" },
  altoSaia: { etiqueta: "Alto de saia", ayuda: "de la cintura al tobillo, en cm" },
  pie: { etiqueta: "Pie", ayuda: "número de calzado" },
} as const;

export type Medida = keyof typeof medidas;

export type Ropa = {
  usuarioId: string;
  /** Puede estar a medias: se rellena lo que se sepa. */
  medidas: Partial<Record<Medida, string>>;
  prendas: Prenda[];
};

/**
 * La ropa de cada uno, de partida.
 *
 * ⚠️ Como el resto de `src/data/`, esto son datos de prueba. Lo que se edite
 * desde el panel se guarda en la memoria del servidor y se pierde al
 * reiniciarlo; estos valores son a los que se vuelve.
 *
 * No hace falta que aparezca todo el mundo: quien no esté aquí, empieza con la
 * ficha vacía, que es lo que le pasará a cualquier socio nuevo.
 *
 * Desde que las personas están en Supabase, sus ids son uuid y estos de
 * ejemplo («marta-vilar») ya no corresponden a nadie: todo el mundo empieza
 * con la ficha vacía. Se dejan como muestra del formato hasta que la ropa se
 * pase también a la base de datos.
 */
export const ropa: Ropa[] = [
  {
    usuarioId: "marta-vilar",
    medidas: { camisa: "M", cintura: "72", altoSaia: "98", pie: "38" },
    prendas: [
      { tipo: "camisa", origen: "propia", talla: "M", estado: "bien" },
      { tipo: "saia", origen: "propia", talla: "40", estado: "bien" },
      { tipo: "dengue", origen: "prestada", estado: "bien" },
      {
        tipo: "mantelo",
        origen: "prestada",
        estado: "arreglar",
        nota: "Descosido por el bajo. Avisado en abril.",
      },
      { tipo: "zocas", origen: "prestada", talla: "38", estado: "bien" },
      { tipo: "pano", origen: "propia", estado: "bien" },
    ],
  },
  {
    usuarioId: "sabela-mendez",
    medidas: { camisa: "S", pie: "37" },
    prendas: [
      { tipo: "camisa", origen: "propia", talla: "S", estado: "bien" },
      { tipo: "mantelo", origen: "prestada", estado: "bien" },
      { tipo: "zapatillas", origen: "prestada", talla: "37", estado: "cambiar" },
    ],
  },
  {
    usuarioId: "brais-outeiro",
    medidas: { camisa: "L", cintura: "88", pie: "44" },
    prendas: [
      { tipo: "camisa", origen: "propia", talla: "L", estado: "bien" },
      { tipo: "chaleco", origen: "prestada", talla: "L", estado: "bien" },
      { tipo: "faixa", origen: "prestada", estado: "bien" },
      { tipo: "monteira", origen: "prestada", estado: "bien" },
    ],
  },
  {
    usuarioId: "noa-quintela",
    medidas: { camisa: "M" },
    prendas: [{ tipo: "camisa", origen: "propia", talla: "M", estado: "bien" }],
  },
];

/** La ficha vacía, para quien todavía no tenga nada apuntado. */
export function ropaVacia(usuarioId: string): Ropa {
  return { usuarioId, medidas: {}, prendas: [] };
}

/**
 * ¿Es este texto una prenda del catálogo?
 *
 * Lo que llega de un formulario es texto suelto y podría ser cualquier cosa.
 * Esto lo comprueba antes de guardarlo, para que no aparezca una prenda que
 * después nadie sepa cómo se escribe ni cómo se llama.
 */
export function esTipoDePrenda(valor: unknown): valor is TipoPrenda {
  return typeof valor === "string" && Object.hasOwn(tiposDePrenda, valor);
}

/*
 * Para las medidas no hace falta un validador equivalente: al guardarlas se
 * recorre el catálogo y se busca cada una en el formulario, en vez de recorrer
 * lo que llegue. Así una medida inventada no tiene por dónde entrar.
 */

/** Las prendas de un origen concreto, en el orden del catálogo. */
export function prendasPorOrigen(prendas: Prenda[], origen: Origen): Prenda[] {
  const orden = Object.keys(tiposDePrenda) as TipoPrenda[];
  return prendas
    .filter((prenda) => prenda.origen === origen)
    .sort((a, b) => orden.indexOf(a.tipo) - orden.indexOf(b.tipo));
}
