# Inventory Module Implementation

## Overview
Complete Inventory domain module implemented in NestJS using Prisma and PostgreSQL, integrated with existing Catalog entities.

## What Was Implemented

### 1. Database Models (Prisma Schema)
- `InventoryItem` model with:
  - Product and variant relationships
  - Quantity tracking (quantity, reservedQuantity, availableQuantity)
  - Low stock threshold
  - Unique constraint on (productId, variantId, warehouseId)
  
- `InventoryReservation` model with:
  - Reference tracking (cart, order)
  - Expiration support
  - Proper indexing

### 2. Module Structure
```
src/inventory/
 ├─ inventory.module.ts
 ├─ controllers/
 │   ├─ admin-inventory.controller.ts
 │   └─ inventory.controller.ts
 ├─ services/
 │   ├─ inventory.service.ts
 │   └─ reservation.service.ts
 ├─ dto/
 │   ├─ adjust-stock.dto.ts
 │   ├─ reserve-stock.dto.ts
 │   ├─ release-stock.dto.ts
 │   └─ consume-stock.dto.ts
 └─ events/
     ├─ inventory.events.ts
     └─ inventory.handlers.ts
```

### 3. Admin APIs
- `POST /admin/inventory/adjust` - Adjust stock quantities

### 4. Internal APIs
- `POST /inventory/reserve` - Reserve stock for cart/order
- `POST /inventory/release` - Release stock reservation
- `POST /inventory/consume` - Consume stock (convert reservation to final reduction)

### 5. Event Integration
- **Emitted Events:**
  - `stock.reserved`
  - `stock.released`
  - `stock.consumed`
  - `stock.adjusted`

- **Event Handlers:**
  - Listens to `cart.expired` → releases reservations
  - Listens to `order.created` → consumes stock

### 6. Business Rules Implemented
- ✅ Stock tracked per variant
- ✅ Race condition prevention using Prisma transactions
- ✅ Overselling prevention (checks available quantity)
- ✅ Database transactions for all stock operations
- ✅ Reservation auto-expiration support
- ✅ Consistent stock availability calculations

## Next Steps

### 1. Install Required Package
```bash
npm install @nestjs/event-emitter
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Create Database Migration
```bash
npx prisma migrate dev --name add_inventory_models
```

### 4. Optional: Database Generated Column
The `available_quantity` field is currently maintained by the application. For optimal performance, you may want to create a database migration to make it a generated column:

```sql
ALTER TABLE inventory_items 
DROP COLUMN available_quantity;

ALTER TABLE inventory_items 
ADD COLUMN available_quantity INTEGER 
GENERATED ALWAYS AS (quantity - reserved_quantity) STORED;
```

If you do this, you'll need to remove `availableQuantity` updates from the application code and let the database handle it.

### 5. Configure Warehouse ID
Currently, the reservation service uses a hardcoded `'default-warehouse'`. In production, you should:
- Add warehouse management
- Get warehouse ID from request context or configuration
- Support multi-warehouse inventory

## How to maintain stock (simple vs variant products)

The storefront and cart use **one warehouse**: `default-warehouse`. Stock you add must be in this warehouse for products to show as in stock.

### Simple products (no variants)
- **variantId** in all inventory APIs = **product id** (the product’s UUID).
- There is no row in `product_variants` for a simple product; inventory is stored with `(productId, variantId: null, warehouseId)`.
- **To add stock:** `POST /admin/inventory/adjust` with `variantId: "<product-id>"`. You can omit `warehouseId`; it defaults to `default-warehouse`.
- **To check stock:** `GET /admin/inventory/status?variantId=<product-id>` (optional `warehouseId`, defaults to `default-warehouse`).

### Configurable products (with variants)
- **variantId** = the **variant’s UUID** (from `product_variants.id`), not the product id.
- **To add stock:** `POST /admin/inventory/adjust` with `variantId: "<variant-id>"`. Omit `warehouseId` or set to `default-warehouse`.
- **To check stock:** `GET /admin/inventory/status?variantId=<variant-id>`.

### If products still show “out of stock”
1. Confirm you used **product id** for simple products and **variant id** for configurable products.
2. Use **warehouseId `default-warehouse`** (or omit it so it defaults). Any other warehouse id is not used by the storefront.
3. Call `GET /admin/inventory/status?variantId=<id>` to see `quantity`, `availableQuantity`, and `warehouseId` for that id.

## Usage Examples

### Adjust Stock (Admin)
`warehouseId` is optional; when omitted it defaults to `default-warehouse` (used by the storefront).
```bash
POST /admin/inventory/adjust
{
  "variantId": "<product-id-for-simple-or-variant-id-for-configurable>",
  "quantity": 100,
  "reason": "Initial stock"
}
# Optional: "warehouseId": "default-warehouse"
```

### Check inventory status (Admin)
```bash
GET /admin/inventory/status?variantId=<product-id-or-variant-id>
# Optional: &warehouseId=default-warehouse
```

### Reserve Stock (Cart)
```bash
POST /inventory/reserve
{
  "variantId": "uuid",
  "quantity": 2,
  "referenceType": "cart",
  "referenceId": "cart-uuid",
  "expiresInMinutes": 15
}
```

### Release Stock
```bash
POST /inventory/release
{
  "reservationId": "uuid"
}
// OR
{
  "referenceType": "cart",
  "referenceId": "cart-uuid"
}
```

### Consume Stock (Order Placed)
```bash
POST /inventory/consume
{
  "reservationId": "uuid"
}
```

## Notes

- All operations use database transactions to ensure consistency
- Stock availability is checked before reservations
- Reservations expire after 15 minutes by default
- Event handlers automatically clean up expired cart reservations
- Order creation automatically consumes reserved stock

