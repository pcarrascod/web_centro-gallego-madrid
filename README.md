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
| Dirección, teléfono, horario de secretaría, cifras | [`src/data/centro.ts`](src/data/centro.ts) |
| Grupos, días, horarios, niveles, plazas libres | [`src/data/grupos.ts`](src/data/grupos.ts) |
| Actuaciones, romerías, fiestas, puertas abiertas | [`src/data/eventos.ts`](src/data/eventos.ts) |
| La cronología de la página Nosotros | [`src/data/historia.ts`](src/data/historia.ts) |
| Las cuentas, y quién lleva o va a cada grupo | Desde la web: **Usuarios**, en la zona privada |
| **Qué puede hacer cada rol** | [`src/lib/roles.ts`](src/lib/roles.ts) |

Los textos largos (el hero, «Qué hacemos», la cita de Manuela) están dentro de
cada página, en [`src/app/`](src/app/):

| Página | Archivo |
| --- | --- |
| Inicio → `/` | [`src/app/page.tsx`](src/app/page.tsx) |
| Nosotros → `/nosotros` | [`src/app/nosotros/page.tsx`](src/app/nosotros/page.tsx) |
| Calendario → `/calendario` | [`src/app/calendario/page.tsx`](src/app/calendario/page.tsx) |
| Actividades → `/actividades` | [`src/app/actividades/page.tsx`](src/app/actividades/page.tsx) |
| Entrar → `/entrar` | [`src/app/entrar/page.tsx`](src/app/entrar/page.tsx) |
| Panel → `/panel` | [`src/app/panel/page.tsx`](src/app/panel/page.tsx) |

Los colores y todo el diseño: [`src/app/globals.css`](src/app/globals.css).
Los colores están arriba, en `:root`, con su nombre en gallego.

### Dos detalles que ahorran trabajo

**Los ensayos semanales no se escriben en el calendario.** Salen solos de
`grupos.ts`: cada grupo tiene un `diaSemana` (1 = lunes … 6 = sábado) y el
calendario los repite cada semana, en todos los meses. Si el coro se pasa al
viernes, cambias `diaSemana: 4` por `diaSemana: 5` y queda corregido en el
calendario y en la tarjeta de Actividades a la vez.

**En `eventos.ts` solo van las cosas que pasan una vez.** Pones la fecha y
aparece en el mes que le toque, sin tocar nada más. Si el evento es de unos
grupos concretos, añádele `grupos: ["coro"]` y en la zona privada solo le saldrá
a quien vaya a coro; sin ese campo, es de todo el centro.

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

## La zona privada: quién entra y qué ve

Hay **tres tipos de usuario**, y el rol decide lo que cada uno ve al entrar.

| | Zona privada | Ver alumnos | Editar grupos | Apuntar y quitar alumnos | Su ropa | Gestionar cuentas |
| --- | --- | --- | --- | --- | --- | --- |
| **Administrador** | sí | todos | todos | todos | — | sí |
| **Profesor** | sí | sus grupos | sus grupos | sus grupos* | — | — |
| **Alumno** | sí | — | — | — | sí | — |

* Un profesor apunta al alumno a su grupo, pero la invitación por correo no
sale hasta que secretaría la aprueba en Usuarios → *Invitaciones por aprobar*.
Así nadie recibe un correo del centro sin que secretaría lo sepa. Si el correo
ya es de un alumno del centro, se le apunta al grupo sin más. Quitar a alguien
de un grupo no le da de baja del centro: sigue en sus otros grupos.

«Sus grupos» es la clave de todo: un profesor ve a los alumnos de los grupos que
imparte, con su teléfono y su correo, y puede cambiar sus horarios — pero de los
grupos de otra compañera no ve nada. Eso evita tener que inventar un rol por
cada profesor.

**Esta tabla vive en un solo sitio: [`src/lib/roles.ts`](src/lib/roles.ts).** No
hay permisos sueltos por las páginas. Si quieres que los profesores puedan hacer
algo más, se añade ahí y cambia en toda la web a la vez — incluidos los enlaces
del menú, que se arman preguntando por los permisos. La pantalla de Usuarios
dibuja esa misma tabla leyendo el archivo, así que siempre puedes comprobar de un
vistazo si dice lo que crees que dice.

### Montar Supabase (una sola vez)

