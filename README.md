🍰 Dessert Delight — Full-Stack Artisanal E-Commerce Platform

A production-ready, full-stack dessert ordering web application designed with a warm, editorial European bakery aesthetic. Built using Vanilla JavaScript (ES6+), HTML5/CSS3, Node.js, Express.js, and MongoDB / Mongoose.

---

🌟 Key Highlights & Portfolio Value

Clean Architectural Separation

- RESTful API backend built with Express and Mongoose
- Modular routes
- Decoupled frontend and backend architecture

Production-ready Backend

- MongoDB-backed data persistence
- Server-side price calculation
- Rate limiting
- Environment-based configuration
- Development fallback support
- Deployment-ready backend architecture

Editorial Brand Aesthetic

- Warm cream-based color palette
- Dark cocoa typography
- Muted rose accents
- Playfair Display and DM Sans typography
- Rounded cards
- Micro-interactions
- Responsive layouts
- Custom bakery-inspired visual identity

End-to-End Shopping Flow

- Dynamic dessert catalog
- Live search
- Category filtering
- Quick tasting notes modal
- Quantity steppers
- Cart persistence using localStorage
- Form validation
- Order creation with unique DD IDs
- Contact inquiries
- Interactive 5-star customer feedback
- Order confirmation flow

---

📁 Project Structure

```text
dessert-delight/
│
├── index.html              # Homepage
├── desserts.html           # Menu Catalog
├── cart.html               # Shopping Cart
├── order.html              # Checkout & Order Confirmation
├── contact.html            # Contact Page & Inquiry Form
├── feedback.html           # Customer Reviews & Feedback
│
├── css/
│   └── style.css           # Design system, layouts and animations
│
├── js/
│   └── script.js           # Cart engine, API integration and forms
│
├── data/
│   └── desserts.json       # Dessert catalog and pricing
│
├── config/
│   └── db.js               # MongoDB Mongoose connection
│
├── models/
│   ├── Order.js            # Order schema
│   ├── Contact.js          # Contact inquiry schema
│   └── Feedback.js         # Customer feedback schema
│
├── routes/
│   ├── orderRoutes.js      # Order API routes
│   ├── contactRoutes.js    # Contact API routes
│   └── feedbackRoutes.js   # Feedback API routes
│
├── server.js               # Express application entry point
├── package.json            # Node.js project configuration
├── .gitignore              # Git ignored files
└── README.md               # Project documentation
```

---

🚀 Quick Start Guide

Prerequisites

- Node.js v16 or higher
- npm
- MongoDB Community Server or MongoDB Atlas

Installation

Clone or download the project into your local directory:

```bash
cd dessert-delight
npm install
```

Environment Configuration

Create or configure your .env file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dessert_delight
NODE_ENV=development
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dessert_delight?retryWrites=true&w=majority
```

If MongoDB is unavailable during local development, the application can use its development fallback repository where supported.

Launch the Application

Start the server:

```bash
npm start
```

Or run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5000
```

---

📡 REST API Documentation

Base URL:

```text
http://localhost:5000/api
```

| Method | Endpoint | Description | Status Codes |
| --- | --- | --- | --- |
| GET | /health | Server health check | 200 OK |
| GET | /desserts | Fetch desserts with category/search filters | 200 OK, 500 |
| POST | /orders | Place a new dessert order | 201 Created, 400, 500 |
| GET | /orders/:id | Fetch order details | 200 OK, 404, 500 |
| POST | /contact | Submit a contact inquiry | 201 Created, 400, 500 |
| GET | /feedback | Retrieve customer reviews | 200 OK, 500 |
| POST | /feedback | Submit customer feedback | 201 Created, 400, 500 |

Sample Order Request

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
      "quantity": 1
    }
  ],
  "subtotal": 380,
  "delivery": 40,
  "total": 420
}
```

Sample Response

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

🎨 Design Philosophy & Color System

| Token | Hex Value | Role |
| --- | --- | --- |
| Primary Background | #F8F1E7 | Warm editorial cream |
| Secondary Cream | #EFE3D3 | Sections, cards and accents |
| Dark Brown | #4A2C20 | Primary typography and buttons |
| Medium Brown | #765548 | Secondary labels |
| Muted Rose | #C9828D | Accent elements |
| Soft Rose | #F3D9DC | Background highlights |
| Pure White | #FFFFFF | Card surfaces |
| Deep Text | #2F2420 | Body text |

---

🚢 GitHub & Render Deployment

Push the project to GitHub:

```bash
git init
git add .
git commit -m "feat: complete Dessert Delight full-stack platform"
git branch -M main
git remote add origin https://github.com/your-username/dessert-delight.git
git push -u origin main
```

Render Deployment

Create a new Web Service on Render and connect the GitHub repository.

Build Command:

```text
npm install
```

Start Command:

```text
node server.js
```

Environment Variables:

```text
PORT
MONGODB_URI
NODE_ENV=production
```

For production deployment, use a MongoDB Atlas connection string for MONGODB_URI.

---

🌐 Live Demo

Render Deployment:

https://your-dessert-delight-app.onrender.com
