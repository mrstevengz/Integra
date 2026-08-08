-- Custom SQL migration file, put your code below! --

create or replace function handle_times() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    new.created_at := now(); new.updated_at := now();
  elsif (TG_OP = 'UPDATE') then
    new.created_at = old.created_at; new.updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger handle_times before insert or update on public.perfiles
  for each row execute procedure public.handle_times();