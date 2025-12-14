# API Integration Guide - Frontend ↔️ Backend

## 📡 Backend Services Overview

This frontend application integrates with 3 Spring Boot microservices:

### 1️⃣ **Commercial Service** - Port 8081
Manages product catalog and orders.

**Endpoints:**
- `GET /api/commercial/produits` - List all products
- `POST /api/commercial/produits` - Create a new product
- `POST /api/commercial/commandes` - Store orders

**Product Model:**
```json
{
  "codepdt": "PRD-001",
  "nompdt": "Laptop ASUS VivoBook",
  "descpdt": "15.6\" FHD, Intel i5, 8GB RAM",
  "prixpdt": 699.99
}
```

---

### 2️⃣ **Stock Service** - Port 8082
Manages inventory and stock levels.

**Endpoints:**
- `GET /api/stock/produits` - List all stock
- `POST /api/stock/produits` - Add stock for a product
- `POST /api/stock/soustraire` - Subtract stock (used internally)

**Stock Model:**
```json
{
  "codestock": "STK-001",
  "codepdt": "PRD-001",
  "qtepdt": 100
}
```

---

### 3️⃣ **Sale Service** - Port 8083
Aggregates products with stock and handles orders.

**Endpoints:**
- `GET /api/ventes/produits` - List products WITH stock (aggregated)
- `POST /api/ventes/commande` - Place an order (decreases stock, creates invoice)
- `GET /api/ventes/commandes` - List all orders

**Aggregated Product Model:**
```json
{
  "codepdt": "PRD-001",
  "nompdt": "Laptop ASUS VivoBook",
  "descpdt": "15.6\" FHD, Intel i5, 8GB RAM",
  "prixpdt": 699.99,
  "qtepdt": 100
}
```

**Order Model:**
```json
{
  "codecmd": "ORD-12345",
  "client": "Tech Solutions Inc",
  "codepdt": "PRD-001",
  "qtecmd": 5,
  "datecmd": "2025-12-12T10:30:00"
}
```

---

## 🔌 Frontend Pages & API Integration

### **Admin Pages**

#### 1. Create Product (`/admin/products/create`)
**API Call:** `POST http://localhost:8081/api/commercial/produits`

**What it does:**
- Creates a new product in the Commercial Service
- Validates price > 0 and required fields
- Shows success message and redirects to products list

**Request Body:**
```json
{
  "codepdt": "PRD-009",
  "nompdt": "New Product",
  "descpdt": "Product description",
  "prixpdt": 99.99
}
```

**Error Handling:**
- 400: Invalid data
- 500: Server error
- Network errors: "Unable to connect to Commercial Service"

---

#### 2. Add Stock (`/admin/stock/add`)
**API Calls:**
1. `GET http://localhost:8081/api/commercial/produits` (load products for dropdown)
2. `POST http://localhost:8082/api/stock/produits` (add stock)

**What it does:**
- Fetches all products from Commercial Service
- Allows selecting a product from dropdown
- Adds stock quantity to Stock Service
- Shows success message and redirects to products list

**Request Body:**
```json
{
  "codestock": "STK-009",
  "codepdt": "PRD-009",
  "qtepdt": 50
}
```

**Error Handling:**
- No products available: Shows "Create product first" message
- 400: Invalid data
- 404: Product not found
- Network errors: "Unable to connect to Stock Service"

---

### **User Pages**

#### 3. Product List (`/products`)
**API Call:** `GET http://localhost:8083/api/ventes/produits`

**What it does:**
- Fetches all products with aggregated stock from Sale Service
- Displays products in a searchable/sortable table
- Shows stock status with color coding:
  - 🟢 Green: > 100 units
  - 🟡 Yellow: 50-100 units
  - 🟠 Orange: 1-49 units
  - 🔴 Red: 0 units (out of stock)
- Disables "Order" button when stock = 0

**Response:**
```json
[
  {
    "codepdt": "PRD-001",
    "nompdt": "Laptop ASUS VivoBook",
    "descpdt": "15.6\" FHD, Intel i5, 8GB RAM",
    "prixpdt": 699.99,
    "qtepdt": 45
  }
]
```

**Error Handling:**
- Network errors: Shows error banner with retry button
- No products: Shows empty state

---

#### 4. Order Creation (`/order-creation`)
**API Call:** `POST http://localhost:8083/api/ventes/commande`

