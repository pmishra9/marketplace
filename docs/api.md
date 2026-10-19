# Backend REST API Reference

The backend runs an Express.js service on port `4000` (or `PORT` from `backend/.env`).

All endpoints return JSON responses with standard status codes.

---

## Base URL

```
http://localhost:4000
```

When running the React storefront (`market`), requests to `/api/*` are automatically proxied to `http://localhost:4000/api/*`.

---

## Endpoints

### 1. Health Check
Checks service availability.

- **Method**: `GET`
- **Path**: `/api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "marketplace-backend",
    "timestamp": "2026-10-18T16:24:19.743Z"
  }
  ```

---

### 2. Product Catalog
Retrieves the list of products with optional query parameters for search, categorization, and sorting.

- **Method**: `GET`
- **Path**: `/api/products`
- **Query Parameters**:
  - `q` *(string, optional)*: Filter by title, description, brand, or category keyword.
  - `category` *(string, optional)*: Filter by category ID (e.g. `audio`, `wearables`, `electronics`).
  - `brand` *(string, optional)*: Filter by exact brand name.
  - `discountOnly` *(boolean, optional)*: Set to `true` to return discounted products.
  - `sort` *(string, optional)*:
    - `price_asc`: Sort by lowest price first.
    - `price_desc`: Sort by highest price first.
    - `name_asc`: Sort by product name A to Z.
    - `rating`: Sort by highest customer rating first (API only; not shown in the storefront sort menu).
- **Example Request**:
  ```bash
  curl "http://localhost:4000/api/products?category=audio&sort=rating"
  ```
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "prod-001",
        "title": "Aura Pro Wireless ANC Headphones",
        "description": "Studio-grade acoustic sound with active noise cancellation...",
        "price": 299.99,
        "originalPrice": 349.99,
        "category": "audio",
        "rating": 4.9,
        "reviewsCount": 342,
        "stock": 24,
        "badge": "Best Seller",
        "image": "https://images.unsplash.com/...",
        "featured": true
      }
    ]
  }
  ```

---

### 3. Single Product Details
Fetches an individual product by its ID.

- **Method**: `GET`
- **Path**: `/api/products/:id`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": { "id": "prod-001", "title": "Aura Pro Wireless ANC Headphones", ... }
  }
  ```
- **Response (404)**:
  ```json
  {
    "success": false,
    "message": "Product with ID 'xyz' not found"
  }
  ```

---

### 4. Create Product
Creates a new product in the catalog.

- **Method**: `POST`
- **Path**: `/api/products`
- **Headers**: `Content-Type: application/json`
- Optional `upc`: 12-digit UPC-A with a valid check digit; spaces and hyphens are removed before storage.
- **Body**:
  ```json
  {
    "title": "Nova Mechanical Keycaps Set",
    "price": 49.99,
    "category": "accessories",
    "description": "PBT double-shot keycaps in retro colorway.",
    "stock": 100,
    "image": "https://images.unsplash.com/..."
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "data": { "id": "prod-5491", "title": "Nova Mechanical Keycaps Set", ... }
  }
  ```

---

### 5. Categories Taxonomy
Retrieves available marketplace categories.

- **Method**: `GET`
- **Path**: `/api/products/categories`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      { "id": "all", "name": "All Products", "icon": "Grid" },
      { "id": "electronics", "name": "Electronics", "icon": "Laptop" },
      { "id": "audio", "name": "Audio & Sound", "icon": "Headphones" },
      { "id": "wearables", "name": "Smart Wearables", "icon": "Watch" },
      { "id": "accessories", "name": "Accessories", "icon": "Sparkles" },
      { "id": "home", "name": "Smart Home", "icon": "Home" }
    ]
  }
  ```

---

### 6. Order Placement
Starts a Stripe-hosted payment session for the signed-in customer's cart. The backend loads product prices from the database; client-supplied prices and totals are ignored.

- **Method**: `POST`
- **Path**: `/api/orders/checkout-session`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT>` (required)
- Requires `STRIPE_SECRET_KEY` on the backend. The signed-in account supplies the customer name, email, and user ID.
- **Body**:
  ```json
  {
    "items": [
      { "productId": "prod-001", "variant": "Matte Obsidian", "quantity": 1, "discountSelected": true }
    ]
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "orderId": "ORD-<uuid>",
      "checkoutUrl": "https://checkout.stripe.com/..."
    }
  }
  ```

