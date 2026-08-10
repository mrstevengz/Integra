CREATE TABLE "alergias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"tipo" text NOT NULL,
	"detalles" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alergias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "alergias" ADD CONSTRAINT "alergias_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "alergias_select_propio" ON "alergias" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "alergias"."perfil_id");--> statement-breakpoint
CREATE POLICY "alergias_create_propio" ON "alergias" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "alergias"."perfil_id");--> statement-breakpoint
CREATE POLICY "alergias_update_propio" ON "alergias" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "alergias"."perfil_id") WITH CHECK ((select auth.uid()) = "alergias"."perfil_id");