**What it does:**
- Allows customer to place an order for a selected product
- Validates quantity against available stock
- Sends order to Sale Service which:
  - Decreases stock in Stock Service
  - Saves order to Commercial Service
  - Creates invoice JSON
- Redirects to orders page with invoice

**Request Body:**
```json
{
  "client": "John Doe",
  "codepdt": "PRD-001",
  "qtecmd": 5,
  "datecmd": "2025-12-12T10:30:00.000Z"
}
```

**Error Handling:**
- **400 Bad Request:** Insufficient stock
  - Frontend: Shows error banner
  - Toast: "Insufficient stock! Available: X, Requested: Y"
- **404 Not Found:** Product not found
  - Toast: "Product not found in the system"
- **500 Server Error:** Microservices communication error
  - Toast: "Error communicating between microservices"
- **Frontend validation:**
  - Client name empty
  - Quantity > available stock
  - Quantity <= 0

**Success Response:**
```json
{
  "codecmd": "ORD-12345",
  "client": "John Doe",
  "codepdt": "PRD-001",
  "qtecmd": 5,
  "datecmd": "2025-12-12T10:30:00"
}
```

---

#### 5. Orders & Invoices (`/orders`)
**API Call:** `GET http://localhost:8083/api/ventes/commandes`

**What it does:**
- Fetches all orders from Sale Service
- Displays orders in a table
- Allows viewing invoice details
- Provides PDF download (text format for demo)

**Response:**
```json
[
  {
    "codecmd": "ORD-12345",
    "client": "John Doe",
    "codepdt": "PRD-001",
    "qtecmd": 5,
    "datecmd": "2025-12-12T10:30:00"
  }
]
```

**Error Handling:**
- Network errors: Shows error banner with retry button
- No orders: Shows empty state with "Create first order" message

---

## 🎯 Complete User Flows

### Flow 1: Admin Setup
```
1. Login to application
2. Go to "Create Product" → POST /api/commercial/produits
   - Create product "Laptop", price $699.99
3. Go to "Add Stock" → GET /api/commercial/produits + POST /api/stock/produits
   - Select "Laptop" from dropdown
   - Add 100 units
4. Product is now available for ordering
```

### Flow 2: Customer Order
```
1. Login to application
2. Go to "Products" → GET /api/ventes/produits
   - View all products with stock
3. Click "Order" on a product
4. Fill order form:
   - Client: "Tech Corp"
   - Quantity: 5
5. Submit → POST /api/ventes/commande
   - Backend decreases stock: 100 → 95
   - Backend creates order in Commercial Service
   - Backend returns invoice
6. Redirect to "Orders & Invoices"
7. View invoice with order details
```

### Flow 3: View Orders
```
1. Go to "Orders & Invoices" → GET /api/ventes/commandes
2. See all orders in table
3. Click "View" to see invoice details
4. Download invoice as PDF (text file for demo)
```

---

## 🚨 Error Scenarios & Handling

### Scenario 1: Insufficient Stock
**User Action:** Order 150 units when only 100 available

**Frontend Validation:**
- Shows orange warning banner: "Quantity exceeds available stock!"
- Disables submit button

**Backend Response (if bypassed):**
- Status: 400 Bad Request
- Message: "Insufficient stock"

**Frontend Handling:**
- Toast error: "Insufficient stock! Available: 100, Requested: 150"
- Error banner with message
- User stays on order creation page

---

### Scenario 2: Product Not Found
**User Action:** Order a deleted product

**Backend Response:**
- Status: 404 Not Found

**Frontend Handling:**
- Toast error: "Product not found in the system"
- User stays on order creation page

---

### Scenario 3: Microservices Communication Error
**User Action:** Order when Sale Service can't reach Stock Service

**Backend Response:**
- Status: 500 Internal Server Error

**Frontend Handling:**
- Toast error: "Error communicating between microservices"
- Error banner with technical details
- User can retry

---

### Scenario 4: Backend Offline
**User Action:** Any API call when backend is down

**Frontend Handling:**
- Shows error banner: "Unable to connect to [Service] Service"
- Provides "Retry" button
- Shows helpful message: "Make sure the [Service] Service is running on port XXXX"

---

## 🔧 Configuration

### API Base URLs (in code)
```javascript
// Commercial Service
const COMMERCIAL_API = 'http://localhost:8081';

// Stock Service
const STOCK_API = 'http://localhost:8082';

// Sale Service
const SALE_API = 'http://localhost:8083';
```

