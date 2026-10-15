CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
	"title" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"genre" text NOT NULL,
	"rating" integer NOT NULL,
	"cover_url" text NOT NULL,
	"cover_color" varchar(7) NOT NULL,
	"description" text NOT NULL,
	"total_copies" integer DEFAULT 1 NOT NULL,
	"available_copies" integer DEFAULT 0 NOT NULL,
	"video_url" varchar NOT NULL,
	"summary" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
