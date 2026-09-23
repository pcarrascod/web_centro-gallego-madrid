import type { Metadata } from "next";
import Link from "next/link";
import { MiRopa } from "@/components/MiRopa";
import { PanelCabecera } from "@/components/PanelCabecera";
import { ProximosEventos } from "@/components/ProximosEventos";
import { TarjetaGrupoPanel } from "@/components/TarjetaGrupoPanel";
import { aISO, eventosParaGrupos } from "@/data/eventos";
import {
  exigirUsuario,
  invitacionesPendientes,
  miRopa,
  misGrupos,
} from "@/lib/acceso";
import { primerNombre } from "@/lib/nombres";
import { type Rol, puede, roles } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Mi panel",
  robots: { index: false },
};

/**
 * La misma lista de grupos se llama distinto según quién mire: el alumno ve
 * las clases a las que va, el profesor las que da, y la secretaría todas.
 */
const tituloGrupos: Record<Rol, string> = {
  admin: "Los grupos del centro",
  profesor: "Los grupos que llevas",
  alumno: "Mis clases",
};

const sinGrupos: Record<Rol, string> = {
  admin: "No hay grupos dados de alta.",
  profesor:
    "Todavía no llevas ningún grupo. Secretaría es quien asigna los grupos a cada profesor.",
  alumno: "No estás apuntado a ninguna clase todavía.",
};

export default async function Panel() {
  /* Si no hay sesión, esto manda a /entrar y la página no llega a pintarse. */
  const usuario = await exigirUsuario();
  const grupos = await misGrupos();

  /* La ropa solo se pide si a este rol le toca tenerla. */
  const tieneRopa = puede(usuario.rol, "editar:mi-ropa");
  const ropa = tieneRopa ? await miRopa() : null;

  /* Lo que han pedido los profesores y espera a secretaría. */
  const pendientes = puede(usuario.rol, "gestionar:usuarios")
    ? (await invitacionesPendientes()).length
    : 0;

  const hoyISO = aISO(new Date());

  /*
   * Los eventos se filtran por los grupos de la persona, y esos grupos son los
   * que ya tenemos arriba: los suyos si es alumna o profesora, y todos si es la
   * secretaría —porque `misGrupos()` le devuelve todos—. Así la secretaría ve
   * los eventos enteros sin tener que tratarla como un caso aparte.
   *
   * Cuatro, que es lo que llena una fila de tarjetas en un portátil. Para el
   * resto hay un enlace al calendario completo.
   */
  const eventos = eventosParaGrupos(
    grupos.map((grupo) => grupo.id),
    hoyISO,
    4,
  );

  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <PanelCabecera usuario={usuario} activo="panel" />

          <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", marginTop: 34 }}>
            Hola, {primerNombre(usuario.nombre)}
          </h1>
          <p className="lead" style={{ margin: "16px 0 52px" }}>
            {roles[usuario.rol].resumen}
          </p>

          {pendientes > 0 && (
            <p className="form-ok" style={{ marginBottom: 52 }}>
              {pendientes === 1
                ? "Hay 1 invitación esperando a que la apruebes."
                : `Hay ${pendientes} invitaciones esperando a que las apruebes.`}{" "}
              <Link className="link" href="/panel/usuarios#pendientes">
                Revisarlas
              </Link>
            </p>
          )}

          {/* ---------- Eventos ---------- */}
          {/* Va primero a propósito: es lo que caduca. Los grupos y la ropa
              siguen ahí mañana; una actuación que ya ha pasado, no. */}
          <section className="panel-bloque" id="proximos-eventos">
            <h2 className="panel-h2">Tus próximos eventos</h2>
            <p className="small" style={{ margin: "0 0 26px" }}>
              Lo del centro entero y lo de tus clases. Los ensayos de cada semana
              no salen aquí: están más abajo, con tus clases.
            </p>

            <ProximosEventos eventos={eventos} hoyISO={hoyISO} />
          </section>

          {/* ---------- Clases ---------- */}
          <section className="panel-bloque" id="mis-clases">
            <h2 className="panel-h2">{tituloGrupos[usuario.rol]}</h2>

            {grupos.length === 0 ? (
              <p className="small">{sinGrupos[usuario.rol]}</p>
            ) : (
              <div className="fichas">
                {grupos.map((grupo) => (
                  <TarjetaGrupoPanel
                    grupo={grupo}
                    usuario={usuario}
                    key={grupo.id}
                  />
                ))}
              </div>
            )}

            {usuario.rol === "alumno" && (
              <p className="small" style={{ marginTop: 22 }}>
                ¿Quieres probar otra?{" "}
                <Link className="link" href="/actividades">
                  Mira las actividades
                </Link>
                .
              </p>
            )}
          </section>

          {/* ---------- Ropa ---------- */}
          {ropa && (
            <section className="panel-bloque" id="mi-ropa">
              <h2 className="panel-h2">Mi ropa</h2>
              <p className="small" style={{ margin: "0 0 30px" }}>
                Lo que te presta el centro y lo que ya es tuyo. Cuanto mejor esté
                esto, menos vueltas hay que dar antes de una actuación.
              </p>

              <MiRopa ropa={ropa} />
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
