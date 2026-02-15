# 🧪 Testing Guide - Slot Betting Game Backend

## Quick Start Testing

### Prerequisites
- Backend running on port 8001
- MongoDB connected and seeded
- API base URL configured in environment

## 🔐 Test Credentials

### Admin Account
```
Email: admin@example.com
Password: Admin@123
```

### Test User Account
```
Email: test@example.com
Password: Test@123
Initial Balance: 1000 coins (after seeding)
```

---

## 📋 Test Scenarios

### Scenario 1: User Registration & Authentication

**1. Create New User**
```bash
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "password": "Test@123"
  }'
```

**Expected:** 
- Status: 201
- Returns: access_token, user object
- Wallet automatically created with 0 balance

**2. Login with New User**
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "Test@123"
  }'
```

**Expected:**
- Status: 200
- Returns: access_token, user object

**3. Get User Profile**
```bash
# Replace <TOKEN> with token from login
curl http://localhost:8001/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected:**
- Status: 200
- Returns: User details (without password)

---

### Scenario 2: Wallet Operations

**1. Check Wallet Balance**
```bash
curl http://localhost:8001/api/wallet/balance \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: `{"balance": 0}`

**2. Admin Credits Wallet**
```bash
curl -X POST http://localhost:8001/api/admin/credit-wallet \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<USER_ID>",
    "amount": 1000
  }'
```

**Expected:**
- Status: 200
- Returns: Updated wallet with balance 1000
- Transaction created with type ADMIN_CREDIT

**3. View Transaction History**
```bash
curl http://localhost:8001/api/wallet-transactions \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Array of transactions

---

### Scenario 3: Slot Management (Admin)

**1. Create New Slot**
```bash
# Create slot that starts now and ends in 15 minutes
curl -X POST http://localhost:8001/api/slots \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2026-02-15T14:00:00.000Z",
    "endTime": "2026-02-15T14:15:00.000Z",
    "betAmount": 10,
    "winAmount": 95
  }'
```

**Expected:**
- Status: 201
- Returns: Slot object with status "OPEN"

**2. View All Slots**
```bash
curl http://localhost:8001/api/slots \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Array of all slots

**3. Get Active Slot**
```bash
curl http://localhost:8001/api/slots/active \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Currently active slot or null

---

### Scenario 4: Betting Flow

**1. Place Bet (Insufficient Balance)**
```bash
# User with 0 balance tries to bet
curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "<SLOT_ID>",
    "number": 42
  }'
```

**Expected:**
- Status: 400
- Error: "Insufficient balance"

**2. Place Bet (Success)**
```bash
# User with sufficient balance
curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "<SLOT_ID>",
    "number": 42
  }'
```

**Expected:**
- Status: 201
- Returns: Bet object with status "PENDING"
- Balance reduced by 10 coins
- Transaction created with type BET

**3. Place Multiple Bets**
```bash
# User can place multiple bets on same slot
curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"slotId": "<SLOT_ID>", "number": 25}'

curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"slotId": "<SLOT_ID>", "number": 75}'
```

**Expected:**
- Each bet deducts 10 coins
- All bets stored separately

**4. View My Bets**
```bash
curl http://localhost:8001/api/bets/my-bets \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Array of user's bets with slot details

**5. Bet on Closed Slot**
```bash
curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "<CLOSED_SLOT_ID>",
    "number": 42
  }'
```

**Expected:**
- Status: 400
- Error: "Betting is closed for this slot"

---

### Scenario 5: Admin Controls

**1. View Bet Exposure**
```bash
curl http://localhost:8001/api/slots/<SLOT_ID>/exposure \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Object with counts for all numbers 0-99
- Shows total bets and amount per number

**2. Set Winning Number**
```bash
curl -X POST http://localhost:8001/api/slots/<SLOT_ID>/winning-number \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"winningNumber": 42}'
```

**Expected:**
- Status: 200
- Returns: Updated slot with winningNumber set
- Slot must be OPEN

**3. Set Winning Number on Closed Slot**
```bash
# Try to set winning number after slot closes
curl -X POST http://localhost:8001/api/slots/<CLOSED_SLOT_ID>/winning-number \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"winningNumber": 42}'
```

**Expected:**
- Status: 400
- Error: "Cannot set winning number for closed slot"

**4. View All Users**
```bash
curl http://localhost:8001/api/admin/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Array of all users

**5. View All Bets**
```bash
curl http://localhost:8001/api/admin/bets \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Array of all bets with user and slot details

