CREATE TABLE "contactosemergencia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"relacion" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contactosemergencia" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contactosemergencia" ADD CONSTRAINT "contactosemergencia_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "contactosemergencia_select_propio" ON "contactosemergencia" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "contactosemergencia"."perfil_id");--> statement-breakpoint
CREATE POLICY "contactosemergencia_create_propio" ON "contactosemergencia" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "contactosemergencia"."perfil_id");--> statement-breakpoint
CREATE POLICY "contactosemergencia_update_propio" ON "contactosemergencia" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "contactosemergencia"."perfil_id") WITH CHECK ((select auth.uid()) = "contactosemergencia"."perfil_id");