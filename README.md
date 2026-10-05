# Smart Canteen Full-Stack Project

A campus canteen ordering system built with Node.js, Express, PostgreSQL, and a preserved static frontend. The project keeps the original visual design and user flow while replacing the V1 demo logic with real backend validation, order creation, payment simulation, and admin status updates.

## Features

- Student registration and login
- JWT-based auth
- Menu loading from PostgreSQL
- Client-side cart preserved from the original app
- Server-side order creation with GST and token generation
- Simulated payment endpoint
- Student order history and order tracking
- Admin dashboard with live order stats and status transitions
- Secure API routes and role-based authorization

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: bcryptjs + JWT
- DB client: pg

## Folder Structure

```text
smart-canteen/
├── canteenapp/
│   ├── index.html
│   ├── menu.html
│   ├── cart.html
│   ├── payment.html
│   ├── success.html
│   ├── auth.html
│   ├── admin.html
│   ├── style.css
│   ├── menu.js
│   ├── cart.js
│   ├── payment.js
│   ├── success.js
│   ├── script.js
│   ├── api.js
│   ├── auth.js
│   ├── admin.js
│   └── admin.css
├── server/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── .env
```

## Database Schema

### users
- id
- name
- email
- password_hash
- role
- student_id
- created_at
- updated_at

### menu_items
- id
- name
- description
- price
- category
- image
- is_available
- created_at
- updated_at

### orders
- id
- token_number
- user_id
- subtotal
- gst
- total_amount
- payment_status
- order_status
- created_at
- updated_at

### order_items
- id
- order_id
- menu_item_id
- quantity
- unit_price
- subtotal

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

### Menu
- GET /api/menu
- GET /api/menu/:id
- POST /api/menu (admin)
- PUT /api/menu/:id (admin)
- DELETE /api/menu/:id (admin)
- PATCH /api/menu/:id/availability (admin)

### Orders
- POST /api/orders
- GET /api/orders
- GET /api/orders/:id
- POST /api/orders/:id/pay

### Admin
- GET /api/admin/orders
- GET /api/admin/orders/:id
- PATCH /api/admin/orders/:id/status
- GET /api/admin/stats

### Health
- GET /api/health

## Environment Variables

Create a .env file in the project root using .env.example as the template.

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_canteen
JWT_SECRET=replace_with_a_secure_random_string
JWT_EXPIRES_IN=7d
GST_RATE=0.05
TOKEN_PREFIX=A
AVERAGE_PREP_TIME_MINUTES=4
```

## Installation

1. Install PostgreSQL locally.
2. Create a database named smart_canteen.
3. Copy .env.example to .env and set your values.
4. Run the schema and seed files.
5. Install dependencies with npm install.
6. Start the server with npm start or npm run dev.

## Local Database Setup

```bash
createdb smart_canteen
psql -d smart_canteen -f server/db/schema.sql
psql -d smart_canteen -f server/db/seed.sql
```

If psql is not installed or available on PATH, install the PostgreSQL client tools and retry.

## Run Project

```bash
npm install
npm run dev
```

Then open:
- http://localhost:3000/
- http://localhost:3000/auth.html
- http://localhost:3000/admin.html

## Development Credentials

Student:
- Register a new account in the app

Admin:
- Email: admin@smartcanteen.local
- Password: admin123

## Student Workflow

1. Open auth.html and register/login.
2. Browse the menu.
3. Add items to the cart.
4. Proceed to payment.
5. Pay using the simulated flow.
6. View the success page with token and total.
7. Review order history under the student order flow.

## Admin Workflow

1. Login with the admin account.
2. Open admin.html.
3. View pending incoming orders.
4. Use status buttons to move orders: PLACED → ACCEPTED → PREPARING → READY → COMPLETED.
5. Review totals and revenue for the day.

## Known Limitations

- Payment is simulated and not connected to a real UPI/card gateway.
- Auth is JWT-based, not cookie-based.
- Frontend is static HTML/JS and not a full SPA.
- Order status polling is not yet implemented on the frontend beyond the backend API route usage.

## Future Improvements

- Add polling or WebSockets for live order tracking.
- Add a real payment provider.
- Add password reset flows.
- Add menu image upload and richer admin management UI.
- Add order cancellation and history filters.

## Viva Notes

Important concepts to understand:

- The frontend keeps the same UI but data now comes from the database via API.
- The backend validates prices, quantities, and availability instead of trusting the browser.
- PostgreSQL stores persistent records and maintains relational integrity.
- JWT secures protected routes.
- The admin dashboard reads real database statistics.
- Token generation is server-side and unique for each order.
