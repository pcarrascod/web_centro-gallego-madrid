import type { Metadata } from "next";
import Link from "next/link";
import { cambiarRol, rechazarInvitacion } from "@/app/panel/acciones";
import { BotonReenviar, FormularioAlta } from "@/components/FormulariosUsuario";
import { PanelCabecera } from "@/components/PanelCabecera";
import {
  exigirUsuario,
  invitacionesPendientes,
  todasLasCuentas,
  todosLosGrupos,
} from "@/lib/acceso";
import {
  acciones,
  ambitoDe,
  puede,
  roles,
  todasLasAcciones,
  todosLosRoles,
} from "@/lib/roles";

export const metadata: Metadata = {
  title: "Usuarios",
  robots: { index: false },
};

/**
 * Las cuentas del centro y el rol de cada una. Solo para quien pueda
 * gestionarlas, que hoy es el administrador.
 */
export default async function Usuarios() {
  const usuario = await exigirUsuario();

  /* Quien no pueda gestionar cuentas se queda aquí: no se piden los datos, así
     que no hay nada que se pueda escapar. Se le dice, en vez de dejarle una
     página en blanco o mandarle a otro sitio sin explicación. */
  if (!puede(usuario.rol, "gestionar:usuarios")) {
    return (
      <div className="page">
        <div className="section">
          <div className="wrap">
            <PanelCabecera usuario={usuario} activo="usuarios" />
            <section className="panel-bloque">
              <div className="aviso">
                <h1 className="panel-h2">Esto no es para ti</h1>
                <p style={{ margin: "0 0 6px" }}>
                  Las cuentas del centro las gestiona la secretaría. Tú entras
                  como <strong>{roles[usuario.rol].etiqueta.toLowerCase()}</strong>.
                </p>
                <p className="small" style={{ margin: 0 }}>
                  <Link className="link" href="/panel">
                    Volver a mi panel
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  const cuentas = await todasLasCuentas();
  const pendientes = await invitacionesPendientes();
  const grupos = await todosLosGrupos();

  const deAlta = cuentas.filter((cuenta) => cuenta.activo).length;

  /** Para poder poner el nombre del grupo y no su id en la tabla. */
  const nombreDeGrupo = new Map(grupos.map((g) => [g.id, g.nombreCorto]));

  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <PanelCabecera usuario={usuario} activo="usuarios" />

          <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", marginTop: 34 }}>
            Usuarios
          </h1>
          <p className="lead" style={{ margin: "16px 0 44px" }}>
            {deAlta} personas de alta. El rol decide lo que ve cada una al
            entrar: cámbialo aquí y cambia al momento. Pulsa un nombre para
            editar sus datos y sus grupos.
          </p>

          {/* ---------- Lo que han pedido los profesores ---------- */}
          {pendientes.length > 0 && (
            <section className="panel-bloque" id="pendientes">
              <h2 className="panel-h2">
                Invitaciones por aprobar{" "}
                <span className="cuenta">{pendientes.length}</span>
              </h2>
              <p className="small" style={{ margin: 0 }}>
                Alumnos que ha apuntado un profesor a su grupo. Ya están en el
                grupo, pero no pueden entrar hasta que les mandes la invitación.
                Si alguno no debería estar, recházalo y se borra su ficha.
              </p>

              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Grupo</th>
                      <th>Lo pidió</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((persona) => (
                      <tr key={persona.id}>
                        <td>
                          <Link href={`/panel/usuarios/${persona.id}`}>
                            {persona.nombre}
                          </Link>
                        </td>
                        <td>{persona.email}</td>
                        <td>
                          {persona.grupos
                            .map((id) => nombreDeGrupo.get(id) ?? id)
                            .join(", ") || <span className="apagado">ninguno</span>}
                        </td>
                        <td>
                          {persona.pedidaPorNombre ?? "—"}
                          <span className="apagado">
                            {" · "}
                            {new Date(persona.invitacionPedida!.en).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short" },
                            )}
                          </span>
                        </td>
                        <td>
                          <div className="rol-form">
                            <BotonReenviar
                              usuarioId={persona.id}
                              texto="Mandar invitación"
                            />
                            <form action={rechazarInvitacion}>
                              <input type="hidden" name="usuario" value={persona.id} />
                              <button className="btn ghost sm" type="submit">
                                Rechazar
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="panel-bloque">
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Grupos</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentas.map((cuenta) => {
                    const soyYo = cuenta.id === usuario.id;
                    const susGrupos = cuenta.grupos
                      .map((id) => nombreDeGrupo.get(id) ?? id)
                      .join(", ");

                    return (
                      <tr key={cuenta.id} className={cuenta.activo ? undefined : "de-baja"}>
                        <td>
                          <Link href={`/panel/usuarios/${cuenta.id}`}>
                            {cuenta.nombre}
                          </Link>
                          {soyYo && <span className="pill pill-suave">tú</span>}
                          {!cuenta.activo && (
                            <span className="pill pill-suave">de baja</span>
                          )}
                        </td>
                        <td>
                          {cuenta.email ? (
                            <a href={`mailto:${cuenta.email}`}>{cuenta.email}</a>
                          ) : (
                            <span className="apagado">sin correo</span>
                          )}
                        </td>
                        <td>
                          {cuenta.rol === "admin" ? (
                            <span className="apagado">todos</span>
                          ) : susGrupos ? (
                            susGrupos
                          ) : (
                            <span className="apagado">ninguno</span>
                          )}
                        </td>
                        <td>
                          {soyYo ? (
                            /* Nadie se cambia el rol a sí misma: si la única
                               administradora se pasa a alumna, el centro se
                               queda sin nadie que pueda repartir permisos. */
                            <span className="pill">
                              {roles[cuenta.rol].etiqueta}
                            </span>
                          ) : (
                            <form action={cambiarRol} className="rol-form">
                              <input
                                type="hidden"
                                name="usuario"
                                value={cuenta.id}
                              />
                              <select
                                name="rol"
                                defaultValue={cuenta.rol}
                                aria-label={`Rol de ${cuenta.nombre}`}
                              >
                                {todosLosRoles.map((rol) => (
                                  <option key={rol} value={rol}>
                                    {roles[rol].etiqueta}
                                  </option>
                                ))}
                              </select>
                              <button className="btn ghost sm" type="submit">
                                Guardar
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </section>

          {/* ---------- Dar de alta ---------- */}
          <section className="panel-bloque" id="alta">
            <h2 className="panel-h2">Dar de alta a una persona</h2>
            <p className="small" style={{ margin: "0 0 26px" }}>
              Le llegará un correo con un enlace para elegir su contraseña. Tú
              no la ves nunca: si la olvida, se pide otra desde la pantalla de
              entrar.
            </p>
            <FormularioAlta
              grupos={grupos.map((g) => ({ id: g.id, nombre: g.nombre }))}
            />
          </section>

          {/* ---------- La tabla de permisos, tal cual está en el código ---------- */}
          <section className="panel-bloque">
            <h2 className="panel-h2">Qué puede cada rol</h2>
            <p className="small" style={{ margin: "0 0 22px" }}>
              Esta cuadrícula no está escrita aquí: se dibuja leyendo{" "}
              <code>src/lib/roles.ts</code>, que es el mismo sitio del que la web
              saca los permisos de verdad. Si las dos cosas no cuadran, es que
              hay un error en otro lado.
            </p>

            <div className="tabla-scroll">
              <table className="tabla tabla-permisos">
                <thead>
                  <tr>
                    <th>Rol</th>
                    {todasLasAcciones.map((accion) => (
                      <th key={accion} title={acciones[accion].larga}>
                        {acciones[accion].corta}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {todosLosRoles.map((rol) => (
                    <tr key={rol}>
                      <th scope="row">{roles[rol].etiqueta}</th>
                      {todasLasAcciones.map((accion) => {
                        const ambito = ambitoDe(rol, accion);
                        return (
                          <td key={accion}>
                            {ambito === "todos" && <span className="si">Sí</span>}
                            {ambito === "propios" && (
                              <span className="parcial">Sus grupos</span>
                            )}
                            {ambito === null && <span className="apagado">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="roles-leyenda">
              {todosLosRoles.map((rol) => (
                <div key={rol}>
                  <dt>{roles[rol].etiqueta}</dt>
                  <dd>{roles[rol].resumen}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
