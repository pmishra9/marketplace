ALTER TABLE "Order"
ADD COLUMN "subscriptionId" TEXT,
ADD COLUMN "billingPeriod" TEXT;

CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_subscriptionId_billingPeriod_idx" ON "Order"("subscriptionId", "billingPeriod");

CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "initialOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "interval" TEXT NOT NULL DEFAULT 'month',
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "items" JSONB NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "nextBillingAt" TIMESTAMP(3),
    "billingAttempt" INTEGER NOT NULL DEFAULT 0,
    "lastPaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_initialOrderId_key" ON "Subscription"("initialOrderId");
CREATE INDEX "Subscription_status_nextBillingAt_idx" ON "Subscription"("status", "nextBillingAt");
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

ALTER TABLE "Order" ADD CONSTRAINT "Order_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
