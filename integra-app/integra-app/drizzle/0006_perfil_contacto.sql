-- Custom SQL migration file, put your code below! --
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (
    id, email, nombre, apellidos, fecha_nacimiento, telefono, cedula
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'apellidos', ''),
    (nullif(new.raw_user_meta_data ->> 'fecha_nacimiento', ''))::date,
    nullif(new.raw_user_meta_data ->> 'telefono', ''),
    nullif(new.raw_user_meta_data ->> 'cedula', '')
  );
  return new;
end;
$$;