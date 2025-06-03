--5/19 create memo table

CREATE TABLE "public"."tbl_memo" (
  "uid" serial,
  "title" varchar(255) NOT NULL,
  "content" text,
  "image" text,
  "user_uid" varchar(255) NOT NULL,
  "created_at" timestamp(255) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("uid")
);

--5/20 create blacklisttoken table

CREATE TABLE "public"."blacklist_tokens" (
  "id" serial,
  "token" varchar(500),
  "blacklisted_on" timestamp(255) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

--5/23 Update user tabel
ALTER TABLE "public"."users" 
  ADD COLUMN "is_admin" int2 NOT NULL DEFAULT 0,
  ADD COLUMN "is_delete" int2 NOT NULL DEFAULT 0;
  
-- 6/2

CREATE TABLE "public"."user_token" (
  "uid" serial,
  "user_uid" varchar(255) NOT NULL,
  "token_uid" varchar(255),
  PRIMARY KEY ("uid")
)
;