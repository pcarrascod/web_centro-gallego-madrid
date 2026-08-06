# Centro Gallego de Madrid

Web del centro, hecha con [Next.js](https://nextjs.org). Nació de una maqueta
de un solo archivo (`centro-gallego-madrid.html`, que sigue aquí como
referencia del diseño original).

---

## Trabajar en la web

```bash
npm run dev
```

Abre <http://localhost:3000>. Cada vez que guardes un archivo, el navegador se
actualiza solo — no hace falta recargar.

Para parar el servidor: `Ctrl + C` en la terminal.

---

## Dónde se cambia cada cosa

**Lo que vas a tocar más a menudo está en [`src/data/`](src/data/).** Son
archivos de datos: listas de cosas, sin nada de diseño. Cambias un valor,
guardas, y se actualiza en todas las páginas donde aparezca.

| Quiero cambiar… | Archivo |
| --- | --- |
| Dirección, teléfono, horario de secretaría, cuota, cifras | [`src/data/centro.ts`](src/data/centro.ts) |
| Grupos, días, horarios, niveles, plazas libres | [`src/data/grupos.ts`](src/data/grupos.ts) |
| Actuaciones, romerías, fiestas, puertas abiertas | [`src/data/eventos.ts`](src/data/eventos.ts) |
| La cronología de la página Nosotros | [`src/data/historia.ts`](src/data/historia.ts) |

Los textos largos (el hero, «Qué hacemos», la cita de Manuela) están dentro de
cada página, en [`src/app/`](src/app/):

| Página | Archivo |
| --- | --- |
| Inicio → `/` | [`src/app/page.tsx`](src/app/page.tsx) |
| Nosotros → `/nosotros` | [`src/app/nosotros/page.tsx`](src/app/nosotros/page.tsx) |
| Calendario → `/calendario` | [`src/app/calendario/page.tsx`](src/app/calendario/page.tsx) |
| Actividades → `/actividades` | [`src/app/actividades/page.tsx`](src/app/actividades/page.tsx) |

Los colores y todo el diseño: [`src/app/globals.css`](src/app/globals.css).
Los colores están arriba, en `:root`, con su nombre en gallego.

### Dos detalles que ahorran trabajo

**Los ensayos semanales no se escriben en el calendario.** Salen solos de
`grupos.ts`: cada grupo tiene un `diaSemana` (1 = lunes … 6 = sábado) y el
calendario los repite cada semana, en todos los meses. Si el coro se pasa al
viernes, cambias `diaSemana: 4` por `diaSemana: 5` y queda corregido en el
calendario y en la tarjeta de Actividades a la vez.

**En `eventos.ts` solo van las cosas que pasan una vez.** Pones la fecha y
aparece en el mes que le toque, sin tocar nada más.

### Poner fotos de verdad

Los recuadros grises son marcadores. Para sustituirlos:

1. Guarda la imagen en [`public/fotos/`](public/fotos/), por ejemplo
   `public/fotos/baile.jpg`.
2. Busca el `<Foto ... />` correspondiente y añádele el `src`:

```tsx
<Foto texto="Foto · Baile tradicional" src="/fotos/baile.jpg" />
```

El marcador desaparece solo. El `texto` se queda como descripción para
lectores de pantalla, así que no lo borres.

---

## Publicar los cambios

La web está conectada a Netlify: **cada `git push` se publica solo**, en un par
de minutos.

```bash
git add .
git commit -m "Cambio los horarios del coro"
git push
```

Antes de subir algo grande, comprueba que compila:

```bash
npm run build
```

Si eso da error, Netlify también fallará. Merece la pena mirarlo antes.

---

## Lo que todavía es maqueta

Estas partes **parecen** funcionar pero no hacen nada por detrás. Están así a
propósito: hacen falta decisiones y algo de infraestructura.

- **«Solicitar plaza»** cambia de color pero no avisa a secretaría, y se olvida
  al recargar. Para que llegue de verdad: un formulario que mande correo
  (lo más sencillo) o una base de datos.
- **El avatar y el menú de socio** — «Mi ropa», «Clases», «Eventos» — no llevan
  a ningún sitio. Necesita login de verdad y una base de datos de socios.
- **El selector Castellano / Galego** no traduce nada. Next.js sabe hacer webs
  en dos idiomas, pero hay que escribir las dos versiones de cada texto.
- **«Cerrar sesión»** no cierra nada.

---

## Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo, con recarga automática |
| `npm run build` | Compila la versión de producción; avisa de errores |
| `npm start` | Sirve lo compilado, para probarlo tal como se verá |
| `npm run lint` | Revisa el código en busca de descuidos |
