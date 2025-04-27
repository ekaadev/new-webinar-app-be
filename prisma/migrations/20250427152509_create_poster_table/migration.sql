-- CreateTable
CREATE TABLE "posters" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "posters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posters_event_id_key" ON "posters"("event_id");

-- AddForeignKey
ALTER TABLE "posters" ADD CONSTRAINT "posters_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
