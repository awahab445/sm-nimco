# Postman API Collection

This folder contains a **Postman collection** for the Ecommerce Platform backend API.

## Import into Postman

1. Open Postman (desktop or web).
2. Click **Import** and choose:
   - **File**: `Ecommerce-Platform-API.postman_collection.json`
   - Or drag the file into the Import window.
3. The collection **Ecommerce Platform API** will appear in your sidebar.

## Configuration

- **Base URL**: The collection variable `baseUrl` defaults to `http://localhost:3000`. Change it in the collection variables if your API runs elsewhere (e.g. `http://localhost:4000`).
- **Path variables**: Set these as you get IDs from responses:
  - `cartId` – from **Cart → Create cart**
  - `checkoutId` – from **Checkout → Start checkout**
  - `orderId` – from **Checkout → Confirm checkout** or **Orders → Create order**
  - `productId` / `variantId` – from **Products** or **Admin - Products**
  - `promotionId` – from **Promotions → Create promotion**
  - `paymentId` – from **Payments** responses

You can set variables at collection level: click the collection → **Variables** tab.

## Suggested verification order

1. **App** – Root (sanity check).
2. **Tax** – Create tax class + tax (needed for checkout tax calculation).
3. **Admin - Customer groups** – Create default/wholesale group if needed.
4. **Admin - Shipping** – Create zone + method (needed for checkout shipping).
5. **Admin - Products** – Create product + variant (and optionally inventory via **Admin - Inventory**).
6. **Cart** – Create cart, add item (use productId/variantId from step 5).
7. **Checkout** – Start checkout → Update addresses → Update shipping → Confirm (use paymentMethodCode e.g. `cod`).
8. **Orders** – Get order by ID, list orders.
9. **Payments** – Get methods, get payment by order.
10. **Promotions** – Create promotion, validate.
11. Remaining **Admin** and **Customers** endpoints as needed.

## Notes

- Endpoints that require auth (e.g. **Customers → Get me**, **Orders → Get my orders**) will return 401 until you add authentication (e.g. Bearer token in collection or request headers).
- Replace placeholders like `<zone-uuid>`, `<tax-class-uuid>`, `<warehouse-uuid>` with real IDs from previous responses or from your database.
- For **Payment callback**, the body depends on the gateway; the sample is a placeholder.
