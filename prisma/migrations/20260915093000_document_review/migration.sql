CREATE TABLE "DocumentRevision" (
 "id" TEXT PRIMARY KEY, "sourceId" TEXT NOT NULL, "title" TEXT NOT NULL, "sha256" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "DocumentRevision_sourceId_sha256_key" UNIQUE ("sourceId","sha256")
);
CREATE TABLE "DocumentCandidate" (
 "id" TEXT PRIMARY KEY, "revisionId" TEXT NOT NULL REFERENCES "DocumentRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "code" TEXT NOT NULL, "name" TEXT NOT NULL, "partNumber" TEXT NOT NULL, "unit" TEXT NOT NULL,
 "locator" TEXT NOT NULL, "applicability" TEXT NOT NULL, "version" INTEGER NOT NULL DEFAULT 0 CHECK ("version" >= 0),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "DocumentCandidate_createdAt_id_idx" ON "DocumentCandidate"("createdAt","id");
CREATE TABLE "DocumentReview" (
 "id" TEXT PRIMARY KEY, "candidateId" TEXT NOT NULL REFERENCES "DocumentCandidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "version" INTEGER NOT NULL, "decision" TEXT NOT NULL CHECK ("decision" IN ('A_CONFIRMAR','VALIDADO','RECHAZADO')),
 "reason" TEXT NOT NULL, "actorId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "DocumentReview_candidateId_version_key" UNIQUE ("candidateId","version")
);
CREATE FUNCTION astra_document_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Document evidence is immutable'; END $$;
CREATE TRIGGER document_revision_immutable BEFORE UPDATE OR DELETE ON "DocumentRevision" FOR EACH ROW EXECUTE FUNCTION astra_document_immutable();
CREATE TRIGGER document_review_immutable BEFORE UPDATE OR DELETE ON "DocumentReview" FOR EACH ROW EXECUTE FUNCTION astra_document_immutable();
