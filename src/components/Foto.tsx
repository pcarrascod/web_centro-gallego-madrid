import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Hueco de foto. Mientras no haya imagen real muestra el marcador gris con
 * el texto de lo que debería ir ahí.
 *
 * Cuando tengas la foto: guárdala en public/fotos/ y pasa
 * `src="/fotos/nombre.jpg"`. El marcador desaparece solo.
 */
export function Foto({
  texto,
  src,
  className = "",
  style,
}: {
  texto: string;
  src?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`ph ${className}`.trim()} style={style}>
      {src ? (
        <Image
          src={src}
          alt={texto}
          fill
          sizes="(max-width: 1000px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <span>{texto}</span>
      )}
    </div>
  );
}
