ALTER TABLE "franchise_units" ALTER COLUMN "entity_type" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "units" DROP COLUMN "franchisee_type";--> statement-breakpoint
DROP TYPE "public"."franchisee_type";