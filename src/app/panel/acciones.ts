"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { Horario } from "@/data/grupos";
import {
  type Medida,
  type Prenda,
  type Ropa,
  esTipoDePrenda,
  medidas as catalogoDeMedidas,
} from "@/data/ropa";
import {
  exigirPermiso,
  exigirPermisoEnGrupo,
  fichaDeUsuario,
  todosLosGrupos,
} from "@/lib/acceso";
import {
  crearFicha,
  enlazarCuenta,
  guardarActivo,
  guardarDatos,
  guardarGrupo as apuntarGrupo,
  guardarGrupos,
  guardarRol,
  guardarRopaPropia,
} from "@/lib/almacen";
import { type Rol, esRol } from "@/lib/roles";
import { invitar } from "@/lib/sesion";

/**
 * Lo que se puede guardar desde el panel.
 *
 * Las dos funciones vuelven a comprobar el permiso antes de tocar nada. Puede
 * parecer repetido, porque la página ya no enseña el formulario a quien no
 * puede, pero no lo es: estas funciones son una dirección de internet a la que
 * se puede llamar directamente, sin pasar por nuestros botones. Esconder el
 * botón es cortesía; la comprobación de aquí es lo que impide de verdad que un
 * profesor edite el grupo de otra.
 */

/** Lo que la pantalla enseña después de guardar. */
export type EstadoGuardado = { mensaje: string | null; error: string | null };

/**
 * Guardar los horarios y el aviso de estado de un grupo.
 * Lo puede hacer el administrador con cualquier grupo, y cada profesor con
 * los suyos.
 */
export async function guardarGrupo(
  _anterior: EstadoGuardado,
  datos: FormData,
): Promise<EstadoGuardado> {
  const grupoId = String(datos.get("grupo") ?? "");

  try {
    await exigirPermisoEnGrupo("editar:grupo", grupoId);
  } catch {
    return { mensaje: null, error: "No puedes editar este grupo." };
  }

  /* Los tres campos de cada fila llegan como tres listas del mismo largo, en
     el orden en que están en la pantalla: la fila 1 es el primer elemento de
     cada lista, la fila 2 el segundo, y así. */
  const horas = datos.getAll("hora").map(String);
  const niveles = datos.getAll("nivel").map(String);
  const plazas = datos.getAll("plazas").map(String);

  const horarios: Horario[] = [];
  for (let fila = 0; fila < horas.length; fila++) {
    const hora = horas[fila].trim();
    const nivel = (niveles[fila] ?? "").trim();
    const libres = (plazas[fila] ?? "").trim();

    /* Una fila entera vacía es una fila que se ha añadido y no se ha usado:
       se tira sin decir nada. */
    if (!hora && !nivel && !libres) continue;

    if (!hora || !nivel) {
      return {
        mensaje: null,
        error: `A la fila ${fila + 1} le falta la hora o el nivel.`,
      };
    }
    horarios.push({ hora, nivel, plazas: libres });
  }

  if (horarios.length === 0) {
    return {
      mensaje: null,
      error: "Deja al menos un horario: un grupo sin horarios no se ve.",
    };
  }

  apuntarGrupo(grupoId, {
    horarios,
    estado: String(datos.get("estado") ?? "").trim(),
  });

  /* Vuelve a pintar la página con lo recién guardado. */
  refresh();

  return {
    mensaje: "Guardado. Ya se ve en la página de Actividades.",
    error: null,
  };
}

/**
 * Guardar la ropa propia: las medidas de la persona y las prendas que son
 * suyas. Cada uno la suya y solo la suya — no hace falta decir de quién es,
 * porque se saca de la sesión y no del formulario.
 *
 * Lo que le presta el centro no pasa por aquí: eso lo lleva secretaría.
 */
