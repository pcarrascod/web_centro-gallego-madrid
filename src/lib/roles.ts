/**
 * Los tres tipos de usuario del centro y qué puede hacer cada uno.
 *
 * Este archivo es la única respuesta a la pregunta «¿puede este usuario hacer
 * esto?». No hay permisos escritos a mano por ahí suelto: las páginas y los
 * formularios preguntan aquí. Si mañana quieres que los profesores también
 * puedan pasar asistencia, se añade la acción en `permisos` y ya.
 *
 * No importa nada del servidor ni de la base de datos, así que se puede usar
 * igual en una página, en un formulario del navegador o en el futuro Supabase.
 */

/** Los tres roles. No hay más: un usuario es exactamente uno de estos. */
export type Rol = "admin" | "profesor" | "alumno";

/** Cómo se llama cada rol cuando se lo enseñamos a una persona. */
export const roles: Record<Rol, { etiqueta: string; resumen: string }> = {
  admin: {
    etiqueta: "Administrador",
    resumen:
      "Secretaría y junta. Ve y edita todos los grupos, y decide quién es quién.",
  },
  profesor: {
    etiqueta: "Profesor",
    resumen:
      "Lleva uno o varios grupos. Ve a los alumnos de esos grupos y edita sus horarios.",
  },
  alumno: {
    etiqueta: "Alumno",
    resumen: "Socio apuntado a un grupo. Ve sus grupos y su propia ficha.",
  },
};

/**
 * Todo lo que se puede hacer en la zona privada.
 *
 * Para añadir una capacidad nueva: pon aquí el nombre, dale sus dos textos en
 * `acciones` y reparte quién la tiene en `permisos`.
 */
export type Accion =
  | "ver:panel"
  | "ver:alumnos"
  | "editar:grupo"
  | "editar:mi-ropa"
  | "gestionar:usuarios";

/**
 * Cómo se llama cada acción cuando se la enseñamos a una persona:
 * `corta` para la cabecera de una columna, `larga` para explicarla.
 */
export const acciones: Record<Accion, { corta: string; larga: string }> = {
  "ver:panel": {
    corta: "Zona privada",
    larga: "Entrar en la zona privada y ver su propia ficha",
  },
  "ver:alumnos": {
    corta: "Ver alumnos",
    larga: "Ver la lista de alumnos, con su teléfono y su correo",
  },
  "editar:grupo": {
    corta: "Editar grupos",
    larga: "Cambiar horarios, niveles, plazas y el aviso de estado",
  },
  "editar:mi-ropa": {
    corta: "Su ropa",
    larga: "Ver su traje y apuntar sus tallas y las prendas que son suyas",
  },
  "gestionar:usuarios": {
    corta: "Gestionar cuentas",
    larga: "Ver todas las cuentas y cambiar el rol de cada una",
  },
};

/** Todas las acciones, en orden, para pintar la cuadrícula de permisos. */
export const todasLasAcciones = Object.keys(acciones) as Accion[];

/** Los tres roles, en orden de mayor a menor alcance. */
export const todosLosRoles = Object.keys(roles) as Rol[];

/**
 * Hasta dónde llega un permiso:
 *
 *   "todos"   — sobre cualquier grupo del centro.
 *   "propios" — solo sobre los grupos del usuario.
 *
 * Esta distinción es la que hace que un profesor vea a *sus* alumnos y no a
 * los de la compañera de al lado, sin necesidad de inventar dos roles.
 */
export type Ambito = "todos" | "propios";

/**
 * La tabla de permisos. Se lee como una cuadrícula:
 * si el rol no aparece con esa acción, no puede hacerla.
 *
 *                    ver:panel  ver:alumnos  editar:grupo  editar:mi-ropa  gestionar:usuarios
 *   Administrador      todos       todos        todos            —               todos
 *   Profesor           todos      propios      propios           —                 —
 *   Alumno             todos         —            —            todos               —
 *
 * `editar:mi-ropa` solo lo tiene el alumno porque es por donde empezamos. Los
 * profesores también visten el traje: el día que haga falta, se les da añadiendo
 * una línea aquí abajo, y les aparece la sección sin tocar nada más.
 */
export const permisos: Record<Rol, Partial<Record<Accion, Ambito>>> = {
  admin: {
    "ver:panel": "todos",
    "ver:alumnos": "todos",
    "editar:grupo": "todos",
    "gestionar:usuarios": "todos",
  },
  profesor: {
    "ver:panel": "todos",
    "ver:alumnos": "propios",
    "editar:grupo": "propios",
  },
  alumno: {
    "ver:panel": "todos",
    /* Su propia ropa: sus tallas y las prendas que son suyas. Lo que le presta
       el centro lo ve, pero no lo toca — eso lo lleva secretaría. */
    "editar:mi-ropa": "todos",
  },
};

/**
 * Lo mínimo que hace falta saber de alguien para decidir si puede.
 * Cualquier objeto con rol y lista de grupos encaja: el usuario de la sesión,
 * una fila de la base de datos o un usuario inventado en un test.
 */
export type Permisos = {
  rol: Rol;
  /** Profesor: los grupos que imparte. Alumno: los grupos en los que está. */
  grupos: readonly string[];
};

/**
 * ¿Tiene este rol la acción, aunque sea solo sobre sus propios grupos?
 *
 * Sirve para decidir si se enseña un enlace o una sección entera. Para actuar
 * sobre un grupo concreto no basta: usa `puedeEnGrupo`.
 */
export function puede(rol: Rol, accion: Accion): boolean {
  return permisos[rol][accion] !== undefined;
}

/** El alcance que tiene ese rol sobre la acción, o `null` si no la tiene. */
export function ambitoDe(rol: Rol, accion: Accion): Ambito | null {
  return permisos[rol][accion] ?? null;
}

/**
 * ¿Puede este usuario hacer esto **en este grupo**?
 *
 * Es la pregunta de verdad, la que hay que hacer antes de mostrar alumnos o
 * de guardar un cambio. Un profesor la pasa solo con sus grupos; un
 * administrador, con todos.
 */
export function puedeEnGrupo(
  usuario: Permisos,
  accion: Accion,
  grupoId: string,
): boolean {
  const ambito = ambitoDe(usuario.rol, accion);
  if (ambito === null) return false;
  if (ambito === "todos") return true;
  return usuario.grupos.includes(grupoId);
}

/**
 * ¿Es este texto uno de los tres roles?
 *
 * Cuando alguien cambia el rol de una cuenta, lo que llega del formulario es
 * texto suelto, y podría venir cualquier cosa. Esto lo comprueba antes de
 * guardarlo, para que no se cuele un rol inventado que nadie sepa interpretar.
 */
export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && Object.hasOwn(roles, valor);
}
