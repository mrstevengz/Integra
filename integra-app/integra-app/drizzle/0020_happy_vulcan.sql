CREATE TYPE "public"."tipo_cita" AS ENUM('primera', 'control', 'rutina', 'prioritaria', 'urgencias');--> statement-breakpoint
CREATE TABLE "citas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"tipo_citas" "tipo_cita" NOT NULL,
	"especialidad" text NOT NULL,
	"institucion" text NOT NULL,
	"medico" text,
	"programada_para" timestamp with time zone NOT NULL,
	"notas" text,
	"cancelada" boolean DEFAULT false,
	"nota_cancelacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "citas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "citas_resultado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"cita_id" uuid NOT NULL,
	"asistido" boolean DEFAULT true NOT NULL,
	"diagnostico" text,
	"instruccion" text,
	"ajuste_medicacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "citas_resultado" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas_resultado" ADD CONSTRAINT "citas_resultado_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas_resultado" ADD CONSTRAINT "citas_resultado_cita_id_citas_id_fk" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "citas_perfil_idx" ON "citas" USING btree ("perfil_id");--> statement-breakpoint
CREATE INDEX "citas_resultado_perfil_idx" ON "citas_resultado" USING btree ("perfil_id");--> statement-breakpoint
CREATE POLICY "citas_select_propio" ON "citas" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "citas"."perfil_id");--> statement-breakpoint
CREATE POLICY "citas_create_propio" ON "citas" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "citas"."perfil_id");--> statement-breakpoint
CREATE POLICY "citas_update_propio" ON "citas" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "citas"."perfil_id") WITH CHECK ((select auth.uid()) = "citas"."perfil_id");--> statement-breakpoint
CREATE POLICY "citas_resultado_select_propio" ON "citas_resultado" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "citas_resultado"."perfil_id");--> statement-breakpoint
CREATE POLICY "citas_resultado_create_propio" ON "citas_resultado" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "citas_resultado"."perfil_id");--> statement-breakpoint
CREATE POLICY "citas_resultado_update_propio" ON "citas_resultado" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "citas_resultado"."perfil_id") WITH CHECK ((select auth.uid()) = "citas_resultado"."perfil_id");