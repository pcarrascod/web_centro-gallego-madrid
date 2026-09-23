"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { entrar } from "@/app/entrar/acciones";

/** La pantalla de entrar: correo y contraseña. */
export function FormularioEntrar({ volver }: { volver: string }) {
  const [estado, accion, enviando] = useActionState(entrar, { error: null });

  /* El correo va controlado para que no se vacíe si la contraseña estaba mal:
     al terminar un formulario, React lo deja en blanco. */
  const [email, setEmail] = useState("");

  return (
    <form className="form" action={accion}>
      <input type="hidden" name="volver" value={volver} />

      <div className="campo">
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="clave">Contraseña</label>
        <input
          id="clave"
          name="clave"
          type="password"
          required
          autoComplete="current-password"
        />
        <p className="ayuda">
          <Link className="link" href="/entrar/olvide">
            He olvidado la contraseña
          </Link>
        </p>
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}

      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <p className="small" style={{ marginTop: 28 }}>
        Las cuentas las da de alta secretaría. Si eres del centro y no te ha
        llegado la invitación, escríbenos.
      </p>
    </form>
  );
}
