-- Custom SQL migration file, put your code below! --

-- updated_at automatico, igual que en las demas tablas
drop trigger if exists handle_times on public.mediciones;
create trigger handle_times before insert or update on public.mediciones
  for each row execute procedure public.handle_times();

-- Presion arterial: separar sistolica de diastolica.
-- El rango 80-120 que estaba mezclaba las dos.
update public.tipomedicion set
  etiqueta_principal   = 'Sistólica',
  etiqueta_secundaria  = 'Diastólica',
  rango_min            = 90,
  rango_max            = 120,
  rango_min_secundario = 60,
  rango_max_secundario = 80
where nombre = 'Presión arterial';