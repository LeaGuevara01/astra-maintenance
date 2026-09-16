CREATE TABLE "DocumentAnalysisRun" (
 "id" TEXT PRIMARY KEY,
 "revisionId" TEXT NOT NULL REFERENCES "DocumentRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "analyzerId" TEXT NOT NULL,
 "analyzerVersion" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'COMPLETED',
 "summary" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "DocumentAnalysisRun_revisionId_analyzerId_analyzerVersion_key" UNIQUE ("revisionId","analyzerId","analyzerVersion")
);
CREATE INDEX "DocumentAnalysisRun_createdAt_id_idx" ON "DocumentAnalysisRun"("createdAt","id");

CREATE TABLE "DocumentFinding" (
 "id" TEXT PRIMARY KEY,
 "runId" TEXT NOT NULL REFERENCES "DocumentAnalysisRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "kind" TEXT NOT NULL,
 "code" TEXT NOT NULL,
 "name" TEXT NOT NULL,
 "partNumber" TEXT NOT NULL DEFAULT 'A_CONFIRMAR',
 "unit" TEXT NOT NULL DEFAULT 'u',
 "locator" TEXT NOT NULL,
 "applicability" TEXT NOT NULL,
 "confidence" TEXT NOT NULL,
 "reviewStatus" TEXT NOT NULL DEFAULT 'A_CONFIRMAR',
 "stockEffect" TEXT NOT NULL DEFAULT 'NONE',
 "evidence" JSONB NOT NULL,
 "warnings" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "DocumentFinding_reviewStatus_check" CHECK ("reviewStatus" IN ('A_CONFIRMAR','CREATE_CANDIDATE','REJECTED','OCR_REQUIRED','CONFLICT')),
 CONSTRAINT "DocumentFinding_stockEffect_check" CHECK ("stockEffect" = 'NONE')
);
CREATE INDEX "DocumentFinding_reviewStatus_createdAt_idx" ON "DocumentFinding"("reviewStatus","createdAt");
CREATE INDEX "DocumentFinding_createdAt_id_idx" ON "DocumentFinding"("createdAt","id");

CREATE TABLE "DocumentFindingReview" (
 "id" TEXT PRIMARY KEY,
 "findingId" TEXT NOT NULL REFERENCES "DocumentFinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "decision" TEXT NOT NULL CHECK ("decision" IN ('A_CONFIRMAR','CREATE_CANDIDATE','REJECTED','OCR_REQUIRED','CONFLICT')),
 "reason" TEXT NOT NULL,
 "actorId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "DocumentFindingReview_findingId_createdAt_idx" ON "DocumentFindingReview"("findingId","createdAt");

CREATE TRIGGER document_finding_review_immutable BEFORE UPDATE OR DELETE ON "DocumentFindingReview" FOR EACH ROW EXECUTE FUNCTION astra_document_immutable();
