CREATE TABLE "mediciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"tipo_medicion_id" uuid NOT NULL,
	"valor" numeric(8, 3) NOT NULL,
	"valor_secundario" numeric(8, 3),
	"medido_en" timestamp with time zone NOT NULL,
	"contexto" text,
	"nota" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mediciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tipomedicion" ADD COLUMN "etiqueta_principal" text;--> statement-breakpoint
ALTER TABLE "tipomedicion" ADD COLUMN "etiqueta_secundaria" text;--> statement-breakpoint
ALTER TABLE "tipomedicion" ADD COLUMN "rango_min_secundario" numeric(8, 3);--> statement-breakpoint
ALTER TABLE "tipomedicion" ADD COLUMN "rango_max_secundario" numeric(8, 3);--> statement-breakpoint
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_tipo_medicion_id_tipomedicion_id_fk" FOREIGN KEY ("tipo_medicion_id") REFERENCES "public"."tipomedicion"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mediciones_perfil_medido_idx" ON "mediciones" USING btree ("perfil_id","medido_en");--> statement-breakpoint
CREATE POLICY "mediciones_select_propio" ON "mediciones" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "mediciones"."perfil_id");--> statement-breakpoint
CREATE POLICY "mediciones_create_propio" ON "mediciones" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "mediciones"."perfil_id");--> statement-breakpoint
CREATE POLICY "mediciones_update_propio" ON "mediciones" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "mediciones"."perfil_id") WITH CHECK ((select auth.uid()) = "mediciones"."perfil_id");