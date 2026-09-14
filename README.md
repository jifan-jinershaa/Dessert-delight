# 🍰 Dessert Delight — Full-Stack Artisanal E-Commerce Platform

> A production-ready, full-stack dessert ordering web application designed with a warm, editorial European bakery aesthetic. Built using **Vanilla JavaScript (ES6+)**, **HTML5/CSS3**, **Node.js**, **Express.js**, and **MongoDB / Mongoose**.

---

## 🌟 Key Highlights & Portfolio Value

- **Clean Architectural Separation**: RESTful API backend built with Express and Mongoose, modular routes, and decoupled frontend.
- **Resilient Fallback Design**: Automatically connects to local or cloud MongoDB if available, but gracefully falls back to an in-memory repository if the database service is offline, preventing 500 errors during portfolio interviews or evaluator demos.
- **Editorial Brand Aesthetic**: Tailored color palette (`#F8F1E7` primary cream, `#4A2C20` dark cocoa, `#C9828D` muted rose), typography paired with *Playfair Display* and *DM Sans*, rounded cards, micro-interactions, and zero generic Bootstrap boilerplate.
- **End-to-End Shopping Flow**: Dynamic catalog, live search & category filtering, quick tasting notes modal, quantity steppers, cart persistence with `localStorage`, form validation, order creation with unique `DD` IDs, contact inquiries, and interactive 5-star customer feedback.

---

## 📁 Project Structure

```
dessert-delight/
│
├── index.html              # Homepage (Hero, Feature Strip, Brand Story, Popular Desserts)
├── desserts.html           # Menu Catalog (Live Search, Category Filters, Cards, Quick View)
├── cart.html               # Shopping Cart (Line items, Quantity stepper, Subtotal & Delivery)
├── order.html              # Checkout & Order Confirmation (Customer/Delivery/Payment, Success screen)
├── contact.html            # Contact Page & Inquiry Form
├── feedback.html           # Customer Reviews & 5-Star Feedback Form + Testimonials
│
├── css/
│   └── style.css           # Design tokens, variables, typography, layouts, animations & media queries
│
├── js/
│   └── script.js           # Cart engine (localStorage), API integration, toasts, modal & forms
│
├── data/
│   └── desserts.json       # 18 curated dessert items across 6 categories with INR (₹) pricing
│
├── config/
│   └── db.js               # MongoDB Mongoose connection with resilient fallback
│
├── models/
│   ├── Order.js            # Mongoose schema for Orders (DD... ID, customer, items, totals, status)
│   ├── Contact.js          # Mongoose schema for Contact inquiries
│   └── Feedback.js         # Mongoose schema for Customer reviews
│
├── routes/
│   ├── orderRoutes.js      # POST /api/orders, GET /api/orders/:id
│   ├── contactRoutes.js    # POST /api/contact
│   └── feedbackRoutes.js   # POST /api/feedback, GET /api/feedback
│
├── server.js               # Express application entrypoint, static server, and error handling
├── package.json            # Node.js project manifest & scripts
├── .env                    # Environment variables (PORT, MONGODB_URI)
├── .gitignore              # Git ignored files (node_modules, .env)
└── README.md               # Complete documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (installed with Node)
- *(Optional)* [MongoDB Community Server](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### 1. Installation

Clone or download the project into your local directory:

```bash
cd dessert-delight
npm install
```

### 2. Environment Configuration

The application includes a pre-configured `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dessert_delight
NODE_ENV=development
```

- **Local MongoDB**: If MongoDB is installed locally, make sure the service is running (`mongod` or via Windows Services).
- **MongoDB Atlas (Cloud)**: Replace `MONGODB_URI` with your connection string:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dessert_delight?retryWrites=true&w=majority
  ```
- **Demo Mode**: If no MongoDB server is running, the server automatically switches to an in-memory repository so you can test all features seamlessly without error.

### 3. Launch the Application

To start the server:

```bash
npm start
```

Or for development with automatic reload:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5000
```

---

## 📡 REST API Documentation

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/health` | Server health check | `200 OK` |
| `GET` | `/desserts` | Fetch all desserts (supports `?category=` & `?search=`) | `200 OK`, `500` |
| `POST` | `/orders` | Place a new dessert order | `201 Created`, `400`, `500` |
| `GET` | `/orders/:id` | Fetch order details by order ID (`DD...`) | `200 OK`, `404`, `500` |
| `POST` | `/contact` | Submit a contact or catering inquiry | `201 Created`, `400`, `500` |
| `GET` | `/feedback` | Retrieve approved patron reviews | `200 OK`, `500` |
| `POST` | `/feedback` | Submit a new customer review (1–5 stars) | `201 Created`, `400`, `500` |

### Sample Payloads

#### `POST /api/orders`
```json
{
  "customer": {
    "name": "Aarav Sharma",
    "phone": "9876543210",
    "email": "aarav@example.com"
  },
  "address": "42 Rosewood Lane, Flat 302",
  "city": "Bengaluru",
  "paymentMethod": "UPI",
  "items": [
    {
      "name": "Belgian Chocolate Truffle Cake",
      "price": 380,
      "quantity": 1,
      "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587"
    }
  ],
  "subtotal": 380,
  "delivery": 40,
  "total": 420
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Order placed successfully!",
  "order": {
    "orderId": "DD1726248123456",
    "status": "Pending",
    "total": 420,
    "createdAt": "2026-09-13T11:05:00.000Z"
  }
}
```

---

## 🎨 Design Philosophy & Color System

| Token | Hex Value | Role |
|---|---|---|
| Primary Background | `#F8F1E7` | Warm, welcoming editorial cream background |
| Secondary Cream | `#EFE3D3` | Section dividers, badges, cards accents |
| Dark Brown | `#4A2C20` | Primary typography, high-emphasis buttons |
| Medium Brown | `#765548` | Secondary labels, subtle outlines |
| Muted Rose | `#C9828D` | Accent color, active highlights, badges |
| Soft Rose | `#F3D9DC` | Gentle background tint, star rating backdrops |
| Pure White | `#FFFFFF` | Card surfaces, container cards |
| Deep Text | `#2F2420` | High-legibility body content |

---

## 🚢 GitHub & Deployment Instructions

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: complete production-ready Dessert Delight full-stack platform"
git branch -M main
git remote add origin https://github.com/your-username/dessert-delight.git
git push -u origin main
```

### 2. Deploy on Render / Railway
1. Sign in to [Render](https://render.com) or [Railway](https://railway.app).
2. Create a new **Web Service** and link your GitHub repository.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add Environment Variables:
   - `PORT`: `5000` (or leave default assigned by platform)
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `NODE_ENV`: `production`

---

## 💼 Placement Portfolio Notes

When discussing this project in an engineering interview:
1. **Frontend Architecture**: Built using clean, vanilla JavaScript to demonstrate core DOM manipulation, asynchronous fetching, event delegation, and state persistence via Web Storage APIs.
2. **Backend Architecture**: RESTful API design using Express, modular routing, input validation middleware, Mongoose schema modeling, and robust error handling.
3. **Product-Thinking & UX**: Emphasis on feedback loops (custom toasts, quantity steppers, live search debounce, quick modal views, empty and success states).
