# Muwas Distilling System Architecture

## Overview
Muwas is a full-stack e-commerce platform for a distilling company that sells products to both retail customers and wholesale buyers. The system features role-based access control, product management, order processing, and a modern React frontend.

## Technology Stack

### Frontend
- **Framework**: React 19.2.4 with Vite 8.0.1
- **Routing**: React Router DOM 7.13.2
- **Styling**: Tailwind CSS 4.2.2 with PostCSS
- **UI Components**: Headless UI, Heroicons, Lucide React
- **HTTP Client**: Axios 1.14.0
- **State Management**: React Context (AuthContext, CartContext)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.3.3
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: Helmet, CORS, bcryptjs, express-rate-limit
- **Development**: Nodemon 3.1.14

## System Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   React Client  │ ◄──────────────► │  Express Server │
│   (Port 5173)   │                  │   (Port 5000)   │
└─────────────────┘                  └─────────────────┘
         │                                   │
         │                                   │
         │                                   ▼
         │                          ┌─────────────────┐
         │                          │   MongoDB       │
         │                          │   Database      │
         │                          └─────────────────┘
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── Header.jsx           # Navigation and user menu
│   ├── Footer.jsx           # Site footer
│   ├── ProtectedRoute.jsx   # Route protection wrapper
│   ├── SiteAssistant.jsx    # AI assistant component
│   └── SiteSearch.jsx       # Product search functionality
├── contexts/
│   ├── AuthContext.jsx      # Authentication state management
│   └── CartContext.jsx      # Shopping cart state management
├── pages/
│   ├── Landing.jsx          # Homepage
│   ├── Story.jsx            # Company story/about
│   ├── Products.jsx         # Product listing
│   ├── ProductDetail.jsx    # Individual product view
│   ├── Cart.jsx             # Shopping cart
│   ├── Checkout.jsx         # Order checkout
│   ├── Contact.jsx          # Contact page
│   ├── Login.jsx            # User login
│   ├── Register.jsx         # User registration
│   ├── Profile.jsx          # User profile management
│   ├── Orders.jsx           # Order history
│   ├── Wholesale.jsx        # Wholesale portal
│   └── AdminDashboard.jsx   # Admin control panel
├── data/
│   └── siteKnowledge.js     # Static site data and fallbacks
└── utils/
    └── productPresentation.js # Product display utilities
```

### Routing Structure
```
/                    # Landing page
/story              # Company story
/products            # Product catalog
/product/:id        # Product details
/cart               # Shopping cart
/checkout           # Checkout process
/contact            # Contact information
/login              # User login
/register           # User registration
/profile            # User profile (protected)
/orders             # Order history (protected)
/wholesale          # Wholesale portal (wholesale/admin)
/admin              # Admin dashboard (admin only)
```

### State Management
- **AuthContext**: Manages user authentication, role, and profile data
- **CartContext**: Handles shopping cart operations and state
- **Local State**: Component-specific state using React hooks

## Backend Architecture

### Directory Structure
```
backend/
├── models/
│   ├── User.js              # User schema and methods
│   ├── Product.js           # Product schema
│   ├── Order.js             # Order schema
│   └── Retailer.js          # Wholesale retailer schema
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── products.js          # Product management endpoints
│   ├── orders.js            # Order processing endpoints
│   └── wholesale.js         # Wholesale endpoints
├── middleware/
│   └── auth.js              # Authentication and authorization middleware
├── server.js                # Express server configuration
├── seed.js                  # Database seeding script
└── .env                     # Environment variables
```

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /logout` - User logout

#### Products (`/api/products`)
- `GET /` - Get all products (with filtering)
- `GET /:id` - Get single product
- `POST /` - Create product (admin only)
- `PUT /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)

#### Orders (`/api/orders`)
- `GET /` - Get user orders
- `POST /` - Create new order
- `GET /:id` - Get order details
- `PUT /:id/status` - Update order status (admin)

#### Wholesale (`/api/wholesale`)
- `POST /apply` - Apply for wholesale account
- `GET /products` - Get wholesale products
- `POST /order` - Create wholesale order

## Data Models

### User Model
```javascript
{
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  role: String ['customer', 'wholesale', 'admin'] (default: 'customer')
  isApproved: Boolean (default: true)
  phone: String
  address: {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }
  createdAt: Date
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String (required)
  description: String (required)
  shortDescription: String (required)
  price: Number (required, min: 0)
  wholesalePrice: Number
  images: [{
    url: String
    alt: String
  }]
  category: String (required)
  isFeatured: Boolean (default: false)
  isActive: Boolean (default: true)
  stock: Number (default: 0)
  sku: String (unique)
  createdAt: Date
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: 'User')
  items: [{
    product: ObjectId (ref: 'Product')
    quantity: Number
    price: Number
  }]
  totalAmount: Number (required)
  status: String ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  shippingAddress: {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }
  paymentMethod: String
  paymentStatus: String ['pending', 'paid', 'failed']
  createdAt: Date
  updatedAt: Date
}
```

### Retailer Model
```javascript
{
  user: ObjectId (ref: 'User')
  businessName: String (required)
  businessLicense: String
  taxId: String
  website: String
  isVerified: Boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Protected routes with middleware

### API Security
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- Helmet.js for security headers
- Input validation and sanitization

### Data Protection
- Environment variable management for sensitive data
- Secure password storage
- User approval workflow for wholesale accounts

## Development Workflow

### Environment Setup
1. Backend: `cd backend && npm install && npm run dev`
2. Frontend: `cd frontend && npm install && npm run dev`
3. Database: MongoDB instance (local or Atlas)

### Build Process
- Frontend: Vite build system with PostCSS/Tailwind processing
- Backend: Node.js with Express server
- Database: Mongoose ODM with MongoDB

### Deployment Considerations
- Environment-specific configuration
- Static asset serving
- Database connection management
- Security headers and HTTPS

## Key Features

### Multi-Role System
- **Customers**: Browse products, place orders, manage profile
- **Wholesale**: Bulk pricing, special ordering, business verification
- **Admin**: Product management, order fulfillment, user management

### E-commerce Functionality
- Product catalog with filtering and search
- Shopping cart with persistent state
- Secure checkout process
- Order tracking and history
- Payment processing integration ready

### User Experience
- Responsive design with Tailwind CSS
- Dark/light theme switching
- AI-powered site assistant
- Progressive Web App capabilities
- Modern React patterns

## Future Enhancements

### Potential Additions
- Real-time inventory management
- Advanced analytics dashboard
- Email notification system
- Payment gateway integration
- Mobile app development
- Advanced search and recommendations
- Multi-language support

### Scalability Considerations
- Redis for session management
- CDN for static assets
- Database indexing optimization
- Microservices architecture
- Load balancing setup

---

*This architecture document serves as a comprehensive guide for understanding the Muwas distilling system structure, components, and development patterns.*
