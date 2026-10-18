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
Submits customer orders from the cart.

- **Method**: `POST`
- **Path**: `/api/orders`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "items": [
      { "productId": "prod-001", "quantity": 1, "price": 299.99 }
    ],
    "totalAmount": 299.99
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "Order created successfully; receipt generated locally (email delivery is not configured)",
    "data": {
      "id": "ORD-7812",
      "customerName": "Jane Doe",
      "customerEmail": "jane@example.com",
      "items": [...],
      "totalAmount": 299.99,
      "status": "confirmed",
      "receiptEmailed": false,
      "createdAt": "2026-10-18T16:30:00.000Z"
    }
  }
  ```

---

### 7. List Orders
Retrieves existing orders.

- **Method**: `GET`
- **Path**: `/api/orders`
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

---

### 10. Saved Payment Methods
Retrieves and saves customer payment methods.

- **Method**: `GET` / `POST`
- **Path**: `/api/auth/users/:userId/payments`

The current order controller writes a formatted receipt to the backend log. It does not send email, and `receiptEmailed` remains `false` until an email provider is integrated.

