import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'


//Apuntar a .env.local
config({ path: '.env.local' })  


//Configuracion estandar de drizzle para supabase.
export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },

  schemaFilter: ['public'],
  entities: { roles: { provider: 'supabase' } },
  casing: 'snake_case', //Para escribir en snake_case en Typescript, y que Postgre mantenga las minusculas
})