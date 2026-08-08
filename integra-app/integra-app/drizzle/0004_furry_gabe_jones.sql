ALTER TABLE "articulos" ALTER COLUMN "sintomas" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "articulos" ALTER COLUMN "sintomas" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "articulos" ALTER COLUMN "tratamientos" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "articulos" ALTER COLUMN "tratamientos" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "articulos" ALTER COLUMN "cuidados" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "articulos" ALTER COLUMN "cuidados" DROP DEFAULT;