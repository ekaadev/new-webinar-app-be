-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_templates_event_id_key" ON "certificate_templates"("event_id");

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
