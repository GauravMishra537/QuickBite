# 🍔 QuickBite — Smart Food, Grocery & Restaurant Management Platform

A full-stack MERN (MongoDB, Express, React, Node.js) food delivery platform featuring **real-time order tracking**, **Stripe payments**, **cloud kitchens**, **grocery delivery**, **table bookings**, **subscriptions**, and **surplus food donations to NGOs**.

---

## 🚀 Features

### Customer
- 🏠 Browse restaurants, cloud kitchens, and grocery shops
- 🛒 Add to cart and checkout (Stripe / Cash on Delivery)
- 📦 Real-time order tracking with Google Maps
- 🪑 Book tables at restaurants with menu pre-ordering
- 💳 Weekly/monthly meal subscriptions
- 🤝 Donate surplus food to NGOs
- ⭐ Review and rate restaurants
- 🔔 In-app notifications
- 🔍 Unified search across all business types

### Business Owners
- 🍽️ Restaurant dashboard — manage menu, orders, earnings
- ☁️ Cloud Kitchen dashboard — delivery-only operations
- 🥬 Grocery Shop dashboard — products, inventory, orders
- 📊 Earnings chart and analytics
- 📋 Order management with status transitions

### Delivery Partners
- 🏍️ Real-time delivery assignment
- 📍 Live GPS location streaming via Socket.IO
- 💰 Earnings tracking and delivery history

### Admin
- 👑 Full admin dashboard with 9 management tabs
- 📈 Interactive analytics with clickable entity cards
- 👤 User management (activate / deactivate)
- 🏪 Business management (restaurants, kitchens, grocery, NGOs)
- 📋 Platform-wide order monitoring

### NGO Partners
- 🤲 Receive surplus food donations
- 📊 Dashboard for tracking received donations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (custom design system) |
| State | React Context API |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose 8 |
| Auth | JWT (Bearer tokens), bcrypt |
| Payments | Stripe Checkout |
| Real-time | Socket.IO |
| Maps | Google Maps JavaScript API |
| Icons | React Icons (Feather) |

---

## 📁 Project Structure

```
QuickBite/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # ProtectedRoute
│   │   │   ├── dashboard/          # StatCard, OrderCard, MenuForm, EarningsChart...
│   │   │   ├── layout/             # Navbar, Footer, Layout
│   │   │   ├── tracking/           # DeliveryMap, OrderTracker
│   │   │   ├── ReviewForm.jsx
│   │   │   ├── ReviewList.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── NotificationDropdown.jsx
│   │   ├── context/                # AuthContext, CartContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   ├── Restaurants.jsx / RestaurantDetail.jsx
│   │   │   ├── CloudKitchens.jsx / CloudKitchenDetail.jsx
│   │   │   ├── GroceryShops.jsx / GroceryDetail.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── TableBooking.jsx
│   │   │   ├── Subscriptions.jsx
│   │   │   ├── SurplusFood.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Dashboard.jsx       # Role-based dashboard router
│   │   │   ├── FooterPages.jsx     # About, Contact, FAQ, Terms, Privacy...
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance
│   │   │   └── socket.js           # Socket.IO client
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                         # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── socket.js           # Socket.IO server
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── cloudKitchenController.js
│   │   │   ├── groceryController.js
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   ├── bookingController.js
│   │   │   ├── subscriptionController.js
│   │   │   ├── donationController.js
│   │   │   ├── deliveryController.js
│   │   │   ├── paymentController.js
│   │   │   ├── adminController.js
│   │   │   ├── reviewController.js
│   │   │   └── searchController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT protect + authorize
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Restaurant.js
│   │   │   ├── CloudKitchen.js
│   │   │   ├── GroceryShop.js
│   │   │   ├── MenuItem.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Booking.js
│   │   │   ├── Subscription.js
│   │   │   ├── Donation.js
│   │   │   ├── NGO.js
│   │   │   ├── DeliveryPartner.js
│   │   │   └── Review.js
│   │   ├── routes/                 # Express route files
│   │   ├── seeders/                # Database seeders
│   │   ├── utils/
│   │   │   ├── AppError.js
│   │   │   ├── catchAsync.js
│   │   │   └── apiResponse.js
│   │   └── index.js                # Server entry point + Socket.IO
│   ├── .env
│   └── package.json
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (test keys)
- Google Maps API key

### 1. Clone the repository
```bash
git clone https://github.com/GauravMishra537/QuickBite.git
cd QuickBite
```

### 2. Server setup
```bash
cd server
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
CLIENT_URL=http://localhost:5173
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Start the server:
```bash
npm start        # Production
npm run dev      # Development (nodemon)
```

### 3. Client setup
```bash
cd client
npm install
npm run dev
```

The app runs at **http://localhost:5173**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | rahul@example.com | Customer@123 |
| Restaurant Owner | rajesh@example.com | Restaurant@123 |
| Cloud Kitchen Owner | neha@example.com | Kitchen@123 |
| Grocery Owner | vijay@example.com | Grocery@123 |
| Delivery Partner | amit@example.com | Delivery@123 |
| NGO Partner | anita@example.com | NGO@123 |
| Admin | admin@quickbite.com | Admin@123 |

> **Admin Access**: Click "Admin" demo button on login page → Enter secret password: `quickbite@admin123`

---

## 📡 API Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Restaurants & Menu
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/restaurants` | List all restaurants |
| GET | `/api/restaurants/:id` | Get restaurant details |
| GET/POST | `/api/menu` | Menu CRUD operations |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my-orders` | Customer orders |
| GET | `/api/orders/:id` | Get single order |
| PATCH | `/api/orders/:id/status` | Update order status |
| PATCH | `/api/orders/:id/cancel` | Cancel order |

### Cloud Kitchens, Grocery, Bookings, Subscriptions, Donations, Payments, Reviews, Search, Admin
> All follow RESTful patterns. See route files in `server/src/routes/` for complete API docs.

---

## 🗺️ Real-Time Tracking

QuickBite uses **Socket.IO** + **Google Maps** for live order tracking:

1. Customer places order → status `placed`
2. Business confirms → `confirmed` → `preparing` → `ready`
3. Delivery partner picks up → `outForDelivery`
4. **Google Maps renders animated delivery route** 🏍️
5. Customer sees real-time delivery partner movement
6. Order arrives → `delivered` ✅

Socket events:
- `joinOrder` — subscribe to order updates
- `orderStatusUpdate` — receive status changes
- `deliveryLocation` — receive GPS coordinates
- `locationUpdate` — delivery partner sends GPS

---

## 💳 Payments

Integrated with **Stripe Checkout** for:
- Food orders (restaurants, cloud kitchens)
- Grocery orders
- Table bookings (booking fee + pre-ordered menu)
- Subscriptions (weekly / monthly plans)

Also supports **Cash on Delivery (COD)**.

---

## 👥 Team

- **Gaurav Mishra** — [LinkedIn](https://www.linkedin.com/in/gaurav-mishra-08a486336/)
- **Abhishek Kumar Patel** — [LinkedIn](https://www.linkedin.com/in/abhishek-kumar-patel-47b376247/)

📧 Contact: mishragaurav9235@gmail.com
📞 Phone: +91 92353 60734 / +91 95281 46153

---

## 📜 License

This project is for educational purposes. Built as a full-stack MERN portfolio project.

---

**Built with ❤️ using the MERN Stack**
