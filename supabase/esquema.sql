-- ===========================================================================
-- La base de datos del centro.
--
-- Esto sustituye a `src/data/` y a `src/lib/almacen.ts`: lo que hasta ahora
-- eran listas escritas a mano en el código, y cambios guardados en la memoria
-- del servidor que se perdían al reiniciar, pasan a ser tablas de verdad.
--
-- Se ejecuta entero, de una vez, en el editor SQL de Supabase. Está escrito
-- para poder lanzarlo varias veces sin romper nada mientras probamos
-- (`if not exists` por todas partes), pero en cuanto haya datos reales dentro,
-- los cambios se hacen con `alter table`, no volviendo a ejecutar esto.
--
-- Dos decisiones que conviene entender antes de leer, porque explican casi
-- todo lo demás:
--
--   1. Una persona puede existir sin tener cuenta para entrar en la web.
--      La hoja de cálculo está llena de gente que nunca ha iniciado sesión, y
--      la secretaría tiene que poder darlos de alta igual. Por eso la tabla
--      `usuarios` tiene su propio identificador y una columna `auth_id` que
--      empieza vacía: se rellena el día que esa persona activa su cuenta.
--
--   2. La relación entre personas y grupos vive en su propia tabla.
--      Hoy, en el código, `Usuario.grupos` significa dos cosas distintas según
--      el rol: los grupos que un profesor imparte, o aquellos en los que un
--      alumno está matriculado. En la base de datos es una sola tabla,
--      `matriculas`, con una columna que dice a qué título está esa persona en
--      ese grupo. Y, de paso, es lo que permite que un alumno esté en cinco
--      grupos sin que nadie escriba nada separado por comas.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- Listas cerradas
--
-- Un `enum` es una lista de valores admitidos: si alguien intenta guardar un
-- rol que no sea uno de estos tres, la base de datos lo rechaza. Es lo que
-- evita que acaben conviviendo «profesor», «Profesor» y «prof».
--
-- Para añadir un valor más adelante:
--     alter type tipo_prenda add value 'polaina';
-- Quitar uno, en cambio, no se puede. Por eso solo son `enum` las listas que
-- sabemos que no van a encoger.
-- ---------------------------------------------------------------------------

do $$ begin
  create type rol_usuario as enum ('admin', 'profesor', 'alumno');
exception when duplicate_object then null; end $$;

do $$ begin
  create type papel_en_grupo as enum ('profesor', 'alumno');
exception when duplicate_object then null; end $$;

do $$ begin
  create type categoria_grupo as enum
    ('baile', 'pand', 'banda', 'coro', 'perc', 'taberna');
exception when duplicate_object then null; end $$;

do $$ begin
  create type origen_prenda as enum ('propia', 'prestada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_prenda as enum ('bien', 'arreglar', 'cambiar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_prenda as enum
    ('camisa', 'chaleco', 'xustillo', 'dengue', 'mantelo', 'saia', 'refaixo',
     'mandil', 'faixa', 'calzon', 'medias', 'zocas', 'zapatillas', 'pano',
     'monteira', 'manton');
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------------
-- Personas
--
-- Una fila por persona relacionada con el centro: socios, alumnos, profesores
-- y secretaría. Es la tabla que sale de la hoja de cálculo.
-- ---------------------------------------------------------------------------

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),

  -- El enlace con la cuenta de acceso de Supabase. Vacío mientras la persona
  -- no haya activado la suya, que al importar la hoja serán todas. Si se
  -- borra la cuenta de acceso, la ficha se queda: la persona sigue siendo
  -- alumna del centro aunque ya no pueda entrar en la web.
  auth_id uuid unique references auth.users(id) on delete set null,

  nombre text not null,
  apellidos text,

  -- El correo hace de identificador de cara a la persona: es con lo que entra
  -- y por donde se le avisa. Puede faltar (hay socios de toda la vida sin
  -- correo), pero si está, no puede repetirse.
  email text,
  telefono text,

  rol rol_usuario not null default 'alumno',

  -- Hace falta de verdad, no es un dato de relleno: los grupos infantiles
  -- tienen tramos por edad, y con menores cambia lo que hay que pedir y quién
  -- lo autoriza.
  fecha_nacimiento date,

  -- Quién responde por la persona si es menor de edad.
  tutor_nombre text,
  tutor_telefono text,

  -- La gente se va y vuelve. Borrar su ficha perdería su historial de grupos
  -- y su traje, así que en vez de borrar se marca de baja: deja de aparecer en
  -- las listas del panel, pero sigue ahí si vuelve el año que viene.
  activo boolean not null default true,
  fecha_alta date not null default current_date,
  fecha_baja date,

  -- Para lo que no cabe en ninguna columna. Ojo con lo que se apunte aquí:
  -- son datos personales como cualquier otro.
  notas text,

  -- Cuando es un profesor quien apunta a un alumno nuevo, la invitación no
  -- sale sola: la aprueba secretaría. Aquí queda quién la pidió y cuándo.
  -- Pendiente de aprobar = tiene `invitacion_pedida_en` y no tiene `auth_id`.
  invitacion_pedida_por uuid references usuarios(id) on delete set null,
  invitacion_pedida_en timestamptz,

  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  -- ⚠️ AQUÍ VAN LAS COLUMNAS DE TU HOJA que no estén ya arriba (número de
  -- socio, DNI, dirección, autorización de imagen...). Se añaden así, una
  -- línea por columna:
  --     alter table usuarios add column numero_socio text unique;

  constraint baja_coherente check (activo or fecha_baja is not null)
);

