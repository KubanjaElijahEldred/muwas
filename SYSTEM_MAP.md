# Muwas System Architecture Map

## Visual System Overview

```mermaid
graph TB
    subgraph "Frontend (React - Port 5173)"
        A[Header Component]
        B[Footer Component]
        C[Site Assistant]
        D[Protected Routes]
        E[Theme System]
    end
    
    subgraph "Pages Layer"
        F[Landing Page]
        G[Products Catalog]
        H[Product Detail]
        I[Shopping Cart]
        J[Checkout]
        K[User Profile]
        L[Admin Dashboard]
        M[Wholesale Portal]
    end
    
    subgraph "Context Layer"
        N[Auth Context]
        O[Cart Context]
        P[Theme Context]
    end
    
    subgraph "Backend API (Express - Port 5000)"
        Q[Auth Routes]
        R[Product Routes]
        S[Order Routes]
        T[Wholesale Routes]
        U[Middleware]
    end
    
    subgraph "Data Layer"
        V[MongoDB Database]
        W[User Collection]
        X[Product Collection]
        Y[Order Collection]
        Z[Retailer Collection]
    end
    
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L
    A --> M
    
    N --> Q
    O --> S
    P --> E
    
    Q --> U
    R --> U
    S --> U
    T --> U
    
    U --> W
    U --> X
    U --> Y
    U --> Z
    
    W --> V
    X --> V
    Y --> V
    Z --> V
    
    F --> N
    G --> O
    H --> O
    I --> O
    J --> O
    K --> N
    L --> N
    M --> N
```

## User Flow Architecture

```mermaid
graph LR
    subgraph "Customer Journey"
        A[Visit Site] --> B[Browse Products]
        B --> C[Add to Cart]
        C --> D[Checkout]
        D --> E[Register/Login]
        E --> F[Complete Order]
        F --> G[Order History]
    end
    
    subgraph "Wholesale Journey"
        H[Visit Site] --> I[Apply for Wholesale]
        I --> J[Wait Approval]
        J --> K[Access Wholesale Portal]
        K --> L[Bulk Ordering]
        L --> M[Special Pricing]
    end
    
    subgraph "Admin Journey"
        N[Admin Login] --> O[Dashboard]
        O --> P[Manage Products]
        O --> Q[Process Orders]
        O --> R[Manage Users]
        O --> S[View Analytics]
    end
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Context
    participant C as Cart Context
    participant B as Backend API
    participant D as Database
    
    U->>F: Browse Products
    F->>B: GET /api/products
    B->>D: Query Products
    D->>B: Return Products
    B->>F: Product Data
    F->>U: Display Products
    
    U->>F: Add to Cart
    F->>C: Update Cart State
    C->>F: Cart Updated
    F->>U: Cart Badge Update
    
    U->>F: Checkout
    F->>A: Check Auth
    A->>F: User Authenticated
    F->>B: POST /api/orders
    B->>D: Create Order
    D->>B: Order Created
    B->>F: Order Confirmation
    F->>U: Order Success
```

## Security Architecture

```mermaid
graph TD
    subgraph "Frontend Security"
        A[JWT Token Storage]
        B[Protected Routes]
        C[Input Validation]
    end
    
    subgraph "Backend Security"
        D[Helmet.js Headers]
        E[CORS Configuration]
        F[Rate Limiting]
        G[Auth Middleware]
        H[Role-Based Access]
    end
    
    subgraph "Data Security"
        I[Password Hashing]
        J[Environment Variables]
        K[Database Encryption]
    end
    
    A --> G
    B --> G
    C --> F
    G --> H
    H --> I
    J --> K
```

## Component Hierarchy

```
App
├── AuthProvider
│   ├── Header
│   │   ├── Navigation
│   │   ├── UserMenu
│   │   └── ThemeToggle
│   ├── ProtectedRoute
│   │   ├── Profile
│   │   ├── Orders
│   │   ├── Wholesale
│   │   └── AdminDashboard
│   └── SiteAssistant
├── CartProvider
│   ├── Products
│   ├── ProductDetail
│   ├── Cart
│   └── Checkout
├── Router
│   ├── Landing
│   ├── Story
│   ├── Contact
│   ├── Login
│   └── Register
└── Footer
```

## API Architecture

### Request Flow
1. **Frontend Request** → Axios HTTP Client
2. **Authentication Check** → JWT Token Validation
3. **Route Processing** → Express Router
4. **Middleware Chain** → Auth, Validation, Rate Limiting
5. **Controller Logic** → Business Logic Execution
6. **Database Operations** → Mongoose ODM
7. **Response** → Formatted JSON Response

### Error Handling
- Frontend: Try-catch blocks with user-friendly messages
- Backend: Centralized error handling middleware
- Database: Mongoose validation and error handling

## Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Tailwind CSS purging for minimal bundle size
- Vite build optimization

### Backend Optimization
- Database indexing for common queries
- Pagination for large datasets
- Caching strategies for frequently accessed data
- Efficient query patterns with Mongoose

### Database Design
- Normalized data structure
- Appropriate indexing strategy
- Relationship management between collections
- Scalable schema design

## Deployment Architecture

### Development Environment
- Frontend: Vite dev server (localhost:5173)
- Backend: Node.js with Nodemon (localhost:5000)
- Database: Local MongoDB instance

### Production Considerations
- Frontend: Static asset hosting (CDN)
- Backend: Containerized deployment
- Database: Managed MongoDB service
- Load balancing and scaling strategies
- Monitoring and logging systems

---

This architecture map provides a comprehensive visual and structural overview of the Muwas distilling system, helping developers understand the relationships between components and data flow throughout the application.