export async function guardarMiRopa(
  _anterior: EstadoGuardado,
  datos: FormData,
): Promise<EstadoGuardado> {
  let usuario;
  try {
    usuario = await exigirPermiso("editar:mi-ropa");
  } catch {
    return { mensaje: null, error: "No puedes editar la ropa." };
  }

  /* Las medidas: se recorre el catálogo, no lo que llegue, para que nadie pueda
     inventarse una medida nueva colándola en el formulario. */
  const medidas: Ropa["medidas"] = {};
  for (const clave of Object.keys(catalogoDeMedidas) as Medida[]) {
    const valor = String(datos.get(`medida-${clave}`) ?? "").trim();
    if (valor) medidas[clave] = valor;
  }

  /* Las prendas propias, igual que los horarios: tres listas en paralelo. */
  const tipos = datos.getAll("tipo").map(String);
  const tallas = datos.getAll("talla").map(String);
  const notas = datos.getAll("nota").map(String);

  /* Tope de sensatez: nadie tiene cuarenta prendas propias, y esto se puede
     llamar desde fuera con una lista tan larga como quiera. */
  if (tipos.length > 40) {
    return { mensaje: null, error: "Demasiadas prendas de una vez." };
  }

  const propias: Prenda[] = [];
  for (let fila = 0; fila < tipos.length; fila++) {
    const tipo = tipos[fila];

    /* Fila añadida y no usada: se tira sin decir nada. */
    if (!tipo) continue;

    if (!esTipoDePrenda(tipo)) {
      return {
        mensaje: null,
        error: `«${tipo}» no es una prenda del catálogo.`,
      };
    }

    const talla = (tallas[fila] ?? "").trim();
    const nota = (notas[fila] ?? "").trim();

    propias.push({
      tipo,
      origen: "propia",
      /* Lo propio se da por bueno: el estado importa en lo que presta el
         centro, que es lo que hay que arreglar o reponer. */
      estado: "bien",
      ...(talla ? { talla } : {}),
      ...(nota ? { nota } : {}),
    });
  }

  guardarRopaPropia(usuario.id, medidas, propias);
  refresh();

  return { mensaje: "Guardado. Gracias: así secretaría sabe qué prestarte.", error: null };
}

/**
 * Cambiar el rol de una cuenta. Solo el administrador.
 */
export async function cambiarRol(datos: FormData): Promise<void> {
  const yo = await exigirPermiso("gestionar:usuarios");

  const usuarioId = String(datos.get("usuario") ?? "");
  const rol = datos.get("rol");

  if (!esRol(rol)) {
    throw new Error(`«${String(rol)}» no es uno de los tres roles.`);
  }

  /* Nadie se quita a sí mismo el papel de administrador: si fuera el único,
     el centro se quedaría sin nadie que pueda repartir permisos, y no habría
     forma de arreglarlo desde la web. */
  if (usuarioId === yo.id) {
    throw new Error("No puedes cambiarte el rol a ti misma.");
  }

  await guardarRol(usuarioId, rol);
  refresh();
}

/* ---------- Gestión de personas (solo el administrador) ---------- */

/** Lo justo para que no se cuele algo que no es un correo. */
const PARECE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Los grupos marcados en el formulario, comprobando que existen. Se recorre
 * la lista de grupos y no lo que llegue, para que nadie pueda matricular a
 * alguien en un grupo inventado.
 */
async function gruposMarcados(datos: FormData): Promise<string[]> {
  const marcados = new Set(datos.getAll("grupos").map(String));
  return (await todosLosGrupos())
    .map((grupo) => grupo.id)
    .filter((id) => marcados.has(id));
}

/** Guardar las matrículas según el rol. Un administrador no lleva grupos. */
async function matricular(id: string, rol: Rol, grupos: string[]) {
  if (rol !== "admin") await guardarGrupos(id, rol, grupos);
}

/**
 * Lo que devuelve el alta si algo falla: el error, y lo que se había escrito,
 * para volver a rellenar el formulario. Al terminar, React lo deja en blanco,
 * y con un correo repetido se perdería todo lo demás.
 */
export type EstadoAlta = {
  error: string | null;
  valores: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    grupos: string[];
  } | null;
};

/**
 * Dar de alta a una persona: crear su ficha, matricularla y mandarle el
 * correo para que elija su contraseña. Al terminar, lleva a su ficha.
 */
