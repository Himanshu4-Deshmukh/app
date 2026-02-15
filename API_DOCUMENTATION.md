# Slot-Based Betting Game - API Documentation

## Base URL
All API endpoints are prefixed with `/api`

Example: `https://your-domain.com/api/auth/login`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication APIs

### 1. Signup
**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6991be3fea068d1d0e7c6363",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 2. Login
**POST** `/api/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as Signup

---

## 👤 User APIs

### 1. Get Profile
**GET** `/api/users/profile`

Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "6991be3fea068d1d0e7c6363",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "isActive": true,
  "createdAt": "2026-02-15T12:38:07.123Z",
  "updatedAt": "2026-02-15T12:38:07.123Z"
}
```

---

## 💰 Wallet APIs

### 1. Get Wallet
**GET** `/api/wallet`

Get user's wallet details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "6991be3fea068d1d0e7c6364",
  "userId": "6991be3fea068d1d0e7c6363",
  "balance": 1000,
  "createdAt": "2026-02-15T12:38:07.234Z",
  "updatedAt": "2026-02-15T12:38:07.234Z"
}
```

### 2. Get Balance
**GET** `/api/wallet/balance`

Get only the balance amount.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "balance": 1000
}
```

---

## 📊 Wallet Transactions APIs

### 1. Get User Transactions
**GET** `/api/wallet-transactions`

Get current user's transaction history (last 100 transactions).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "6991beacd59e4758b0a57837",
    "userId": "6991be3fea068d1d0e7c6363",
    "amount": -10,
    "type": "BET",
    "referenceId": "6991be3fea068d1d0e7c636c",
    "createdAt": "2026-02-15T12:40:12.345Z"
  }
]
```

**Transaction Types:**
- `BET` - Debit when placing a bet
- `WIN` - Credit when winning a bet
- `ADMIN_CREDIT` - Credit by admin or payment approval

---

## 🎰 Slots APIs

### 1. Create Slot (Admin Only)
**POST** `/api/slots`

Create a new betting slot.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "startTime": "2026-02-15T13:00:00.000Z",
  "endTime": "2026-02-15T13:15:00.000Z",
  "betAmount": 10,
  "winAmount": 95
}
```

**Response:**
```json
{
  "_id": "6991be3fea068d1d0e7c636c",
  "startTime": "2026-02-15T13:00:00.000Z",
  "endTime": "2026-02-15T13:15:00.000Z",
  "status": "OPEN",
  "betAmount": 10,
  "winAmount": 95,
  "createdAt": "2026-02-15T12:38:07.345Z",
  "updatedAt": "2026-02-15T12:38:07.345Z"
}
```

### 2. Get All Slots
**GET** `/api/slots`

Get all slots (sorted by start time descending).

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of slot objects

### 3. Get Active Slot
**GET** `/api/slots/active`

Get currently active slot for betting.

**Headers:** `Authorization: Bearer <token>`

**Response:** Single slot object or `null`

### 4. Get Slot by ID
**GET** `/api/slots/:id`

Get specific slot details.

**Headers:** `Authorization: Bearer <token>`

**Response:** Single slot object

### 5. Set Winning Number (Admin Only)
**POST** `/api/slots/:id/winning-number`

Set the winning number for a slot (must be done before slot ends).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "winningNumber": 42
}
```

**Response:** Updated slot object

### 6. Get Bet Exposure (Admin Only)
**GET** `/api/slots/:id/exposure`

Get bet distribution for all numbers (0-99) in a slot.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "0": { "count": 0, "totalAmount": 0 },
  "1": { "count": 0, "totalAmount": 0 },
  ...
  "42": { "count": 5, "totalAmount": 50 },
  ...
  "99": { "count": 0, "totalAmount": 0 }
}
```

---

## 🎲 Bets APIs

### 1. Place Bet
**POST** `/api/bets`

Place a bet on a number in the active slot.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "slotId": "6991be3fea068d1d0e7c636c",
  "number": 42
}
```

**Response:**
```json
{
  "_id": "6991beacd59e4758b0a57836",
  "slotId": "6991be3fea068d1d0e7c636c",
  "userId": "6991be3fea068d1d0e7c6363",
  "number": 42,
  "amount": 10,
  "status": "PENDING",
  "createdAt": "2026-02-15T12:40:12.456Z"
}
```

**Requirements:**
- Slot must be OPEN
- User must have sufficient balance (10 coins)
- Current time must be between slot's startTime and endTime
- Number must be between 0-99

### 2. Get My Bets
**GET** `/api/bets/my-bets`

Get current user's bet history (last 100 bets).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "6991beacd59e4758b0a57836",
    "slotId": {
      "_id": "6991be3fea068d1d0e7c636c",
      "startTime": "2026-02-15T12:33:07.123Z",
      "endTime": "2026-02-15T12:48:07.123Z",
      "status": "RESULT_DECLARED",
      "winningNumber": 42
    },
    "userId": "6991be3fea068d1d0e7c6363",
    "number": 42,
    "amount": 10,
    "status": "WON",
    "createdAt": "2026-02-15T12:40:12.456Z"
  }
]
```