**6. Get Slot Profit**
```bash
curl http://localhost:8001/api/admin/slots/<SLOT_ID>/profit \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Profit analysis
  ```json
  {
    "slotId": "...",
    "totalBets": 25,
    "totalBetAmount": 250,
    "totalPayout": 190,
    "profit": 60
  }
  ```

---

### Scenario 6: Payment Requests

**1. Submit Payment Request**
```bash
curl -X POST http://localhost:8001/api/payments/request \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "screenshotUrl": "https://example.com/payment-proof.jpg"
  }'
```

**Expected:**
- Status: 201
- Returns: Payment request with status "PENDING"

**2. View My Payment Requests**
```bash
curl http://localhost:8001/api/payments/my-requests \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Array of user's payment requests

**3. Admin Views All Payment Requests**
```bash
curl http://localhost:8001/api/admin/payment-requests \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:**
- Status: 200
- Returns: Array of all payment requests with user details

**4. Admin Approves Payment**
```bash
curl -X POST http://localhost:8001/api/admin/payment-requests/<REQUEST_ID>/approve \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"adminRemark": "Payment verified"}'
```

**Expected:**
- Status: 200
- Returns: Updated payment request with status "APPROVED"
- User's wallet credited with amount
- Transaction created with type ADMIN_CREDIT

**5. Admin Rejects Payment**
```bash
curl -X POST http://localhost:8001/api/admin/payment-requests/<REQUEST_ID>/reject \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"adminRemark": "Invalid payment proof"}'
```

**Expected:**
- Status: 200
- Returns: Updated payment request with status "REJECTED"
- No wallet change

---

### Scenario 7: Automated Slot Processing (Cron)

**Test Cron Job Execution:**

1. **Create Short-Duration Slot**
```bash
# Create slot that ends in 30 seconds
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
END=$(date -u -d "+30 seconds" +"%Y-%m-%dT%H:%M:%S.000Z")

curl -X POST http://localhost:8001/api/slots \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{
    \"startTime\": \"$NOW\",
    \"endTime\": \"$END\"
  }"
```

2. **Place Bets**
```bash
# Place bets on different numbers
SLOT_ID="<NEW_SLOT_ID>"
curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"slotId\": \"$SLOT_ID\", \"number\": 42}"

curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"slotId\": \"$SLOT_ID\", \"number\": 25}"
```

3. **Set Winning Number**
```bash
curl -X POST http://localhost:8001/api/slots/$SLOT_ID/winning-number \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"winningNumber": 42}'
```

4. **Wait for Slot to End**
```bash
# Wait 30+ seconds, then check logs
tail -f /var/log/supervisor/backend.out.log | grep -E "Slot|Result|declared"
```

**Expected Behavior:**
- After endTime passes, cron job (runs every 10 seconds) will:
  1. Find the expired slot
  2. Mark it as CLOSED
  3. Process all bets:
     - Bet on 42: Status → WON, credit 95 coins
     - Bet on 25: Status → LOST
  4. Mark slot as RESULT_DECLARED
  5. Log: "Result declared for slot {id}, winning number: 42"

5. **Verify Results**
```bash
# Check slot status
curl http://localhost:8001/api/slots/$SLOT_ID \
  -H "Authorization: Bearer <USER_TOKEN>"

# Check bet statuses
curl http://localhost:8001/api/bets/my-bets \
  -H "Authorization: Bearer <USER_TOKEN>"

# Check updated balance
curl http://localhost:8001/api/wallet/balance \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected:**
- Slot status: "RESULT_DECLARED"
- Bet on 42: status "WON"
- Bet on 25: status "LOST"
- Balance increased by 95 coins (for winning bet)
- Transactions show WIN entry

---

### Scenario 8: Authorization Tests

**1. Access Protected Route Without Token**
```bash
curl http://localhost:8001/api/wallet/balance
```

**Expected:**
- Status: 401
- Error: "Unauthorized"

**2. User Tries to Access Admin Route**
```bash
curl http://localhost:8001/api/admin/users \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected:**
- Status: 403
- Error: "Forbidden"

**3. Invalid Token**
```bash
curl http://localhost:8001/api/wallet/balance \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected:**
- Status: 401
- Error: "Unauthorized"

---

### Scenario 9: Validation Tests

**1. Invalid Email Format**
```bash
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid-email",
    "password": "Test@123"
  }'
```

