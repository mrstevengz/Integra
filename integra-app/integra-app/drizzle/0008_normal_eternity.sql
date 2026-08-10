CREATE TABLE "condiciones" (
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
ALTER TABLE "condiciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "condiciones" ADD CONSTRAINT "condiciones_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "condiciones_select_propio" ON "condiciones" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "condiciones"."perfil_id");--> statement-breakpoint
CREATE POLICY "condiciones_update_propio" ON "condiciones" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "condiciones"."perfil_id") WITH CHECK ((select auth.uid()) = "condiciones"."perfil_id");