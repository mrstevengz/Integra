CREATE TYPE "public"."tipo_sangre" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TABLE "perfiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"apellidos" text NOT NULL,
	"email" text NOT NULL,
	"fecha_nacimiento" date,
	"genero" text,
	"telefono" text,
	"tipo_sangre" "tipo_sangre",
	"medico_tratante" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "perfiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "articulo" RENAME TO "articulos";--> statement-breakpoint
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "perfiles_select_propio" ON "perfiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "perfiles"."id");--> statement-breakpoint
CREATE POLICY "perfiles_update_propio" ON "perfiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "perfiles"."id") WITH CHECK ((select auth.uid()) = "perfiles"."id");