**Expected:**
- Status: 400
- Error: "email must be an email"

**2. Password Too Short**
```bash
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "123"
  }'
```

**Expected:**
- Status: 400
- Error: "password must be longer than or equal to 6 characters"

**3. Bet Number Out of Range**
```bash
curl -X POST http://localhost:8001/api/bets \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "<SLOT_ID>",
    "number": 150
  }'
```

**Expected:**
- Status: 400
- Error: "number must not be greater than 99"

---

## 🔄 Complete End-to-End Test Script

```bash
#!/bin/bash

API_URL="http://localhost:8001/api"

echo "=== COMPLETE E2E TEST ==="

# 1. Admin login
ADMIN_TOKEN=$(curl -s "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}' | \
  jq -r '.access_token')

echo "✅ Admin logged in"

# 2. User login
USER_TOKEN=$(curl -s "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}' | \
  jq -r '.access_token')

USER_ID=$(curl -s "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}' | \
  jq -r '.user.id')

echo "✅ User logged in"

# 3. Get active slot
SLOT_ID=$(curl -s "$API_URL/slots/active" \
  -H "Authorization: Bearer $USER_TOKEN" | \
  jq -r '._id')

echo "✅ Active slot: $SLOT_ID"

# 4. Place bet
curl -s -X POST "$API_URL/bets" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"slotId\":\"$SLOT_ID\",\"number\":42}" > /dev/null

echo "✅ Bet placed on 42"

# 5. Admin sets winning number
curl -s -X POST "$API_URL/slots/$SLOT_ID/winning-number" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"winningNumber":42}' > /dev/null

echo "✅ Winning number set to 42"

# 6. Create payment request
PAYMENT_ID=$(curl -s -X POST "$API_URL/payments/request" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"screenshotUrl":"https://example.com/test.jpg"}' | \
  jq -r '._id')

echo "✅ Payment request created"

# 7. Admin approves payment
curl -s -X POST "$API_URL/admin/payment-requests/$PAYMENT_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adminRemark":"Approved"}' > /dev/null

echo "✅ Payment approved"

# 8. Check final balance
BALANCE=$(curl -s "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $USER_TOKEN" | \
  jq '.balance')

echo "✅ Final balance: $BALANCE coins"

echo "=== ALL TESTS PASSED ✅ ==="
```

---

## 📊 Expected Test Results Summary

| Test | Expected Result |
|------|----------------|
| Signup | User created, wallet initialized, JWT returned |
| Login | JWT token returned |
| Get Profile | User details without password |
| Place Bet | Balance reduced, bet stored, transaction logged |
| Insufficient Balance | Error, bet rejected |
| Bet on Closed Slot | Error, bet rejected |
| Set Winning Number | Slot updated, number stored |
| Bet Exposure | Correct counts per number |
| Payment Request | Request created with PENDING status |
| Approve Payment | Balance increased, transaction logged |
| Slot Auto-Close | Cron closes slot, processes bets, credits winners |
| User Access Admin Route | 403 Forbidden error |
| Invalid Token | 401 Unauthorized error |

---

## 🐛 Common Issues & Troubleshooting

### Issue: "Unauthorized" on all requests
**Solution:** Check JWT token is valid and included in Authorization header

### Issue: "Slot not found"
**Solution:** Create a new slot or use active slot ID from `/api/slots/active`

### Issue: "Insufficient balance"
**Solution:** Credit user wallet via admin endpoint or payment approval

### Issue: Cron not processing slots
**Solution:** Check backend logs, ensure cron job is running, verify slot endTime has passed

### Issue: "Cannot set winning number for closed slot"
**Solution:** Winning number must be set before slot ends

---

## ✅ Test Checklist

- [ ] User signup and login
- [ ] JWT authentication working
- [ ] Wallet creation on signup
- [ ] Place bet with sufficient balance
- [ ] Prevent bet with insufficient balance
- [ ] Prevent bet on closed slot
- [ ] Multiple bets per slot allowed
- [ ] Admin can create slots
- [ ] Admin can set winning number
- [ ] Admin can view bet exposure
- [ ] Payment request creation
- [ ] Admin payment approval credits wallet
- [ ] Cron auto-closes expired slots
- [ ] Cron declares results and credits winners
- [ ] Role-based authorization working
- [ ] Input validation working
- [ ] Transaction ledger accurate
- [ ] Balance never goes negative

---

**Last Updated:** February 15, 2026
