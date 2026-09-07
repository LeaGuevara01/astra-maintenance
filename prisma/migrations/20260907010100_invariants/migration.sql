-- Database-level stock checks protect all writers, including future integrations.
ALTER TABLE "Part" ADD CONSTRAINT "part_nonnegative_stock" CHECK ("onHand" >= 0 AND reserved >= 0 AND reserved <= "onHand");
ALTER TABLE "OrderMaterial" ADD CONSTRAINT "material_nonnegative_quantities" CHECK ("quantityPlanned" > 0 AND "quantityReserved" >= 0 AND "quantityUsed" >= 0 AND "quantityUsed" + "quantityReserved" <= "quantityPlanned");
ALTER TABLE "StockMovement" ADD CONSTRAINT "movement_positive_quantity" CHECK (quantity > 0);
ALTER TABLE "PlanTask" ADD CONSTRAINT "task_valid_frequency" CHECK (frequency > 0 AND (quantity IS NULL OR quantity > 0));
ALTER TABLE "Asset" ADD CONSTRAINT "asset_meter_nonnegative" CHECK (meter >= 0);
ALTER TABLE "WorkOrder" ADD CONSTRAINT "order_valid_meters" CHECK ("targetMeter" > 0 AND "actualMeter" >= 0 AND "nextServiceMeter" > "targetMeter");
ALTER TABLE "WorkOrder" ADD CONSTRAINT "order_valid_status" CHECK (status IN ('OPEN', 'CLOSED') AND ((status = 'CLOSED') = ("closedAt" IS NOT NULL)));
ALTER TABLE "OrderTask" ADD CONSTRAINT "order_task_valid_status" CHECK (status IN ('PENDING', 'DONE', 'DEFERRED', 'NA'));
ALTER TABLE "Checkpoint" ADD CONSTRAINT "checkpoint_valid_result" CHECK (result IN ('PENDING', 'PASS', 'FAIL', 'NA') AND NOT (critical AND result = 'NA'));

-- Closing freezes the operational snapshot. Follow-up links are separate append-only records.
CREATE FUNCTION astra_guard_closed_order() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'CLOSED' THEN
    RAISE EXCEPTION 'Closed intervention history is immutable' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_closed_order BEFORE UPDATE OR DELETE ON "WorkOrder" FOR EACH ROW EXECUTE FUNCTION astra_guard_closed_order();

CREATE FUNCTION astra_guard_closed_child() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_id text;
BEGIN
  IF TG_OP = 'INSERT' THEN parent_id := NEW."orderId"; ELSE parent_id := OLD."orderId"; END IF;
  IF EXISTS (SELECT 1 FROM "WorkOrder" WHERE id = parent_id AND status = 'CLOSED') THEN
    RAISE EXCEPTION 'Closed intervention details are immutable' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW."orderId" <> OLD."orderId" THEN
    RAISE EXCEPTION 'An intervention detail cannot change its parent' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_closed_task BEFORE INSERT OR UPDATE OR DELETE ON "OrderTask" FOR EACH ROW EXECUTE FUNCTION astra_guard_closed_child();
CREATE TRIGGER guard_closed_material BEFORE INSERT OR UPDATE OR DELETE ON "OrderMaterial" FOR EACH ROW EXECUTE FUNCTION astra_guard_closed_child();
CREATE TRIGGER guard_closed_checkpoint BEFORE INSERT OR UPDATE OR DELETE ON "Checkpoint" FOR EACH ROW EXECUTE FUNCTION astra_guard_closed_child();

CREATE FUNCTION astra_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Trace records are append-only' USING ERRCODE = '23514';
END;
$$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON "Audit" FOR EACH ROW EXECUTE FUNCTION astra_append_only();
CREATE TRIGGER stock_movement_append_only BEFORE UPDATE OR DELETE ON "StockMovement" FOR EACH ROW EXECUTE FUNCTION astra_append_only();
CREATE TRIGGER deferred_link_append_only BEFORE UPDATE OR DELETE ON "DeferredLink" FOR EACH ROW EXECUTE FUNCTION astra_append_only();
CREATE TRIGGER reading_append_only BEFORE UPDATE OR DELETE ON "Reading" FOR EACH ROW EXECUTE FUNCTION astra_append_only();