export async function darDeAlta(
  _anterior: EstadoAlta,
  datos: FormData,
): Promise<EstadoAlta> {
  const valores = {
    nombre: String(datos.get("nombre") ?? "").trim(),
    apellidos: String(datos.get("apellidos") ?? "").trim(),
    email: String(datos.get("email") ?? "").trim(),
    telefono: String(datos.get("telefono") ?? "").trim(),
    grupos: await gruposMarcados(datos),
  };
  const fallo = (error: string): EstadoAlta => ({ error, valores });

  try {
    await exigirPermiso("gestionar:usuarios");
  } catch {
    return fallo("No puedes dar de alta a nadie.");
  }

  const { nombre, apellidos, email, telefono } = valores;
  const rol = datos.get("rol");

  if (!nombre) return fallo("Falta el nombre.");
  if (!PARECE_CORREO.test(email)) return fallo("Ese correo no parece un correo.");
  if (!esRol(rol)) return fallo("Elige un rol.");

  const ficha = await crearFicha({ nombre, apellidos, email, telefono, rol });
  if ("error" in ficha) return fallo(ficha.error);

  await matricular(ficha.id, rol, valores.grupos);

  /* Si la invitación falla, la ficha se queda creada igualmente: desde ella
     se puede volver a mandar cuando se arregle lo que sea. */
  const invitacion = await invitar(email);
  if ("authId" in invitacion && invitacion.authId) {
    await enlazarCuenta(ficha.id, invitacion.authId);
  }

  redirect(`/panel/usuarios/${ficha.id}`);
}

/** Guardar los datos de contacto y los grupos desde la ficha. */
export async function guardarFicha(
  _anterior: EstadoGuardado,
  datos: FormData,
): Promise<EstadoGuardado> {
  try {
    await exigirPermiso("gestionar:usuarios");
  } catch {
    return { mensaje: null, error: "No puedes editar esta ficha." };
  }

  const ficha = await fichaDeUsuario(String(datos.get("usuario") ?? ""));
  if (!ficha) return { mensaje: null, error: "Esa persona no existe." };

  const nombre = String(datos.get("nombre") ?? "").trim();
  if (!nombre) return { mensaje: null, error: "Falta el nombre." };

  await guardarDatos(ficha.id, {
    nombre,
    apellidos: String(datos.get("apellidos") ?? "").trim(),
    telefono: String(datos.get("telefono") ?? "").trim(),
  });
  await matricular(ficha.id, ficha.rol, await gruposMarcados(datos));

  refresh();
  return { mensaje: "Guardado.", error: null };
}

/** Volver a mandar el correo de invitación a quien no ha llegado a entrar. */
export async function reenviarInvitacion(
  _anterior: EstadoGuardado,
  datos: FormData,
): Promise<EstadoGuardado> {
  try {
    await exigirPermiso("gestionar:usuarios");
  } catch {
    return { mensaje: null, error: "No puedes mandar invitaciones." };
  }

  const ficha = await fichaDeUsuario(String(datos.get("usuario") ?? ""));
  if (!ficha?.email) {
    return { mensaje: null, error: "Esta persona no tiene correo." };
  }

  const invitacion = await invitar(ficha.email);
  if ("error" in invitacion) return { mensaje: null, error: invitacion.error };

  if (invitacion.authId && invitacion.authId !== ficha.authId) {
    await enlazarCuenta(ficha.id, invitacion.authId);
  }

  refresh();
  return { mensaje: `Correo enviado a ${ficha.email}.`, error: null };
}

/**
 * Dar de baja, o volver a dar de alta. No se borra nada: quien está de baja
 * deja de poder entrar y de salir en las listas, pero su ficha y su historial
 * se quedan por si vuelve.
 */
export async function cambiarAlta(datos: FormData): Promise<void> {
  const yo = await exigirPermiso("gestionar:usuarios");

  const usuarioId = String(datos.get("usuario") ?? "");
  const activo = datos.get("activo") === "si";

  /* Por lo mismo que con el rol: la administradora no se echa a sí misma. */
  if (usuarioId === yo.id) {
    throw new Error("No puedes darte de baja a ti misma.");
  }

  await guardarActivo(usuarioId, activo);
  refresh();
}
