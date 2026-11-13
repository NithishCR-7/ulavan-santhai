# Express.js Backend API

A clean, modular REST API built with Express.js (ES Modules), Supabase, and Drizzle ORM.

---

## Project Structure

```text
├── src/
│   ├── config/              # App & database configurations
│   │   ├── cors.js          # CORS policy settings
│   │   ├── db.js            # Drizzle ORM PostgreSQL connection
│   │   └── supabase.js      # Supabase client SDK (Auth & Storage)
│   ├── controllers/         # HTTP request/response handlers (thin controllers)
│   │   ├── auth.controller.js
│   │   └── health.controller.js
│   ├── services/            # Pure business logic layer
│   │   └── auth.service.js   # Validation, bcrypt hashing, OTP & user logic
│   ├── middleware/          # Custom middlewares (errorHandler.js, requestLogger.js)
│   ├── routes/              # Express route declarations
│   │   ├── auth.routes.js   # /api/auth routes
│   │   ├── health.routes.js
│   │   └── index.js         # Central route aggregator
│   ├── utils/               # Helper utilities
│   │   └── otp.util.js      # Cryptographic 6-digit OTP generator
│   └── server.js            # App initialization & server entry point
├── .env                     # Local environment variables
├── .env.example             # Example environment template
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### 1. Environment Variables
Your `.env` file contains your server, Supabase, and Drizzle database connection:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000,http://192.168.1.44:3000

# Supabase SDK Credentials
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Drizzle PostgreSQL Connection String (Supabase Pooler)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-xx.pooler.supabase.com:6543/postgres
```

### 2. Run the Server
- **Development mode** (with live reload):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

---

## How to Use the Connections in Your Code

### 1. Using Drizzle ORM (`db.js`)
Import `db` anywhere you need to execute SQL queries or database operations:
```javascript
import { db } from './config/db.js';

// Example: Direct query using queryClient or Drizzle queries
const result = await db.execute('SELECT NOW()');
```

### 2. Using Supabase SDK (`supabase.js`)
Import `supabase` for authentication, storage, or realtime features:
```javascript
import { supabase } from './config/supabase.js';

// Example: Query any table
const { data, error } = await supabase.from('users').select('*');
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API welcome message |
| `GET` | `/api/health` | Health status and timestamp check |
| `POST` | `/api/auth/register` | Register user & receive 6-digit OTP |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP to complete registration |
| `POST` | `/api/auth/login` | Authenticate with static test credentials |

### Static Test Credentials
- **Email:** `admin@gmail.com`
- **Password:** `Admin@123`

---

## Registration & OTP Request Examples

### 1. Register User (Receives 6-digit OTP)
- **Endpoint:** `POST /api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "name": "Nithish Kumar",
    "email": "nithish@example.com",
    "mobile": "9876543210",
    "password": "SecretPassword123"
  }
  ```

### 2. Verify OTP
- **Endpoint:** `POST /api/auth/verify-otp`
- **Headers:** `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "email": "nithish@example.com",
    "otp": "123456"
  }
  ```

---

## Document Upload to Supabase Storage

### Upload Document (Public Bucket: `user_documents`)
- **Endpoint:** `POST /api/v1/documents/upload`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `documentType`: `ID_PROOF` (or `COMPANY_PAN`, `GST_CERTIFICATE`, `BANK_PROOF`)
  - `file`: (Binary attachment: PDF, JPG, JPEG, PNG - 5MB Max)
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Document uploaded successfully.",
    "data": {
      "documentId": "doc_lg47t1wr",
      "documentType": "ID_PROOF",
      "fileName": "sample_id.pdf",
      "fileUrl": "https://rsahemspjhqryuymqnsp.supabase.co/storage/v1/object/public/user_documents/usr_test_001/1793706880506_ID_PROOF_sample_id.pdf",
      "storagePath": "usr_test_001/1793706880506_ID_PROOF_sample_id.pdf",
      "bucketName": "user_documents",
      "status": "UPLOADED"
    }
  }
  ```
