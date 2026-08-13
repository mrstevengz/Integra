CREATE TABLE "tipomedicion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"unidad" text NOT NULL,
	"rango_min" numeric(8, 3) NOT NULL,
	"rango_max" numeric(8, 3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tipomedicion" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "tipomedicion_updated_at_idx" ON "tipomedicion" USING btree ("updated_at");--> statement-breakpoint
CREATE POLICY "tipomedicion_lectura_publica" ON "tipomedicion" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);