-- Dos correos que solo se diferencian en las mayúsculas son el mismo correo.
-- Comparándolo en minúsculas, «Marta@…» y «marta@…» chocan, que es lo que
-- queremos.
create unique index if not exists usuarios_email_unico
  on usuarios (lower(email)) where email is not null;

-- El panel lista continuamente «los que están activos», y esa es la consulta
-- que más va a crecer con los años. Con índice da igual que haya doscientos
-- alumnos o veinte mil.
create index if not exists usuarios_activos on usuarios (activo, rol);

-- «¿Qué invitaciones hay por aprobar?», cada vez que se abre Usuarios.
create index if not exists usuarios_invitaciones_pendientes
  on usuarios (invitacion_pedida_en)
  where auth_id is null and invitacion_pedida_en is not null;


-- ---------------------------------------------------------------------------
-- Grupos
--
-- Mantienen el identificador corto de `src/data/grupos.ts`
-- («baile-tradicional») en vez de un uuid, porque aparece en las URLs del
-- panel y porque así la importación es literal.
-- ---------------------------------------------------------------------------

create table if not exists grupos (
  id text primary key,
  categoria categoria_grupo not null,
  nombre text not null,
  nombre_corto text not null,
  quien text not null,
  dia text not null,
  foto text,

  -- El aviso que se lee junto al botón de solicitar plaza: «Empieza el 19 de
  -- septiembre», «Instrumento propio».
  estado text,

  -- Para ordenar las tarjetas de Actividades sin depender de cómo salgan de
  -- la consulta.
  orden smallint not null default 0,

  -- Los grupos que dejan de impartirse no se borran: hay matrículas y eventos
  -- colgando de ellos.
  visible boolean not null default true,

  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Los tramos que se enseñan en la tarjeta del grupo: hora, nivel y plazas.
create table if not exists grupo_horarios (
  id uuid primary key default gen_random_uuid(),
  grupo_id text not null references grupos(id) on delete cascade,
  hora text not null,
  nivel text not null,
  plazas text not null,
  orden smallint not null default 0
);

create index if not exists grupo_horarios_por_grupo
  on grupo_horarios (grupo_id, orden);

-- Cuándo ensaya el grupo, para pintarlo en el calendario. Va aparte de
-- `grupo_horarios` porque son dos cosas distintas que hoy se parecen: esto es
-- «el sábado a las 10.30 hay ensayo», y lo otro es el desglose por niveles que
-- se lee en la tarjeta. Un grupo que ensaye dos días tiene dos filas aquí, y
-- así desaparece el apaño de `diaSemana: [1, 6]` con sus horas en un objeto
-- aparte.
create table if not exists grupo_sesiones (
  id uuid primary key default gen_random_uuid(),
  grupo_id text not null references grupos(id) on delete cascade,

  -- 1 = lunes … 6 = sábado, 0 = domingo. Igual que en el código de hoy.
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora text not null,

  unique (grupo_id, dia_semana, hora)
);


-- ---------------------------------------------------------------------------
-- Matrículas
--
-- Quién está en qué grupo y a qué título. Sustituye a `Usuario.grupos`.
-- ---------------------------------------------------------------------------

create table if not exists matriculas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  grupo_id text not null references grupos(id) on delete cascade,
  papel papel_en_grupo not null default 'alumno',

  -- Guardar la temporada permite responder a «¿quién estaba en el coro en
  -- 2024-2025?», que es justo lo que una hoja de cálculo que se sobrescribe
  -- cada septiembre no puede contestar.
  temporada text not null default '2026-2027',

  fecha_alta date not null default current_date,
  fecha_baja date,

  creado_en timestamptz not null default now(),

  -- La misma persona no puede estar dos veces en el mismo grupo la misma
  -- temporada, pero sí un año tras otro.
  unique (usuario_id, grupo_id, temporada)
);

