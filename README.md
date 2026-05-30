# Expense Tracker

This is a small full-stack expense tracker built with React, Express and MySQL. The main backend work is split into routes, controllers, services and repositories so request handling, business rules and SQL queries stay separate.

## Stack

- Frontend: React
- Backend: Node.js, Express
- Database: MySQL 8
- Infrastructure: Docker Compose

## Running the Project

```powershell
docker compose up -d --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- MySQL: `localhost:3307`

The API is mapped to `5001` on the host because port `5000` was already busy on my machine. Inside Docker the backend still listens on `5000`.

To stop everything:

```powershell
docker compose down
```

## Auth Flow

You can create a user from the API:

```http
POST /api/auth/register
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "password123"
}
```

Then login:

```http
POST /api/auth/login
{
  "email": "demo@example.com",
  "password": "password123"
}
```

Use the returned token as:

```http
Authorization: Bearer <token>
```

## Database

The database is initialized from `db/init.sql` on first container startup.

- `users` keeps the account data and hashed password.
- `categories` has both seeded categories and user-created categories.
- `transactions` stores income and expense rows. Each row belongs to one user and one category.

Important indexes:

- `transactions(user_id, transaction_date)`
- `transactions(user_id, category_id)`
- `transactions(user_id, type, transaction_date)`

The monthly summary API uses SQL joins and grouping instead of pulling all transactions into Node and calculating totals there.

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Categories:

- `GET /api/categories`
- `GET /api/categories?type=expense`
- `POST /api/categories`

Transactions:

- `GET /api/transactions?page=1&limit=10&type=expense&categoryId=4&startDate=2026-05-01&endDate=2026-05-31`
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

Summary:

- `GET /api/summary/dashboard`
- `GET /api/summary/monthly-by-category?year=2026&month=5`

## Example Transaction Payload

```json
{
  "type": "expense",
  "amount": 1200,
  "categoryId": 4,
  "transactionDate": "2026-05-02",
  "description": "Groceries"
}
```

## Notes

- Passwords are hashed with bcrypt.
- JWT is used for private routes.
- Helmet and rate limiting are enabled globally.
- Errors are passed through centralized error middleware.
- Transaction filters are handled in SQL, with pagination support.
