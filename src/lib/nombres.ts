/**
 * Dos apaños de nombres que se usan en varios sitios.
 * No tocan datos ni servidor, así que valen igual en cualquier componente.
 */

/**
 * Las iniciales, para el círculo del avatar: «Uxía Lameiro» → «UL».
 * Con un nombre solo, la inicial sola.
 */
export function iniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "?";

  const primera = palabras[0][0];
  const ultima = palabras.length > 1 ? palabras[palabras.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}

/** Solo el nombre de pila, para saludar: «Uxía Lameiro» → «Uxía». */
export function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}
