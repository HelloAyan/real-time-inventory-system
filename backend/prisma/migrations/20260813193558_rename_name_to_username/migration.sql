-- RenameColumn
ALTER TABLE "User" RENAME COLUMN "name" TO "username";

-- RenameIndex
ALTER INDEX "User_name_key" RENAME TO "User_username_key";
