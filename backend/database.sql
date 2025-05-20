--5/19 create memo table

CREATE TABLE "public"."tbl_memo" (
  "uid" serial,
  "title" varchar(255) NOT NULL,
  "content" text,
  "image" text,
  "user_uid" varchar(255) NOT NULL,
  "created_at" timestamp(255) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("uid")
)
;