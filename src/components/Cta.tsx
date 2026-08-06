import Link from "next/link";

/** La franja azul de llamada a la acción. Se usa en Inicio y en Actividades. */
export function Cta({
  eyebrow,
  titulo,
  texto,
  boton,
  href,
}: {
  eyebrow: string;
  titulo: string;
  texto: string;
  boton: string;
  href: string;
}) {
  return (
    <div className="cta">
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{titulo}</h2>
        <p>{texto}</p>
        <Link className="btn" href={href}>
          {boton}
        </Link>
      </div>
    </div>
  );
}
