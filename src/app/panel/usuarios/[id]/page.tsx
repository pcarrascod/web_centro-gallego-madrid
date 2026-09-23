import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cambiarAlta } from "@/app/panel/acciones";
import { BotonReenviar, FormularioFicha } from "@/components/FormulariosUsuario";
import { PanelCabecera } from "@/components/PanelCabecera";
import { exigirUsuario, fichaDeUsuario, todosLosGrupos } from "@/lib/acceso";
import { puede, roles } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Ficha",
  robots: { index: false },
};

/** Cómo se explica cada punto en el que puede estar una cuenta. */
const CUENTA = {
  "sin-cuenta": {
    titulo: "Sin cuenta todavía",
    texto:
      "No se le ha llegado a mandar la invitación, o falló al mandarla. Mándala desde aquí.",
  },
  pendiente: {
    titulo: "Invitación enviada",
    texto:
      "Todavía no ha abierto el enlace del correo. Caduca a las 24 horas: si no le ha llegado o se le ha pasado, mándala otra vez.",
  },
  activa: {
    titulo: "Cuenta activa",
    texto:
      "Ya ha abierto la invitación. Si olvida la contraseña, puede pedir otra desde la pantalla de entrar, o se le manda el enlace desde aquí.",
  },
} as const;

/**
 * La ficha de una persona: sus datos, sus grupos, en qué punto está su cuenta
 * y el botón de darla de baja. Solo para el administrador.
 */
export default async function FichaDeUsuario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const yo = await exigirUsuario();

  /* La lista de usuarios ya sabe explicarle a quien no puede que esto no es
     para él; se le manda allí. */
  if (!puede(yo.rol, "gestionar:usuarios")) redirect("/panel/usuarios");

  const persona = await fichaDeUsuario(id);
  if (!persona) notFound();

  const grupos = await todosLosGrupos();
  const soyYo = persona.id === yo.id;
  const cuenta = CUENTA[persona.cuenta];

  return (
    <div className="page">
      <div className="section">
        <div className="wrap">
          <PanelCabecera usuario={yo} activo="usuarios" />

          <p className="eyebrow" style={{ marginTop: 34 }}>
            <Link className="link" href="/panel/usuarios">
              Usuarios
            </Link>
          </p>
          <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}>{persona.nombre}</h1>
          <p style={{ margin: "14px 0 44px" }}>
            <span className="pill">{roles[persona.rol].etiqueta}</span>
            {!persona.activo && <span className="pill pill-suave">de baja</span>}
          </p>

          <section className="panel-bloque">
            <h2 className="panel-h2">Datos y grupos</h2>
            <p className="small" style={{ margin: "0 0 26px" }}>
              Correo: <strong>{persona.email || "sin correo"}</strong>. Es con lo
              que entra, así que no se cambia desde aquí. El rol se cambia en la{" "}
              <Link className="link" href="/panel/usuarios">
                lista de usuarios
              </Link>
              .
            </p>
            <FormularioFicha
              usuario={{
                id: persona.id,
                nombreDePila: persona.nombreDePila,
                apellidos: persona.apellidos,
                telefono: persona.telefono,
                rol: persona.rol,
                grupos: persona.grupos,
              }}
              grupos={grupos.map((g) => ({ id: g.id, nombre: g.nombre }))}
            />
          </section>

          <section className="panel-bloque">
            <h2 className="panel-h2">{cuenta.titulo}</h2>
            <p className="small" style={{ margin: "0 0 20px" }}>
              {cuenta.texto}
            </p>
            {persona.email && (
              <BotonReenviar
                usuarioId={persona.id}
                texto={
                  persona.cuenta === "activa"
                    ? "Mandarle un enlace para elegir contraseña"
                    : "Mandar la invitación otra vez"
                }
              />
            )}
          </section>

          {!soyYo && (
            <section className="panel-bloque">
              <h2 className="panel-h2">
                {persona.activo ? "Dar de baja" : "Volver a dar de alta"}
              </h2>
              <p className="small" style={{ margin: "0 0 20px" }}>
                {persona.activo
                  ? "Deja de poder entrar y de salir en las listas de los grupos. No se borra nada: si vuelve, se le da de alta otra vez desde aquí y lo recupera todo."
                  : "Vuelve a poder entrar con la contraseña que tenía, y a salir en las listas de sus grupos."}
              </p>
              <form action={cambiarAlta}>
                <input type="hidden" name="usuario" value={persona.id} />
                <input type="hidden" name="activo" value={persona.activo ? "no" : "si"} />
                <button className="btn ghost sm" type="submit">
                  {persona.activo ? "Dar de baja" : "Dar de alta"}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