### CORS Configuration
Ensure your Spring Boot backend has CORS enabled:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                                                             │
│  Admin Pages          │         User Pages                 │
│  ─────────────────────┼─────────────────────────────        │
│  Create Product       │         Products List              │
│  Add Stock            │         Order Creation             │
│  Users                │         Orders & Invoices          │
└─────────┬─────────────┴─────────────┬─────────────────────┘
          │                           │
          │                           │
          ├───────────────────────────┼────────────────────┐
          │                           │                    │
          ▼                           ▼                    ▼
┌──────────────────┐      ┌──────────────────┐   ┌──────────────────┐
│   COMMERCIAL     │      │      STOCK       │   │      SALE        │
│    SERVICE       │◄─────┤     SERVICE      │◄──┤    SERVICE       │
│   Port 8081      │      │    Port 8082     │   │   Port 8083      │
├──────────────────┤      ├──────────────────┤   ├──────────────────┤
│ • Products       │      │ • Stock levels   │   │ • Aggregated     │
│ • Orders         │      │ • Add stock      │   │   products       │
│                  │      │ • Subtract stock │   │ • Place orders   │
│                  │      │                  │   │ • Invoices       │
└──────────────────┘      └──────────────────┘   └──────────────────┘
```

---

## 🎨 Toast Notifications

The app uses **Sonner** for beautiful toast notifications:

**Success Messages:**
- ✅ "Products loaded successfully"
- ✅ "Order placed successfully!"
- ✅ "Product created successfully!"
- ✅ "Stock added successfully!"

**Error Messages:**
- ❌ "Unable to connect to Sale Service"
- ❌ "Insufficient stock! Available: X, Requested: Y"
- ❌ "Product not found in the system"
- ❌ "Error communicating between microservices"

**Info Messages:**
- ℹ️ "Downloading invoice for ORD-12345..."

---

## 📝 Testing Checklist

### Backend Setup
- [ ] Commercial Service running on port 8081
- [ ] Stock Service running on port 8082
- [ ] Sale Service running on port 8083
- [ ] CORS enabled on all services
- [ ] Database connections working

### Frontend Testing
- [ ] Login works
- [ ] Create Product → saves to Commercial Service
- [ ] Add Stock → loads products and adds stock
- [ ] Products List → shows aggregated data
- [ ] Order Creation → validates and submits order
- [ ] Orders List → displays all orders
- [ ] Error handling → shows appropriate messages
- [ ] Toast notifications → appear correctly

### Integration Testing
- [ ] Create product → appears in Add Stock dropdown
- [ ] Add stock → product shows correct quantity in Products List
- [ ] Place order → stock decreases correctly
- [ ] Order appears in Orders List
- [ ] Insufficient stock → shows error
- [ ] Backend offline → shows connection error

---

## 🐛 Common Issues

### Issue 1: CORS Errors
**Symptom:** Console shows "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:** Add CORS configuration to Spring Boot backend (see Configuration section)

---

### Issue 2: Products Not Loading
**Symptom:** Empty products list, error banner

**Solutions:**
1. Check if Sale Service is running: `http://localhost:8083/api/ventes/produits`
2. Check if products exist in Commercial Service
3. Check if stock exists in Stock Service
4. Check browser console for errors

---

### Issue 3: Can't Create Order
**Symptom:** Submit button disabled or error on submit

**Solutions:**
1. Ensure product has stock > 0
2. Check client name is filled
3. Check quantity doesn't exceed stock
4. Verify Sale Service is running

---

### Issue 4: Stock Not Updating After Order
**Symptom:** Stock quantity doesn't decrease

**Solution:** Check Sale Service logs - it should call Stock Service to subtract stock

---

## 🚀 Quick Start

1. **Start Backend Services:**
   ```bash
   # Terminal 1 - Commercial Service
   cd commercial-service
   mvn spring-boot:run
   
   # Terminal 2 - Stock Service
   cd stock-service
   mvn spring-boot:run
   
   # Terminal 3 - Sale Service
   cd sale-service
   mvn spring-boot:run
   ```

2. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Test Complete Flow:**
   - Login
   - Create a product (Admin)
   - Add stock for that product (Admin)
   - View product in Products List (User)
   - Place an order (User)
   - View order in Orders List (User)

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for exceptions
3. Verify all services are running on correct ports
4. Check CORS configuration
5. Ensure database connections are working

---

**Last Updated:** December 12, 2025  
**Frontend Version:** React 18 + TypeScript  
**Backend:** Spring Boot microservices architecture
