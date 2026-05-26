---
example: nodejs
version: 0.1.0
---

# Domain Context

This file describes the application's domain model, business rules, and user workflows. It exists to help AI tools understand what this API does and why - reducing hallucination on domain-specific behavior and preventing suggestions that contradict business requirements.

---

> **Adapter note:** This file uses "ShopAPI" as a placeholder. Replace all domain content here with your actual API's domain model. The structure and format are what matters - not the example content.

---

## Application Overview

**ShopAPI** is a REST API backend for a multi-vendor e-commerce platform. Vendors list and manage products. Customers browse, order, and track purchases. The API is consumed by a web storefront and a mobile app. There is no server-side rendering - this is a pure API backend.

---

## Core Domain Model

### User

An authenticated person who can be a Customer, a Vendor, or both.

- Users have a single account but can hold multiple roles
- Role is stored as an enum on the User model: `customer | vendor | admin`
- Users cannot change their own role - only admins can promote/demote
- Email is unique and immutable after registration
- Passwords are hashed with bcrypt (cost factor 12) - never stored in plain text

```
User
├── id (UUID)
├── email (unique, immutable)
├── passwordHash
├── role (customer | vendor | admin)
├── profile (one-to-one)
└── createdAt / updatedAt
```

### Product

An item listed for sale by a Vendor.

- Products belong to exactly one Vendor (the owning User)
- Products have a status: `draft | published | archived`
- Only `published` products appear in customer-facing search and browse
- SKU is unique per Vendor - two Vendors can have the same SKU, but one Vendor cannot
- Stock is tracked as an integer on the Product. Stock cannot go below 0 - this is enforced at the service layer, not only at the database level
- Price is stored in minor currency units (cents) as an integer - never as a float

```
Product
├── id (UUID)
├── vendorId (User.id)
├── sku (unique per vendor)
├── name
├── description
├── priceInCents (integer, never float)
├── stock (integer, min 0)
├── status (draft | published | archived)
└── category (Category reference)
```

### Order

A purchase transaction initiated by a Customer.

- Orders are immutable after creation - line items cannot be added or removed
- Order status transitions: `pending → confirmed → shipped → delivered | cancelled`
- Cancellation is only allowed while status is `pending` or `confirmed`
- Stock is decremented when an order is `confirmed`, not when it is created
- If stock is insufficient at confirmation time, the order transitions to `failed`, not `confirmed`

```
Order
├── id (UUID)
├── customerId (User.id)
├── status (pending | confirmed | shipped | delivered | cancelled | failed)
├── lineItems (OrderLineItem[])
├── totalInCents (computed from line items at creation time, not recalculated)
└── createdAt
```

### OrderLineItem

The join entity between Order and Product. Captures the price at time of order.

- `priceInCents` is copied from the Product at order creation time - product price changes do not affect existing orders
- `quantity` must be ≥ 1

```
OrderLineItem
├── orderId
├── productId
├── quantity
└── priceInCents (snapshot - not a foreign key to current price)
```

---

## Business Rules

### Pricing
- All prices are integers (cents). Never use floats for money.
- Price comparisons and arithmetic must use integer math only.
- Display formatting (e.g., `$12.99`) happens at the API response layer, not in the database or service layer.

### Stock
- Stock decrements happen inside a Prisma transaction alongside order confirmation.
- If `product.stock < orderLineItem.quantity` at transaction time, the whole transaction rolls back and the order status is set to `failed`.
- Stock can only be incremented by the owning Vendor via `PATCH /products/:id`.

### Order Cancellation
- Customers can cancel their own orders while status is `pending` or `confirmed`.
- Vendors cannot cancel orders - they contact support.
- Admins can cancel any order at any status.
- Cancellation restores stock for all line items in the same transaction.

### Authentication and Authorization
- All routes except `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, and `GET /health` require a valid JWT.
- Vendors can only modify their own products - enforced in `ProductService`, not in middleware.
- Customers can only view their own orders - enforced in `OrderService`.
- Admin role bypasses ownership checks.

---

## User Roles and Permissions

| Action          | Customer                | Vendor   | Admin |
|-----------------|-------------------------|----------|-------|
| Browse products | ✓                       | ✓        | ✓     |
| Create product  | -                       | own only | ✓     |
| Update product  | -                       | own only | ✓     |
| Place order     | ✓                       | -        | ✓     |
| View own orders | ✓                       | -        | ✓     |
| Cancel order    | own (pending/confirmed) | -        | any   |
| Manage users    | -                       | -        | ✓     |

---

## API Conventions

- All IDs are UUIDs - never auto-increment integers in responses
- Timestamps are ISO 8601 strings in UTC
- Pagination uses offset-limit: `?page=1&limit=20` - default limit 20, max 100
- Filtering uses query params: `?status=published&category=electronics`
- Sorting uses `?sort=createdAt&order=desc`
- Soft deletes: products and users are archived, not deleted from the database
