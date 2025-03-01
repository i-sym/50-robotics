ALTER TABLE "data_source_config" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "data_source_config" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "data_source_config" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "data_source_link_config" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "data_source_link_config" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "data_source_link_config" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "twin_scope_config" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "twin_scope_config" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "twin_scope_config" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "twin_component_config" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "twin_component_config" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "twin_component_config" ALTER COLUMN "name" SET DATA TYPE text;