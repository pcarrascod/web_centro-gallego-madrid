import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioGrupo } from "@/components/FormularioGrupo";
import { PanelCabecera } from "@/components/PanelCabecera";
import {
  alumnosDeGrupo,
  exigirUsuario,
  grupo as buscarGrupo,
  profesoresDeGrupo,
} from "@/lib/acceso";
import { puedeEnGrupo, roles } from "@/lib/roles";

/**
 * La ficha de un grupo dentro del panel.
 *
 * Tiene dos mitades, y cada una aparece o no según los permisos **sobre este
 * grupo**: la lista de alumnos con sus teléfonos, y el formulario de horarios.
 * Un profesor las ve en los grupos que lleva; en los demás, no entra. La
 * secretaría entra en todos.
 */

/* En esta versión de Next.js el trozo de la dirección llega en una promesa. */
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const grupo = await buscarGrupo(id);

  return {
    title: grupo ? grupo.nombre : "Grupo",
    robots: { index: false },
  };
}

export default async function GrupoDelPanel({ params }: Props) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const grupo = await buscarGrupo(id);
  if (!grupo) notFound();

  const verAlumnos = puedeEnGrupo(usuario, "ver:alumnos", id);
  const editar = puedeEnGrupo(usuario, "editar:grupo", id);

  /* Solo se piden los alumnos si se pueden ver. `alumnosDeGrupo` lo vuelve a
     comprobar por su cuenta, así que tampoco valdría saltarse este `if`. */
  const alumnos = verAlumnos ? await alumnosDeGrupo(id) : [];
  const profesores = await profesoresDeGrupo(id);

  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <PanelCabecera usuario={usuario} activo="panel" />

          <p className="eyebrow" style={{ marginTop: 34 }}>
            <Link className="link" href="/panel">
              Mi panel
            </Link>
          </p>
          <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}>{grupo.nombre}</h1>
          <p className="lead" style={{ margin: "16px 0 10px" }}>
            {grupo.quien} · {grupo.dia}
          </p>
          <p className="small" style={{ margin: "0 0 52px" }}>
            {profesores.length > 0
              ? `Lo lleva ${profesores.map((p) => p.nombre).join(" y ")}.`
              : "Todavía no tiene profesor asignado."}
          </p>

          {!verAlumnos && !editar && (
            <section className="panel-bloque">
              <div className="aviso">
                <h2 className="panel-h2">Esto no es para ti</h2>
                <p style={{ margin: "0 0 6px" }}>
                  La ficha de un grupo la ven la secretaría y el profesor que lo
                  lleva. Tú entras como{" "}
                  <strong>{roles[usuario.rol].etiqueta.toLowerCase()}</strong>, y
                  con ese rol este grupo no es tuyo.
                </p>
                <p className="small" style={{ margin: 0 }}>
                  Los horarios de este grupo están en{" "}
                  <Link className="link" href="/actividades">
                    Actividades
                  </Link>
                  , que es página pública.
                </p>
              </div>
            </section>
          )}

          {/* ---------- Alumnos ---------- */}
          {verAlumnos && (
            <section className="panel-bloque">
              <h2 className="panel-h2">
                Alumnos{" "}
                <span className="cuenta">
                  {alumnos.length === 1
                    ? "1 apuntado"
                    : `${alumnos.length} apuntados`}
                </span>
              </h2>

              {alumnos.length === 0 ? (
                <p className="small">
                  Nadie apuntado a este grupo todavía. Las solicitudes de plaza
                  llegan al correo de secretaría.
                </p>
              ) : (
                <>
                  <div className="tabla-scroll">
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Correo</th>
                          <th>Teléfono</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumnos.map((alumno) => (
                          <tr key={alumno.id}>
                            <td>{alumno.nombre}</td>
                            <td>
                              <a href={`mailto:${alumno.email}`}>{alumno.email}</a>
                            </td>
                            <td className="nowrap">{alumno.telefono}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="small" style={{ marginTop: 16 }}>
                    Son datos de contacto de socios: úsalos para avisar de los
                    ensayos y de las actuaciones, y para nada más.
                  </p>
                </>
              )}
            </section>
          )}

          {/* ---------- Horarios ---------- */}
          {editar && (
            <section className="panel-bloque">
              <h2 className="panel-h2">Horarios y plazas</h2>
              <p className="small" style={{ margin: "0 0 26px" }}>
                Lo que cambies aquí se ve en la página de Actividades sin tocar
                código. Los días y las horas de ensayo del Calendario van por
                otro lado y todavía se editan en <code>src/data/grupos.ts</code>.
              </p>
              <p className="small" style={{ margin: "0 0 26px" }}>
                Mientras esto sea una maqueta, los cambios se guardan en la
                memoria del servidor: se pierden al reiniciarlo.
              </p>

              <FormularioGrupo
                grupoId={grupo.id}
                horarios={grupo.horarios}
                estado={grupo.estado}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
