-- AlterTable
ALTER TABLE "Post" ADD COLUMN "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_featuredOnHomepage_published_createdAt_idx" ON "Post"("featuredOnHomepage", "published", "createdAt");
