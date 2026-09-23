"use client";

import { useActionState } from "react";
import {
  confirmarEnlace,
  elegirClave,
  pedirEnlace,
} from "@/app/entrar/acciones";

/**
 * Los tres pasos para tener contraseña, tanto la primera vez (invitación)
 * como al olvidarla:
 *
 *   1. `FormularioOlvide`    — pedir el correo con el enlace.
 *   2. `FormularioConfirmar` — el botón de la página a la que lleva el correo.
 *   3. `FormularioClave`     — escribir la contraseña nueva.
 */

export function FormularioOlvide() {
  const [estado, accion, enviando] = useActionState(pedirEnlace, {
    mensaje: null,
    error: null,
  });

  if (estado.mensaje) return <p className="form-ok">{estado.mensaje}</p>;

  return (
    <form className="form" action={accion}>
      <div className="campo">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}

      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Mandarme el enlace"}
      </button>
    </form>
  );
}

export function FormularioConfirmar({
  tokenHash,
  tipo,
}: {
  tokenHash: string;
  tipo: string;
}) {
  const [estado, accion, enviando] = useActionState(confirmarEnlace, {
    error: null,
  });

  return (
    <form className="form" action={accion}>
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="tipo" value={tipo} />

      {estado.error && <p className="form-error">{estado.error}</p>}

      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Comprobando…" : "Continuar"}
      </button>
    </form>
  );
}

export function FormularioClave() {
  const [estado, accion, enviando] = useActionState(elegirClave, {
    error: null,
  });

  return (
    <form className="form" action={accion}>
      <div className="campo">
        <label htmlFor="clave">Contraseña nueva</label>
        <input
          id="clave"
          name="clave"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="ayuda">
          Al menos 8 caracteres. Una frase corta es más fácil de recordar y más
          difícil de adivinar que una palabra con números.
        </p>
      </div>

      <div className="campo">
        <label htmlFor="repetida">Repítela</label>
        <input
          id="repetida"
          name="repetida"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}

      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar y entrar"}
      </button>
    </form>
  );
}
