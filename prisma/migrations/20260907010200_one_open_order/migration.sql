-- A second open preventive order must not release an asset while an older order has a failed checkpoint.
CREATE UNIQUE INDEX "one_open_order_per_asset" ON "WorkOrder" ("assetId") WHERE status = 'OPEN';
