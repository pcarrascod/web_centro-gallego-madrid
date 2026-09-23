-- ===========================================================================
-- Invitaciones que pide un profesor
--
-- Un profesor puede apuntar a un alumno nuevo a su grupo, pero no mandarle la
-- invitación: eso lo aprueba secretaría. Estas dos columnas apuntan quién la
-- pidió y cuándo. Una persona está «pendiente de aprobar» mientras tenga
-- `invitacion_pedida_en` y todavía no tenga cuenta (`auth_id` vacío).
--
-- Se ejecuta una vez en el editor SQL de Supabase. Se puede repetir sin miedo.
-- (Ya está incluido en `esquema.sql` para los proyectos nuevos.)
-- ===========================================================================

alter table usuarios
  add column if not exists invitacion_pedida_por uuid
    references usuarios(id) on delete set null;

alter table usuarios
  add column if not exists invitacion_pedida_en timestamptz;

-- La pantalla de Usuarios pregunta «¿qué hay por aprobar?» cada vez que se
-- abre. Con esto no tiene que recorrer la tabla entera.
create index if not exists usuarios_invitaciones_pendientes
  on usuarios (invitacion_pedida_en)
  where auth_id is null and invitacion_pedida_en is not null;