The order is saved with a pending status before redirecting to Stripe. Card details are collected by Stripe and are never sent to this API. Stripe webhook events confirm or fail the pending order. A completed checkout stores the collected shipping address on the order.

### Verify a Checkout Session
Retrieves the signed-in customer's order after Stripe redirects back to the storefront. The backend also checks Stripe directly, so the return page does not rely on a browser-supplied payment status.

- **Method**: `GET`
- **Path**: `/api/orders/checkout-session/:sessionId`
- **Authentication**: `Authorization: Bearer <JWT>` (required; the session must belong to the signed-in customer)
- **Response (200)**: `{ "success": true, "paymentStatus": "paid", "data": { "id": "ORD-...", "status": "confirmed", ... } }`
- **Response (202)**: Payment is still processing; no order data is returned yet.

---

### 7. List Orders
Retrieves existing orders.

- **Method**: `GET`
- **Path**: `/api/orders`
- **Authentication**: `Authorization: Bearer <JWT>` (required; only returns the signed-in customer's orders)
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [ ... ]
  }
  ```

---

### 8. Distinct Brands
Retrieves unique product brand names.

- **Method**: `GET`
- **Path**: `/api/products/brands`
- **Response**:
  ```json
  {
    "success": true,
    "data": ["Aura", "Titan", "Lumix", "Vertex", "Onyx", "Pulse"]
  }
  ```

---

### 9. Customer Authentication
Enables customer sign-up and sign-in during the checkout flow.

- **Method**: `POST`
- **Path**: `/api/auth/signup`
- **Body**: `{ "name": "Elena Rostova", "username": "elena", "email": "elena@example.com", "password": "pass" }`
- Usernames are unique, case-insensitive, and 3–32 letters, numbers, or underscores.

- **Method**: `POST`
- **Path**: `/api/auth/signin`
- **Body**: `{ "username": "elena", "password": "pass" }` (email is also accepted in the `username` field)

The development seed login is `rabi` / `rabi`. Passwords are stored as scrypt hashes.
Successful signup and signin responses include a seven-day JWT `token`. Send it in the `Authorization` header to use protected endpoints. `GET /api/auth/me` returns the current user, and `POST /api/auth/signout` invalidates that user's access tokens. The saved-payment read endpoint requires authentication and the `:userId` must match the signed-in user. Payment methods are saved only after a successful checkout authorization.

---

### 10. Product Reviews

- **Method**: `GET`
- **Path**: `/api/reviews/products/:productId`
- Publicly returns written reviews. When sent a valid bearer token, also returns whether the signed-in customer has purchased the product and may review it.

- **Method**: `POST`
- **Path**: `/api/reviews/products/:productId`
- **Headers**: `Authorization: Bearer <JWT>` and `Content-Type: application/json`
- **Body**: `{ "rating": 5, "title": "Great", "body": "A full review" }`
- Requires an eligible order for the product. Customers can post one review per product. Ratings are not aggregated into the product's summary rating.

---
### 11. Saved Payment Methods
Retrieves the signed-in customer's saved payment methods.

- **Method**: `GET`
- **Path**: `/api/auth/users/:userId/payments`

This endpoint returns legacy saved payment metadata. Stripe Checkout currently asks customers to enter payment details each time; the app does not receive or store card data. The backend writes a formatted receipt preview to its log. It does not send email, and `receiptEmailed` remains `false` until an email provider is integrated.

