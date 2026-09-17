-- CreateTable
CREATE TABLE "ItineraryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItineraryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration" TEXT NOT NULL,
    "priceFrom" TEXT,
    "description" TEXT NOT NULL,
    "itinerary" TEXT,
    "optionals" TEXT,
    "included" TEXT,
    "notIncluded" TEXT,
    "payment" TEXT,
    "departures" TEXT,
    "insurance" TEXT,
    "notes" TEXT,
    "hotels" JSONB NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItineraryToItineraryCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItineraryToItineraryCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryCategory_slug_key" ON "ItineraryCategory"("slug");

-- CreateIndex
CREATE INDEX "ItineraryCategory_order_idx" ON "ItineraryCategory"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_slug_key" ON "Itinerary"("slug");

-- CreateIndex
CREATE INDEX "Itinerary_published_createdAt_idx" ON "Itinerary"("published", "createdAt");

-- CreateIndex
CREATE INDEX "Itinerary_featuredOnHomepage_published_createdAt_idx" ON "Itinerary"("featuredOnHomepage", "published", "createdAt");

-- CreateIndex
CREATE INDEX "_ItineraryToItineraryCategory_B_index" ON "_ItineraryToItineraryCategory"("B");

-- AddForeignKey
ALTER TABLE "_ItineraryToItineraryCategory" ADD CONSTRAINT "_ItineraryToItineraryCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItineraryToItineraryCategory" ADD CONSTRAINT "_ItineraryToItineraryCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ItineraryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

