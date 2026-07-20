# 🌱 Fresee Backend API

Fresee Backend API is a RESTful backend service developed for the **Fresee** mobile application. This project was built as part of the Bangkit Academy Capstone Project and later continued as an undergraduate thesis focusing on cloud-based backend integration using **Google Cloud Platform (GCP)**.

Fresee aims to help farmers market fresh agricultural products directly to buyers while integrating Machine Learning services for product freshness detection.

---

## 🚀 Features

### Authentication
- Register
- Login
- JWT Authentication
- Role-based Authorization (Farmer & Buyer)

### Farmer
- Manage Profile
- Create Product
- Update Product
- Delete Product (Soft Delete)
- View Own Products
- Manage Customer Transactions
- Upload Shipping Receipt (Invoice)

### Buyer
- Manage Profile
- Browse Products
- Search & Filter Products
- Product Detail
- Shopping Cart
- Checkout Selected Cart
- Transaction History
- Payment Integration (Midtrans)

### Product
- CRUD Product
- Soft Delete
- Search Product
- Filter by Category
- Filter by Price

### Cart
- Add to Cart
- Update Quantity
- Select / Unselect Item
- Remove Item

### Transaction
- Single Product Checkout
- Multiple Checkout
- Transaction History
- Transaction Detail
- Payment Callback
- Shipping Status Update

### Cloud Storage
- Product Image Upload
- Invoice Upload
- Google Cloud Storage Integration

---

# 🛠 Tech Stack

Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

Authentication

- JSON Web Token (JWT)
- bcrypt

Cloud

- Google Compute Engine
- Google Cloud Storage
- Google Cloud SQL (PostgreSQL)

Payment

- Midtrans Snap API

Database ORM

- Prisma ORM

File Upload

- Multer
- Google Cloud Storage

---

# 📂 Project Structure

```
src
│
├── config
├── controller
├── middleware
├── routes
├── service
├── utils
├── error
├── generated
└── index.js

prisma
│
├── schema.prisma
└── migrations
```

---

# ⚙️ Installation

Clone repository

```bash
git clone https://github.com/your-username/fresee-backend.git

cd fresee-backend
```

Install dependency

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run Migration

```bash
npx prisma migrate deploy
```

Start Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 🔑 Environment Variables

Create `.env`

```env
DATABASE_URL=

JWT_SECRET=

PORT=3000

BASE_URL_MIDTRANS=

MIDTRANS_SERVER_KEY=

GOOGLE_CLOUD_PROJECT=

GOOGLE_CLOUD_BUCKET=

GOOGLE_APPLICATION_CREDENTIALS=
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /auth/register |
| POST | /auth/login |

---

## Product

| Method | Endpoint |
|---------|----------|
| GET | /products |
| GET | /products/filter |
| GET | /products/:id |
| POST | /products |
| PUT | /products/:id |
| DELETE | /products/:id |
| GET | /products/my |

---

## Profile

| Method | Endpoint |
|---------|----------|
| GET | /profile |
| PUT | /profile |

---

## Cart

| Method | Endpoint |
|---------|----------|
| GET | /cart |
| POST | /cart |
| PUT | /cart/:id |
| DELETE | /cart/:id |
| PUT | /cart/select |

---

## Transaction

| Method | Endpoint |
|---------|----------|
| POST | /transaction |
| POST | /transaction/cart |
| GET | /transaction/history |
| GET | /transaction/history/:id |
| PUT | /transaction/status |
| GET | /transaction/pay/:transactionId |
| GET | /transaction/callback |

---

# 🔍 Search & Filter

Example

```
GET /products/filter?search=tomat

GET /products/filter?category=Sayuran

GET /products/filter?minPrice=10000&maxPrice=50000

GET /products/filter?search=tomat&category=Sayuran&minPrice=10000&maxPrice=50000
```

---

# 🔐 Authentication

Protected endpoints require JWT Bearer Token.

```
Authorization: Bearer <access_token>
```

---

# ☁️ Deployment

This project is deployed using Google Cloud Platform.

Services used:

- Google Compute Engine
- Google Cloud SQL (PostgreSQL)
- Google Cloud Storage

---

# 📱 Mobile Application

The backend is designed specifically for the **Fresee Mobile Application**, enabling communication between the mobile client, cloud infrastructure, and Machine Learning service.

---

# 📖 Documentation

API testing and documentation are available through:

- Postman Collection

---

# 📜 License

This project was developed for educational purposes as part of:

- Bangkit Academy Capstone Project
- Undergraduate Thesis (Universitas Teknologi Bandung)

---

# 👨‍💻 Developer

**Fadlan Naufal**

Backend Developer

Cloud Computing

Universitas Teknologi Bandung

---

⭐ If you find this project useful, don't forget to give it a star!
