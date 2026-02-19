# 🎮 Project Walkthrough: Step-by-Step API Guide

Welcome! This guide explains how the backend works, step by step. Imagine you are building the frontend app or testing the system manually. Here is the journey most users will take.

---

## 🚀 Phase 1: Getting Started (Authentication)

Every user needs an account to play.

### 1. **Sign Up** (`POST /api/auth/signup`)
- **Action:** A new user sends their `name`, `email`, and `password`.
- **What happens:** The system creates a user record in the database.
- **Outcome:** The user gets an `access_token` (their digital ID card) and their profile details.

### 2. **Login** (`POST /api/auth/login`)
- **Action:** An existing user sends `email` and `password`.
- **What happens:** The system checks if credentials are correct.
- **Outcome:** If correct, they get a new `access_token`.
- **Note:** This token must be sent in the header of **ALL** other requests as `Authorization: Bearer <token>`.

### 3. **Get Profile** (`GET /api/users/profile`)
- **Action:** The logged-in user asks "Who am I?".
- **Outcome:** The system returns their name, email, role, and ID.

---

## 💰 Phase 2: Managing Money (Wallet)

You can't bet without coins!

### 1. **Check Wallet** (`GET /api/wallet` or `/api/wallet/balance`)
- **Action:** User asks "How much money do I have?".
- **Outcome:** System shows the current `balance`. All new accounts start with 0 (except the test user).

### 2. **Request Money** (`POST /api/payments/request`)
- **Action:** User sends a request saying "I paid you 500 rupees, here is the screenshot URL".
- **Outcome:** The request is saved as `PENDING`. The user's balance **does not change yet**.

### 3. **View My Requests** (`GET /api/payments/my-requests`)
- **Action:** User checks the status of their deposit.
- **Outcome:** They see if the admin has `APPROVED` or `REJECTED` it.

---

## 🎰 Phase 3: The Game (Slots & Betting)

This is the core loop of the application.

### 1. **See Active Slot** (`GET /api/slots/active`)
- **Action:** User asks "Is there a game running right now?".
- **Outcome:**
    - If a slot is `OPEN`, they see the details (Start Time, End Time).
    - If no slot is open, they see `null` and cannot bet.

### 2. **Place a Bet** (`POST /api/bets`)
- **Action:** User picks a number (0-99) and places a bet on the **Active Slot**.
- **What happens:**
    - System checks if the slot is `OPEN`.
    - System checks if user has enough balance (10 coins).
    - **10 coins are deducted immediately.**
    - Bet is saved as `PENDING`.
- **Outcome:** User has a ticket for that number.

### 3. **Review Bets** (`GET /api/bets/my-bets`)
- **Action:** User checks their history.
- **Outcome:** They see their past bets and whether they `WON` or `LOST`.

---

## 👮 Phase 4: Admin Power (Managing the Game)

The game is controlled by an Admin.

### 1. **Create a Slot** (`POST /api/slots`)
- **Action:** Admin sets a `startTime` and `endTime` for a new game round.
- **Outcome:** A new slot is created. When the time comes, it automatically becomes active.

### 2. **Manage Money** (`GET /api/admin/payment-requests`)
- **Action:** Admin sees a list of pending deposit requests.
- **Approve:** (`POST .../approve`) -> User gets the money in their wallet.
- **Reject:** (`POST .../reject`) -> Request is cancelled, no money given.

### 3. **Decide the Winner** (`POST /api/slots/:id/winning-number`)
- **Action:** **CRITICAL STEP.** Before a slot ends, the Admin picks the winning number (e.g., `42`).
- **Outcome:** The system saves this number.

### 4. **Check Risk** (`GET /api/slots/:id/exposure`)
- **Action:** Admin can see how many people bet on each number (0-99).
- **Why?** To see which number would cost the house the most money vs. which would make a profit.

---

## ⚙️ Phase 5: The Automated Engine (Cron Jobs)

Some things happen automatically without anyone clicking a button.

- **Every 10 seconds**, the system checks all `OPEN` slots.
- If a slot's time is up (`endTime` passed):
    - It closes the betting.
    - **If a Winning Number was set:**
        - It checks all bets on that slot.
        - **Winners** (matched number) get **95 coins** added to their wallet immediately.
        - **Losers** get nothing.
        - Slot status becomes `RESULT_DECLARED`.
    - **If NO Winning Number was set:**
        - The slot just closes. No one wins or loses (bets might be stuck or refunded depending on specific logic, usually just closed).

---

## 📝 Summary Workflow

1. **User** Signs Up & Logs In.
2. **User** Requests Money -> **Admin** Approves it.
3. **Admin** Creates a Slot.
4. **User** sees Active Slot -> Places Bet (Money deducted).
5. **Admin** checks "Exposure" -> Picks a Winning Number.
6. **Time runs out** -> System automatically pays Winners.
7. **User** checks Wallet -> Sees winnings!