Las cuentas y las matrículas viven en [Supabase](https://supabase.com), que
guarda la base de datos y también las contraseñas, cifradas: ni la web ni la
secretaría las ven nunca. Para ponerlo en marcha:

1. **Crea el proyecto.** En <https://supabase.com/dashboard>, *New project*. El
   plan gratuito sobra. Elige la región de Europa (Frankfurt o París) y apunta la
   contraseña de la base de datos en algún sitio seguro, aunque la web no la usa.
2. **Crea las tablas.** En *SQL Editor*, pega entero
   [`supabase/esquema.sql`](supabase/esquema.sql) y pulsa *Run*.
3. **Pon las claves.** Copia `.env.example` como `.env.local` y rellénalo con lo
   que sale en *Project Settings → API Keys* (la URL está en *Data API*). La
   clave secreta lo puede todo: no la pegues en ningún sitio más.
4. **Dile a dónde tienen que llevar los correos.** En *Authentication → URL
   Configuration*, pon *Site URL* a `http://localhost:3000`. Cuando se publique,
   se cambia por la dirección de verdad de la web.
5. **Cambia dos plantillas de correo**, en *Authentication → Emails*. Hace falta
   porque la de fábrica lleva a una página que la web no sabe leer. En
   **Invite user**, cambia el enlace por este:

   ```html
   <a href="{{ .SiteURL }}/entrar/confirmar?token_hash={{ .TokenHash }}&type=invite">Elegir mi contraseña</a>
   ```

   Y en **Reset password**, por este otro (cambia solo el final):

   ```html
   <a href="{{ .SiteURL }}/entrar/confirmar?token_hash={{ .TokenHash }}&type=recovery">Elegir contraseña nueva</a>
   ```

   El texto de alrededor se puede traducir y poner a gusto del centro.
6. **Dale 24 horas a los enlaces.** De fábrica caducan a la hora, que es poco
   para alguien que abre el correo por la noche. En *Authentication → Sign In /
   Providers → Email*, pon *Email OTP Expiration* a `86400`.
7. **Crea tu cuenta de administradora:**

   ```bash
   npm run preparar-base -- --admin tu@correo.com "Nombre" "Apellidos"
   ```

   Eso copia los grupos a la base de datos (las matrículas los necesitan) y te
   manda la invitación. Abre el correo, elige contraseña y ya estás dentro.

**Un aviso sobre los correos.** El servidor de correo que trae Supabase es solo
para probar: **solo manda a las direcciones del equipo del proyecto** (la tuya) y
unos pocos por hora. Para invitar a socios de verdad hay que conectar uno propio
en *Authentication → Emails → SMTP Settings*: el del correo del centro, o un
servicio como Resend o Brevo, que tienen plan gratuito.

Si añades un grupo nuevo a `grupos.ts`, vuelve a ejecutar `npm run
preparar-base` (sin `--admin`) para que se pueda matricular a gente en él.

### Dar de alta a alguien

Hay dos caminos: secretaría desde **Usuarios**, o un profesor desde la ficha de
su grupo (*Apuntar a un alumno*), que deja la invitación pendiente de aprobar.

En **Usuarios**, abajo del todo, rellena nombre, correo, rol y grupos. A esa
persona le llega un correo con un enlace; lo abre, elige su contraseña y entra.
Pulsando su nombre en la lista se abre su ficha, donde se cambian sus datos y
sus grupos, se ve si ya ha activado la cuenta, se le vuelve a mandar la
invitación y se le da de baja.

**Dar de baja no borra nada.** Deja de poder entrar y de salir en las listas,
pero su ficha y su historial de grupos se quedan, por si vuelve el año que viene.

Si alguien olvida la contraseña, la pide desde la pantalla de entrar: *He
olvidado la contraseña*. Secretaría no tiene que hacer nada.

Las matrículas se guardan por temporada (`TEMPORADA` en
[`almacen.ts`](src/lib/almacen.ts)). Cada septiembre se cambia ese valor, y todo
el mundo aparece sin grupos hasta que se le matricule en la nueva: así queda el
histórico de quién estuvo en qué grupo cada año.

### Qué ve un alumno

Todo lo suyo está en la misma página, `/panel`, en tres secciones — y el menú del
avatar lleva a cada una:

- **Tus próximos eventos.** Lo del centro entero y lo de sus clases, con cuánto
  falta para cada cosa. Va primero porque es lo único que caduca: los grupos y la
  ropa siguen ahí mañana, una actuación que ya pasó no. Los ensayos semanales no
  salen aquí: esos están en sus clases.
- **Mis clases.** Los grupos a los que va, con sus horarios.
- **Mi ropa.** Ver más abajo.

Lo de «lo del centro entero y lo de sus clases» sale de un campo `grupos` en
[`eventos.ts`](src/data/eventos.ts):

- **Un evento sin `grupos` es de todos** y le aparece a todo el mundo — el
  magosto, una romería, una reunión general. Es lo normal, así que no hay que
  hacer nada.
- **Uno con `grupos` va solo a quien le toca.** «Inicio de coro» solo lo ve quien
  va a coro. La misma regla vale para los profesores: les aparece lo de los
  grupos que dan. Y a la secretaría le aparece todo, porque organiza los eventos.

Esto solo afecta al panel de cada socio: el calendario público sigue enseñando
todo a todo el mundo, que para eso es público.

Para saber qué puede hacer cada rol no hay que entrar con su cuenta: la pantalla
de Usuarios lo enseña en una cuadrícula, dibujada leyendo la tabla de permisos.

### «Mi ropa»: lo propio y lo prestado

Esta sección tiene dos mitades, y la diferencia es **de quién es la prenda**:

| | Quién lo escribe | Para qué sirve |
| --- | --- | --- |
| **Prestado por el centro** | secretaría | saber qué hay que devolver y qué está roto |
| **Lo propio y las tallas** | el socio | que el centro sepa qué le tiene que prestar |

El socio ve lo prestado pero no lo toca, y escribe lo suyo, que es el dato que
solo él sabe. Al guardar, lo prestado se conserva: no viene en el formulario, así
que si se guardara solo lo que llega, se borraría. Está probado.

Las prendas salen de un catálogo en [`src/data/ropa.ts`](src/data/ropa.ts) —
dengue, mantelo, refaixo, monteira…— para que no acaben cinco formas de escribir
«mantelo» en la base de datos. Para añadir una prenda, una línea más ahí.

**Lo que presta el centro todavía no se edita desde la web**: se escribe a mano en
`ropa.ts`. La pantalla de secretaría para llevar el armario es lo siguiente que
falta. Los profesores tampoco tienen sección de ropa, aunque vistan el traje: es
una línea en la tabla de permisos el día que la queráis.

### Los archivos

| Para qué | Archivo |
| --- | --- |
| Los roles y la tabla de permisos | [`src/lib/roles.ts`](src/lib/roles.ts) |
| El catálogo de prendas y la ropa de cada uno | [`src/data/ropa.ts`](src/data/ropa.ts) |
| Pedir los datos comprobando permisos | [`src/lib/acceso.ts`](src/lib/acceso.ts) |
| Entrar, salir, invitar y las contraseñas | [`src/lib/sesion.ts`](src/lib/sesion.ts) |
| Leer y guardar: personas en Supabase, grupos y ropa en memoria | [`src/lib/almacen.ts`](src/lib/almacen.ts) |
| Renovar la sesión y cortar el paso a `/panel` | [`src/proxy.ts`](src/proxy.ts) |
| Las tablas de la base de datos | [`supabase/esquema.sql`](supabase/esquema.sql) |
| Copiar los grupos y crear la primera administradora | [`scripts/preparar-base.mjs`](scripts/preparar-base.mjs) |

Dos reglas que conviene no romper:

**Las páginas del panel no leen `src/data/` directamente.** Piden los datos a
`acceso.ts`, y es ahí donde se comprueban los permisos, pegados a los datos. Así
no depende de que nadie se acuerde de comprobarlos en cada página nueva.

**Esconder un botón no protege nada.** Los formularios se pueden llamar desde
fuera de la web, sin pasar por nuestros botones, así que las funciones que
guardan vuelven a comprobar el permiso antes de tocar nada. Está probado: un
profesor que falsifique el formulario para editar el grupo de otra se lleva un
«No puedes editar este grupo».

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

- **El selector Castellano / Galego** no traduce nada. Next.js sabe hacer webs
  en dos idiomas, pero hay que escribir las dos versiones de cada texto.

### La zona privada, en concreto

Las cuentas, las contraseñas y las matrículas ya son de verdad: viven en
Supabase. Lo que sigue siendo maqueta es **lo que se edita de los grupos y de la
ropa**: se guarda en la memoria del servidor y se pierde al reiniciarlo. En
Netlify no funciona en absoluto, porque cada visita puede caer en un servidor
distinto, con su propia memoria. Las tablas ya están en `esquema.sql`; falta
cambiar esa parte de `almacen.ts` para que las use.

### Lo siguiente, cuando toque

- **«Solicitar plaza»** ya manda un correo a secretaría por Netlify Forms, pero
  no crea la cuenta ni la matrícula: eso se sigue haciendo a mano. Con base de
  datos, aprobar una solicitud podría dar de alta al socio en su grupo.
- **Grupos, horarios, ropa y eventos a Supabase**, como ya están las personas.
  Hasta entonces, lo que se edite de ellos desde el panel no dura.
- **El armario del centro**: secretaría necesita una pantalla para apuntar qué
  presta a quién y en qué estado vuelve. Hoy eso se escribe en `ropa.ts`.
- **Pasar asistencia** y **que un profesor resuelva las solicitudes de sus
  grupos** se dejaron fuera a propósito. Añadirlas es una línea en la tabla de
  permisos más la pantalla correspondiente.
- **La web entera se genera ahora en cada visita**, no de golpe al publicar,
  porque la cabecera tiene que leer la sesión para saber si pones «Entrar» o el
  avatar. Con este tamaño de web da igual, pero si algún día importa, lo que hay
  que mirar es Cache Components, que sabe dejar la página quieta y refrescar solo
  ese trozo.

---

## Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo, con recarga automática |
| `npm run build` | Compila la versión de producción; avisa de errores |
| `npm start` | Sirve lo compilado, para probarlo tal como se verá |
| `npm run lint` | Revisa el código en busca de descuidos |
| `npm run preparar-base` | Copia los grupos a Supabase; con `--admin`, crea una administradora |
