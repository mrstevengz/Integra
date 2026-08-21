CREATE TYPE "public"."rango_historial" AS ENUM('1m', '3m', '6m', 'todo');--> statement-breakpoint
CREATE TABLE "exportaciones_expediente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"token" text NOT NULL,
	"codigo" text NOT NULL,
	"secciones" jsonb NOT NULL,
	"rango_historial" "rango_historial" DEFAULT '3m' NOT NULL,
	"expira_en" timestamp with time zone NOT NULL,
	"revocada_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "exportaciones_expediente_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "exportaciones_expediente" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "exportaciones_expediente" ADD CONSTRAINT "exportaciones_expediente_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exportaciones_perfil_idx" ON "exportaciones_expediente" USING btree ("perfil_id");--> statement-breakpoint
CREATE INDEX "exportaciones_token_idx" ON "exportaciones_expediente" USING btree ("token");--> statement-breakpoint
CREATE POLICY "exportaciones_select_propio" ON "exportaciones_expediente" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "exportaciones_expediente"."perfil_id");--> statement-breakpoint
CREATE POLICY "exportaciones_create_propio" ON "exportaciones_expediente" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "exportaciones_expediente"."perfil_id");--> statement-breakpoint
CREATE POLICY "exportaciones_update_propio" ON "exportaciones_expediente" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "exportaciones_expediente"."perfil_id") WITH CHECK ((select auth.uid()) = "exportaciones_expediente"."perfil_id");