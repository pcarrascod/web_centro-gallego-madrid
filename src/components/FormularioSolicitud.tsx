"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { centro } from "@/data/centro";
import { grupos } from "@/data/grupos";

type Estado = "listo" | "enviando" | "enviado" | "error";

/**
 * Formulario de solicitud de plaza.
 *
 * Lo recibe Netlify Forms: manda un correo a secretaría y guarda una copia en
 * el panel de Netlify. No guardamos nada nosotros, no hay base de datos.
 *
 * Ojo: los campos tienen que estar declarados también en public/__forms.html,
 * o Netlify los tirará a la basura sin decir nada.
 */
export function FormularioSolicitud() {
  const params = useSearchParams();
  /* Si vienes de una tarjeta de Actividades, el grupo llega en la URL. */
  const grupoInicial = params.get("grupo") ?? "";

  const [grupoId, setGrupoId] = useState(grupoInicial);
  const [estado, setEstado] = useState<Estado>("listo");

  const grupo = grupos.find((g) => g.id === grupoId);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");

    const datos = new FormData(e.currentTarget);
    try {
      const respuesta = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(datos as unknown as Record<string, string>).toString(),
      });
      setEstado(respuesta.ok ? "enviado" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "enviado") {
    return (
      <div className="gracias">
        <p className="eyebrow">Solicitud enviada</p>
        <h2>Recibido. Gracias.</h2>
        <p style={{ marginTop: 16 }}>
          Secretaría lo revisa y te contesta en un plazo de 48 horas, con el sitio, la
          hora y qué ropa necesitas. Si tienes prisa, están en el{" "}
          {centro.secretaria.telefono} los {centro.secretaria.horario.toLowerCase()}.
        </p>
        <p style={{ marginTop: 24 }}>
          <Link className="btn ghost" href="/calendario">
            Ver el calendario
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="form" name="solicitud-plaza" onSubmit={enviar}>
      <input type="hidden" name="form-name" value="solicitud-plaza" />

      {/* Trampa para robots: una persona no lo ve, así que no lo rellena. */}
      <p className="oculto">
        <label>
          No rellenes esto: <input name="bot-field" tabIndex={-1} />
        </label>
      </p>

      <div className="campo">
        <label htmlFor="grupo">Grupo</label>
        <select
          id="grupo"
          name="grupo"
          required
          value={grupoId}
          onChange={(e) => setGrupoId(e.target.value)}
        >
          <option value="">Elige un grupo</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre} · {g.dia}
            </option>
          ))}
        </select>
      </div>

      {grupo && (
        <div className="campo">
          <label htmlFor="horario">Horario que te encaja</label>
          <select id="horario" name="horario" defaultValue="">
            <option value="">Me da igual / no lo sé</option>
            {grupo.horarios.map((h) => (
              <option key={`${h.hora}-${h.nivel}`} value={`${h.nivel} · ${h.hora}`}>
                {h.nivel} · {h.hora}
              </option>
            ))}
          </select>
          <p className="ayuda">{grupo.estado}</p>
        </div>
      )}

      <div className="campo">
        <label htmlFor="nombre">Nombre y apellidos</label>
        <input id="nombre" name="nombre" type="text" required autoComplete="name" />
      </div>

      <div className="campo">
        <label htmlFor="telefono">Teléfono</label>
        <input id="telefono" name="telefono" type="tel" required autoComplete="tel" />
      </div>

      <div className="campo">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="campo">
        <label htmlFor="socio">¿Eres socio del centro?</label>
        <select id="socio" name="socio" defaultValue="No, todavía no">
          <option>No, todavía no</option>
          <option>Sí, ya soy socio</option>
        </select>
      </div>

      <div className="campo">
        <label htmlFor="mensaje">Algo que debamos saber (opcional)</label>
        <textarea
          id="mensaje"
          name="mensaje"
          placeholder="Experiencia previa, si tienes instrumento propio, lesiones, lo que sea."
        />
      </div>

      <label className="consent">
        <input type="checkbox" required />
        <span>
          Autorizo al {centro.nombreCompleto} a usar estos datos para gestionar mi
          solicitud de plaza y ponerse en contacto conmigo.
        </span>
      </label>

      {estado === "error" && (
        <p className="form-error">
          No se ha podido enviar. Prueba otra vez, o escribe directamente a{" "}
          <a href={`mailto:${centro.secretaria.email}`}>{centro.secretaria.email}</a>.
        </p>
      )}

      <button className="btn" type="submit" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