-- Las dos preguntas que hace el panel: «los grupos de esta persona» y «la
-- gente de este grupo». Una por cada índice.
create index if not exists matriculas_por_usuario on matriculas (usuario_id);
create index if not exists matriculas_por_grupo on matriculas (grupo_id, papel);


-- ---------------------------------------------------------------------------
-- El traje
--
-- Las medidas van aparte de las prendas, como en el código de hoy: sirven para
-- preparar un traje que todavía no existe, así que no cuelgan de ninguna
-- prenda concreta.
-- ---------------------------------------------------------------------------

create table if not exists medidas (
  -- Una sola ficha de medidas por persona: por eso la clave primaria es
  -- directamente el usuario, y no un identificador propio.
  usuario_id uuid primary key references usuarios(id) on delete cascade,

  -- Texto y no números a propósito: «M» no es un número, y en cintura la gente
  -- escribe «72» igual que «72 cm». Se rellena lo que se sepa.
  camisa text,
  cintura text,
  alto_saia text,
  pie text,

  actualizado_en timestamptz not null default now()
);

create table if not exists prendas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo tipo_prenda not null,

  -- La distinción que manda: `propia` la declara la persona, `prestada` es del
  -- centro y la apunta secretaría.
  origen origen_prenda not null,

  talla text,
  estado estado_prenda not null default 'bien',
  nota text,

  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists prendas_por_usuario on prendas (usuario_id);

-- «¿Qué hay que arreglar o reponer?» es la consulta que justifica esta tabla,
-- y solo mira las prestadas.
create index if not exists prendas_a_revisar
  on prendas (estado) where origen = 'prestada';


-- ---------------------------------------------------------------------------
-- Eventos
--
-- Lo que hoy está en `src/data/eventos.ts`. Pasa a la base de datos para que
-- secretaría pueda añadir una actuación desde el panel sin tocar el código.
-- ---------------------------------------------------------------------------

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  titulo text not null,

  -- Texto libre, porque casi siempre es una franja: «19.30 – 21.00».
  hora text,
  lugar text not null,
  descripcion text,

  -- Cómo se lee la línea dentro de la casilla del calendario.
  calendario text,

  destacado boolean not null default false,
  en_portada boolean not null default false,

  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists eventos_por_fecha on eventos (fecha);

-- A qué grupos va dirigido un evento. Sin ninguna fila aquí, el evento es de
-- todo el centro.
create table if not exists evento_grupos (
  evento_id uuid not null references eventos(id) on delete cascade,
  grupo_id text not null references grupos(id) on delete cascade,
  primary key (evento_id, grupo_id)
);


-- ---------------------------------------------------------------------------
-- `actualizado_en` al día
--
-- Para no tener que acordarse de ponerlo en cada consulta que escriba la web.
-- ---------------------------------------------------------------------------

create or replace function toca_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['usuarios', 'grupos', 'medidas', 'prendas', 'eventos']
  loop
    execute format('drop trigger if exists marca_%1$s on %1$s', t);
    execute format(
      'create trigger marca_%1$s before update on %1$s
       for each row execute function toca_actualizado_en()', t);
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- Cerrar la puerta
--
-- Supabase publica una API sobre estas tablas y reparte una clave pública que
-- viaja dentro del navegador. Con RLS activado y sin ninguna regla que permita
-- nada, esa clave no ve absolutamente nada: aquí dentro hay teléfonos, fechas
-- de nacimiento y datos de menores.
--
-- La web lee y escribe desde el servidor con la clave de servicio, que se
-- salta RLS y nunca sale de Netlify. Las reglas de quién puede ver qué siguen
-- viviendo, de momento, en `src/lib/roles.ts`.
--
-- Esto es lo primero que hay que revisar el día que el navegador hable
-- directamente con Supabase.
-- ---------------------------------------------------------------------------

alter table usuarios       enable row level security;
alter table grupos         enable row level security;
alter table grupo_horarios enable row level security;
alter table grupo_sesiones enable row level security;
alter table matriculas     enable row level security;
alter table medidas        enable row level security;
alter table prendas        enable row level security;
alter table eventos        enable row level security;
alter table evento_grupos  enable row level security;
