CREATE TABLE "borrow_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"borrow_date" timestamp with time zone DEFAULT now() NOT NULL,
	"due_date" date NOT NULL,
	"return_date" date,
	"status" "borrow_status" DEFAULT 'BORROWED'::"borrow_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "borrow_records" ADD CONSTRAINT "borrow_records_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "borrow_records" ADD CONSTRAINT "borrow_records_book_id_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id");