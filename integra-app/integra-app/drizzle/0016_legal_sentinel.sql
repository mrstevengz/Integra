DROP POLICY "horarios_select_propio" ON "horarios" CASCADE;--> statement-breakpoint
DROP POLICY "horarios_create_propio" ON "horarios" CASCADE;--> statement-breakpoint
DROP POLICY "horarios_update_propio" ON "horarios" CASCADE;--> statement-breakpoint
DROP TABLE "horarios" CASCADE;--> statement-breakpoint
ALTER TABLE "medicamentos" ADD COLUMN "horarios" jsonb DEFAULT '[]'::jsonb NOT NULL;