-- Custom SQL migration file, put your code below! --

-- Tablas nuevas de medicacion
drop trigger if exists handle_times on public.medicamentos;
create trigger handle_times before insert or update on public.medicamentos
  for each row execute procedure public.handle_times();

drop trigger if exists handle_times on public.horarios;
create trigger handle_times before insert or update on public.horarios
  for each row execute procedure public.handle_times();

drop trigger if exists handle_times on public.tomas;
create trigger handle_times before insert or update on public.tomas
  for each row execute procedure public.handle_times();

-- Tablas existentes a las que les faltaba: sin esto no sincronizan sus ediciones
drop trigger if exists handle_times on public.articulos;
create trigger handle_times before insert or update on public.articulos
  for each row execute procedure public.handle_times();

drop trigger if exists handle_times on public.condiciones;
create trigger handle_times before insert or update on public.condiciones
  for each row execute procedure public.handle_times();

drop trigger if exists handle_times on public.alergias;
create trigger handle_times before insert or update on public.alergias
  for each row execute procedure public.handle_times();

drop trigger if exists handle_times on public.contactosemergencia;
create trigger handle_times before insert or update on public.contactosemergencia
  for each row execute procedure public.handle_times();