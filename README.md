# 🍔 QuickBite — Smart Food, Grocery & Restaurant Management Platform

<div align="center">

![QuickBite](https://img.shields.io/badge/QuickBite-v1.0.0-orange?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

**A multi-service food and grocery delivery platform integrating food ordering, grocery delivery, restaurant table booking, and surplus food redistribution into a single ecosystem.**

</div>

---

## 🌟 Overview

QuickBite is a comprehensive platform that combines modern food delivery, quick commerce, and restaurant management capabilities. Beyond commercial services, it promotes social responsibility by redistributing surplus food from restaurants to NGOs, helping reduce food wastage.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🍕 **Food Ordering** | Browse restaurants, order food, and track delivery in real-time |
| 🥬 **Grocery Delivery** | Shop from local grocery stores with scheduled delivery |
| 🪑 **Table Booking** | Reserve restaurant tables with pre-order meals |
| 📦 **Subscriptions** | Weekly & monthly premium plans with free delivery perks |
| 🤝 **Surplus Food Redistribution** | Restaurants donate excess food to NGOs |
| 🗺️ **Real-Time Tracking** | Google Maps integration for live delivery tracking |
| 💳 **Stripe Payments** | Secure online payments with refund management |
| 🌙 **Dark/Light Mode** | Toggle between themes for comfortable viewing |

## 👥 User Roles

- **Customer** — Browse, order, subscribe, book tables
- **Restaurant** — Manage menu, orders, tables, surplus food
- **Cloud Kitchen** — Manage menu & orders (no table booking)
- **Grocery Shop** — Manage products, inventory, orders
- **NGO** — Receive surplus food donations
- **Delivery Partner** — Accept & deliver orders
- **Admin** — Platform-wide management & analytics

## 🛠️ Tech Stack

### Frontend
- **React** (Vite)
- **React Router** (client-side routing)
- **Axios** (API communication)
- **React Icons** & **React Toastify**
- **Stripe React** (payment UI)
- **CSS Custom Properties** (theming)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Mongoose ODM)
- **JWT** (authentication)
- **Stripe API** (payments)
- **Google Maps API** (delivery tracking)
- **Helmet** + **Morgan** (security & logging)

## 📁 Project Structure

```
QuickBite/
├── client/                 # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── styles/         # CSS styles & themes
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database & service configs
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── seeders/        # Dummy data seeders
│   │   └── utils/          # Utility functions
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** account
- **Stripe** account (for payments)
- **Google Maps API** key (for tracking)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd QuickBite
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # In server/ directory, create .env file:
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📝 API Endpoints

> Detailed API documentation will be added as features are built.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## 🤝 Contributing

This is a university major project. Contributions are welcome via pull requests.

## 📄 License

ISC License

---

<div align="center">
  <b>Built with ❤️ using the MERN Stack</b>
</div>
