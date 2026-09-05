-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "subtotal" REAL NOT NULL,
    "shippingCost" REAL NOT NULL,
    "total" REAL NOT NULL,
    "customerId" TEXT,
    "billingFirstName" TEXT NOT NULL,
    "billingLastName" TEXT NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "billingPhone" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "billingCity" TEXT NOT NULL,
    "billingCounty" TEXT NOT NULL,
    "billingZipCode" TEXT,
    "shippingFirstName" TEXT NOT NULL,
    "shippingLastName" TEXT NOT NULL,
    "shippingPhone" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "shippingCity" TEXT NOT NULL,
    "shippingCounty" TEXT NOT NULL,
    "shippingZipCode" TEXT,
    "netopiaOrderId" TEXT,
    "netopiaNtpId" TEXT,
    "netopiaStatus" INTEGER,
    "awbNumber" TEXT,
    "awbCost" REAL,
    "shippingStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "shippedAt" DATETIME,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "widthMeters" REAL,
    "heightCm" INTEGER,
    "tailoringType" TEXT,
    "tailoringCost" REAL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_netopiaOrderId_key" ON "Order"("netopiaOrderId");
