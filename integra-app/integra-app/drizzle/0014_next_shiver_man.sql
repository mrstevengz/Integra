CREATE TYPE "public"."con_alimentos" AS ENUM('con', 'sin', 'indiferente');--> statement-breakpoint
CREATE TYPE "public"."estado_toma" AS ENUM('pendiente', 'tomada', 'pospuesta', 'omitida');--> statement-breakpoint
CREATE TYPE "public"."forma_farmaceutica" AS ENUM('tableta', 'capsula', 'jarabe', 'suspension', 'inyeccion', 'gotas', 'crema', 'inhalador', 'supositorio', 'parche');--> statement-breakpoint
CREATE TABLE "horarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"medicamento_id" uuid NOT NULL,
	"hora" time NOT NULL,
	"dias" integer[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "horarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "medicamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"dosis" numeric(8, 3) NOT NULL,
	"unidad" text NOT NULL,
	"forma" "forma_farmaceutica" NOT NULL,
	"con_alimentos" "con_alimentos",
	"indicaciones" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medicamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tomas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"medicamento_id" uuid NOT NULL,
	"horario_id" uuid,
	"programada_para" timestamp with time zone NOT NULL,
	"estado" "estado_toma" DEFAULT 'pendiente' NOT NULL,
	"registrada_en" timestamp with time zone,
	"pospuesta_hasta" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "tomas_medicamento_programada_unq" UNIQUE("medicamento_id","programada_para")
);
--> statement-breakpoint
ALTER TABLE "tomas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_medicamento_id_medicamentos_id_fk" FOREIGN KEY ("medicamento_id") REFERENCES "public"."medicamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tomas" ADD CONSTRAINT "tomas_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tomas" ADD CONSTRAINT "tomas_medicamento_id_medicamentos_id_fk" FOREIGN KEY ("medicamento_id") REFERENCES "public"."medicamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tomas" ADD CONSTRAINT "tomas_horario_id_horarios_id_fk" FOREIGN KEY ("horario_id") REFERENCES "public"."horarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "horarios_medicamento_idx" ON "horarios" USING btree ("medicamento_id");--> statement-breakpoint
CREATE INDEX "medicamentos_perfil_idx" ON "medicamentos" USING btree ("perfil_id");--> statement-breakpoint
CREATE INDEX "tomas_perfil_programada_idx" ON "tomas" USING btree ("perfil_id","programada_para");--> statement-breakpoint
CREATE POLICY "horarios_select_propio" ON "horarios" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "horarios"."perfil_id");--> statement-breakpoint
CREATE POLICY "horarios_create_propio" ON "horarios" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "horarios"."perfil_id");--> statement-breakpoint
CREATE POLICY "horarios_update_propio" ON "horarios" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "horarios"."perfil_id") WITH CHECK ((select auth.uid()) = "horarios"."perfil_id");--> statement-breakpoint
CREATE POLICY "medicamentos_select_propio" ON "medicamentos" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "medicamentos"."perfil_id");--> statement-breakpoint
CREATE POLICY "medicamentos_create_propio" ON "medicamentos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "medicamentos"."perfil_id");--> statement-breakpoint
CREATE POLICY "medicamentos_update_propio" ON "medicamentos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "medicamentos"."perfil_id") WITH CHECK ((select auth.uid()) = "medicamentos"."perfil_id");--> statement-breakpoint
CREATE POLICY "tomas_select_propio" ON "tomas" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "tomas"."perfil_id");--> statement-breakpoint
CREATE POLICY "tomas_create_propio" ON "tomas" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "tomas"."perfil_id");--> statement-breakpoint
CREATE POLICY "tomas_update_propio" ON "tomas" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "tomas"."perfil_id") WITH CHECK ((select auth.uid()) = "tomas"."perfil_id");