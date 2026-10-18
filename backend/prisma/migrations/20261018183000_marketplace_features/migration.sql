BEGIN;

-- Match legacy ownerless orders to an existing account by customer email.
-- Stop before tightening the constraint if any order still has no owner.
UPDATE "Order" AS orders
SET "userId" = users.id
FROM "User" AS users
WHERE orders."userId" IS NULL
  AND LOWER(orders."customerEmail") = LOWER(users.email);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Order" WHERE "userId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot require Order.userId: ownerless orders remain. Run npm run db:backfill:order-owners and retry.';
  END IF;
END $$;

ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

ALTER TABLE "Product" ADD COLUMN "upc" TEXT;
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order"
  ADD COLUMN "paymentProvider" TEXT,
  ADD COLUMN "paymentReference" TEXT,
  ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'authorized',
  ALTER COLUMN "userId" SET NOT NULL;

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "title" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_upc_key" ON "Product"("upc");
CREATE UNIQUE INDEX "Order_paymentReference_key" ON "Order"("paymentReference");
CREATE INDEX "Review_productId_createdAt_idx" ON "Review"("productId", "createdAt");
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Review_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Review_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
