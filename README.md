# Muwas Distilling - Premium eCommerce Platform

A full-stack modern eCommerce website for Muwas Distilling, a premium East African distillery brand. Built with React, Node.js, and MongoDB.

## 🌟 Features

### Frontend (React + Vite)
- **Modern UI**: Premium dark theme with gold accents
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication**: JWT-based with role-based access control
- **Shopping Cart & Checkout**: Full e-commerce functionality
- **Product Management**: Browse, search, and filter products
- **Order Tracking**: View order history and status
- **Wholesale Portal**: Protected area for wholesale partners
- **Admin Dashboard**: Manage products, orders, and users

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations
- **MongoDB Integration**: Mongoose ODM with Atlas support
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Customer, Wholesale, Admin roles
- **Order Management**: Complete order lifecycle
- **Payment Integration**: Ready for mobile money and bank transfers
- **Security**: Rate limiting, CORS, helmet protection

## 🛠️ Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- dotenv for environment variables
- Express rate limiter
- Helmet for security

## 📦 Project Structure

```
muwas-distilling/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── public/
│   └── package.json
├── backend/
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── seed.js            # Database seeder
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd muwas-distilling
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/muwas-distilling
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

4. **Seed the database**
```bash
node seed.js
```

5. **Start the backend server**
```bash
npm run dev
```

6. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

7. **Set up frontend environment variables**
Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

8. **Start the frontend development server**
```bash
npm run dev
```

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: `/admin` (requires admin login)
- **Wholesale Portal**: `/wholesale` (requires wholesale account)

## 👤 Default Accounts

After seeding the database:

**Admin Account:**
- Email: `admin@muwasdistilling.ug`
- Password: `admin123`
- Role: Admin

**Customer Registration:**
- Use the registration form to create customer accounts
- Wholesale accounts require admin approval

## 🛍️ Sample Products

The seeder creates 6 sample products:
1. Muwas Premium Gin - UGX 45,000
2. Muwas Coffee Liqueur - UGX 38,000
3. Muwas Citrus Vodka - UGX 32,000
4. Muwas Spiced Rum - UGX 42,000
5. Muwas Orange Gin - UGX 48,000
6. Muwas Premium Whiskey - UGX 65,000

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: Can browse products, place orders, view order history
- **Wholesale**: Access to wholesale pricing, bulk ordering
- **Admin**: Full access to dashboard, product management, order management

### Protected Routes
- `/profile` - All authenticated users
- `/orders` - All authenticated users
- `/wholesale` - Wholesale and Admin users
- `/admin` - Admin users only

## 💳 Payment Integration

The platform is ready for:
- Mobile Money (MTN, Airtel)
- Bank Transfers
- Cash on Delivery
- Credit Card (Stripe integration ready)

## 🚚 Delivery Options

- **Store Pickup**: Free
- **Boda Delivery**: UGX 5,000
- **Retailer Delivery**: Available for wholesale orders

## 🎨 Design Features

- Premium dark theme with gold accents
- Responsive design for all devices
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications
- Search and filter functionality
- Image galleries for products

## 📊 Admin Features

- Dashboard with key metrics
- Order management (confirm, process, ship)
- Product management (CRUD operations)
- User management
- Sales analytics
- Order tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Wholesale
- `GET /api/wholesale` - Get wholesale products
- `POST /api/wholesale/order` - Create wholesale order

## 🌍 Deployment

### Frontend (Vercel/Netlify)
1. Build the project from the repository root: `npm run build --prefix frontend`
2. Deploy the `frontend/dist` folder
3. Set environment variables in deployment platform

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy the Node.js application
3. Ensure MongoDB connection string is configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary to Muwas Distilling.

## 📞 Support

For support and inquiries:
- Email: info@muwasdistilling.ug
- Phone: +256 123 456 789

---

**Muwas Distilling** - Crafting Excellence, One Bottle at a Time.
