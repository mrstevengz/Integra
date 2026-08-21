CREATE TYPE "public"."tipo_resultado" AS ENUM('asistida', 'no asistida', 'cancelada');--> statement-breakpoint
ALTER TABLE "citas_resultado" RENAME COLUMN "asistido" TO "tipo_resultado";--> statement-breakpoint
ALTER TABLE "citas_resultado" ADD COLUMN "nota_cancelacion" text;--> statement-breakpoint
ALTER TABLE "citas" DROP COLUMN "cancelada";