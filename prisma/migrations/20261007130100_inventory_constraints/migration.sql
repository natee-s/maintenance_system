ALTER TABLE "Part" ADD CONSTRAINT "part_nonnegative_levels" CHECK ("minStock">=0 AND "reorderPoint">=0 AND ("unitCostReference" IS NULL OR "unitCostReference">=0));
ALTER TABLE "StockBalance" ADD CONSTRAINT "stock_nonnegative" CHECK ("onHandQty">=0 AND "reservedQty">=0 AND "reservedQty"<="onHandQty");
ALTER TABLE "StockTransaction" ADD CONSTRAINT "stock_positive_quantity" CHECK (quantity>0);
ALTER TABLE "StockTransaction" ADD CONSTRAINT "stock_adjustment_reason" CHECK (type NOT IN ('ADJUST_IN','ADJUST_OUT') OR length(trim(reason))>0 AND reason IS NOT NULL);
ALTER TABLE "StockTransaction" ADD CONSTRAINT "stock_work_reference" CHECK (type NOT IN ('ISSUE','RETURN') OR "workOrderId" IS NOT NULL);
CREATE UNIQUE INDEX "stock_initial_once" ON "StockTransaction"("partId","warehouseId") WHERE type='INITIAL';

CREATE FUNCTION reject_stock_ledger_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Stock ledger is immutable; post a reversing/adjustment transaction'; END;
$$;
CREATE TRIGGER stock_ledger_immutable BEFORE UPDATE OR DELETE ON "StockTransaction" FOR EACH ROW EXECUTE FUNCTION reject_stock_ledger_mutation();

CREATE FUNCTION guard_stock_balance() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' AND NEW."onHandQty"<>0 THEN RAISE EXCEPTION 'Opening stock requires a ledger transaction'; END IF;
 IF TG_OP='UPDATE' AND NEW."onHandQty"<>OLD."onHandQty" AND pg_trigger_depth()<=1 THEN RAISE EXCEPTION 'On-hand changes require a ledger transaction'; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER stock_balance_guard BEFORE INSERT OR UPDATE ON "StockBalance" FOR EACH ROW EXECUTE FUNCTION guard_stock_balance();

CREATE FUNCTION post_stock_balance() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 UPDATE "StockBalance" SET "onHandQty"="onHandQty" + CASE WHEN NEW.type IN ('ISSUE','ADJUST_OUT') THEN -NEW.quantity ELSE NEW.quantity END,"updatedAt"=CURRENT_TIMESTAMP WHERE "partId"=NEW."partId" AND "warehouseId"=NEW."warehouseId";
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock balance must be initialized before ledger posting'; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER stock_ledger_post AFTER INSERT ON "StockTransaction" FOR EACH ROW EXECUTE FUNCTION post_stock_balance();
