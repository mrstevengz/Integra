CREATE TABLE "articulo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"categoria" text NOT NULL,
	"sintomas" text[] DEFAULT '{}'::text[] NOT NULL,
	"tratamientos" text[] DEFAULT '{}'::text[] NOT NULL,
	"cuidados" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articulo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "articulos_updated_at_idx" ON "articulo" USING btree ("updated_at");--> statement-breakpoint
CREATE POLICY "articulos_lectura_publica" ON "articulo" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);