**Bet Status:**
- `PENDING` - Waiting for slot to close
- `WON` - Number matched winning number
- `LOST` - Number didn't match

---

## 💳 Payment APIs

### 1. Create Payment Request
**POST** `/api/payments/request`

Submit a payment request with screenshot.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 500,
  "screenshotUrl": "https://example.com/payment-proof.jpg"
}
```

**Response:**
```json
{
  "_id": "6991beef12345678901234ab",
  "userId": "6991be3fea068d1d0e7c6363",
  "amount": 500,
  "screenshotUrl": "https://example.com/payment-proof.jpg",
  "status": "PENDING",
  "createdAt": "2026-02-15T12:45:00.123Z"
}
```

### 2. Get My Payment Requests
**GET** `/api/payments/my-requests`

Get current user's payment request history.

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of payment request objects

**Payment Status:**
- `PENDING` - Awaiting admin review
- `APPROVED` - Approved and coins credited
- `REJECTED` - Rejected by admin

---

## 👑 Admin APIs

All admin APIs require admin role authentication.

### 1. Get All Users
**GET** `/api/admin/users`

Get all registered users.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** Array of user objects

### 2. Get All Bets
**GET** `/api/admin/bets`

Get all bets from all users (last 500 bets).

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** Array of bet objects with populated user and slot details

### 3. Get All Transactions
**GET** `/api/admin/transactions`

Get all wallet transactions (last 500 transactions).

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** Array of transaction objects

### 4. Get All Payment Requests
**GET** `/api/admin/payment-requests`

Get all payment requests from all users.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** Array of payment request objects with populated user details

### 5. Approve Payment Request
**POST** `/api/admin/payment-requests/:id/approve`

Approve a payment request and credit user's wallet.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "adminRemark": "Payment verified and approved"
}
```

**Response:** Updated payment request object

### 6. Reject Payment Request
**POST** `/api/admin/payment-requests/:id/reject`

Reject a payment request.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "adminRemark": "Invalid payment proof"
}
```

**Response:** Updated payment request object

### 7. Credit User Wallet
**POST** `/api/admin/credit-wallet`

Manually credit coins to a user's wallet.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "userId": "6991be3fea068d1d0e7c6363",
  "amount": 500
}
```

**Response:** Updated wallet object

### 8. Get Slot Profit
**GET** `/api/admin/slots/:id/profit`

Get profit analysis for a specific slot.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "slotId": "6991be3fea068d1d0e7c636c",
  "totalBets": 25,
  "totalBetAmount": 250,
  "totalPayout": 190,
  "profit": 60
}
```

---

## 🔄 Automated Processes

### Slot Auto-Processing (Cron Job)

The system automatically processes slots every 10 seconds:

1. **Check for expired slots** (endTime < now)
2. **Close slots** that have ended
3. **Declare results** if winning number is set:
   - Find all bets for the slot
   - Mark bets as WON or LOST
   - Credit winners with 95 coins
   - Update slot status to RESULT_DECLARED

**Important:** Admin must set winning number before slot ends, otherwise slot will be marked as CLOSED without results.

---

## 📋 Game Rules

- **Fixed bet amount:** 10 coins per bet
- **Fixed payout:** 95 coins for winning bet
- **Numbers range:** 0-99
- **Multiple bets allowed:** Users can place multiple bets per slot
- **No negative balance:** System prevents betting if insufficient balance
- **Admin controlled:** Winning number is set by admin (not random)
- **Time-based:** Betting only allowed during slot's active period

---

## 🔐 Default Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** Admin@123

### Test User Account
- **Email:** test@example.com
- **Password:** Test@123
- **Initial Balance:** 1000 coins

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

Common HTTP Status Codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## 🚀 Production Considerations

1. **Change JWT Secret** in `.env` file
2. **Use HTTPS** in production
3. **Rate limiting** should be added
4. **File upload** for payment screenshots (currently accepts URL)
5. **Email notifications** for payment approvals
6. **Audit logs** for all admin actions
7. **Database backups** regularly
8. **Monitor cron job** execution

---

## 📞 Support

For issues or questions, contact the development team.

**Version:** 1.0.0  
**Last Updated:** February 15, 2026
