# 🚀 Mini WhatsApp Clone - Backend Service

![NodeJS](https://img.shields.io/badge/Node.js-20.x-green) ![Express](https://img.shields.io/badge/Express-4.x-lightgrey) ![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black) ![Prisma](https://img.shields.io/badge/ORM-Prisma-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

Backend service web chat real-time. Dibangun dengan pendekatan **Hybrid Architecture** yang menggabungkan efisiensi REST API untuk manajemen data historis dan kecepatan WebSocket (Socket.io) untuk komunikasi real-time.

Mengimplementasikan **Repository Pattern** dan **Service Layer** untuk memastikan kode yang bersih (*Clean Code*), mudah di-maintain, dan *testable*.

---

## 🛠️ Tech Stack

* **Runtime Environment:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Real-time Engine:** [Socket.io](https://socket.io/) (WebSockets)
* **Database:** MySQL
* **ORM:** [Prisma](https://www.prisma.io/)
* **Authentication:** JWT (JSON Web Token)
* **Testing:** Supertest & Jest

---

## 📂 Project Structure

Project ini mengikuti struktur **Layered Architecture** untuk memisahkan *concern* logic aplikasi.

```bash
src/
├── application/    # Setup database & express app instance
├── controllers/    # Handle HTTP Requests (REST API)
├── middleware/     # Auth & Error Handling
├── repositories/   # Data Access Layer (Direct DB calls via Prisma)
├── routes/         # API Routing definition
├── services/       # Business Logic Layer (Complex logic lives here)
├── sockets/        # Socket.io Event Handlers
│   ├── message-socket.js
│   ├── room-socket.js
│   └── participant-socket.js
└── utils/          # Helper functions (e.g., Socket Wrapper)
|__ validation/     # Validation at prisma for login and registration
├── .env.example         # Environment variables template
├── package.json
└── README.md
```
## ✨ Key Features

### 1. Hybrid Communication System ⚡
* **REST API**: Used for heavy-lifting data operations such as:
  - Message History with Cursor-based Pagination
  - Authentication & Authorization
  - User Search
* **Socket.io**: Used for instant events such as:
  - New Message notifications
  - Typing Indicators
  - Online/Offline Status
  - Real-time Group Invites

### 2. Room Management 👥
* **Private Chat**: Secure 1-on-1 messaging
* **Group Chat**: Featured group management including:
  - Admin privileges
  - Promote members to admin
  - Kick members
  - Invite friends

### 3. Reliability & Integrity 🛡️
* **Database Transactions**: Ensures data consistency during complex operations like group creation or message sending
* **Socket Acknowledgement**: Guarantees server readiness before client sends data
* **Online/Offline Status**: Real-time user status detection on connect/disconnect

---

## 🔌 API Reference (REST)

Used for initial data loading and standard HTTP requests.

### Authentication & Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Register new user |
| `POST` | `/api/login` | Login & get JWT Token |
| `GET`  | `/api/users`  | Search users (Query param: `?name=username`) |

### Messaging & Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/room/:roomId/message` | Load message history (Cursor Pagination) |

---
## 📝 API Examples

### Register User
```bash
POST http://localhost:3000/api/users \
"Content-Type: application/json" \
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
```

### Login
```bash
POST http://localhost:3000/api/login \
  "Content-Type: application/json" \
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
```

### Search Users
```bash
GET "http://localhost:3000/api/users?name=john" \
  Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📡 Socket.io Events Documentation

### 1. Client Emits (Frontend -> Server)
Events sent by client to trigger actions on the server.

| Event Name | Payload (Data sent) | Description |
| :--- | :--- | :--- |
| `join room` | `roomId` (Int/String) | Join a specific room to start listening for messages. |
| `create room` | `string` (Group Name) | Create a new group. |
| `invite to group` | `roomId`, `userIds[]` | Invite one or more users to the group. |
| `send message` | `{ roomId, text }` | Send a text message to the room. |
| `edit message` | `roomId`, `messageId`, `newText` | Edit a previously sent message. |
| `delete message` | `roomId`, `messageId` | Delete a message (soft delete). |
| `promote new admin` | `targetUserId`, `roomId` | Promote another member to group admin. |
| `leave group` | `roomId` | Leave the group chat. |

---

### 2. Client Listens (Server -> Frontend)
Events that Frontend should listen to for real-time UI updates.

#### A. Success Responses & Broadcasts

| Event Name | Structure Data (Response) | Description |
| :--- | :--- | :--- |
| **`room created`** | ```json { "roomId": 101, "name": "Squad Goals", "adminId": 55 } ``` | Received after successfully creating a group. |
| **`invite success`** | ```json { "roomId": 101, "addedMembers": count members, membersData: [ __"id members"__ ] } ``` | Confirmation that friends were successfully invited. |
| **`new message`** | ```json { "messageId": 505, "text": "Hey there!", "senderId": 99,"senderName": "Kurokawa" ,"roomId": 101, "createdAt": "...", "messageId": 12} ``` | **IMPORTANT:** Broadcast of new message from others. Append to chat list. |
| **`message edited`** | ```json { "messageId": 505, "text": "Hey (Edited)", "senderId": 99,"isEdited": true, "roomId": 101 } ``` | Update the message text in UI with the new text. |
| **`message deleted`** | ```json { "messageId": 505, "roomId": 101 } ``` | Remove this message from UI or replace text with *"Message deleted"*. |
| **`promote new admin success`** | ```json { "roomId": 101, "userId": 77, "userName": "Kurokawa", "userRole": 'ADMIN' } ``` | Update member list UI (add admin badge to that user). |
| **`leave group success`** | ```json { "roomId": 101, "userId": 55, "leftAt": XXXXXXX } ``` | Remove room from chat list (if yourself) or show "User left" notification (if someone else). |
| **`user status change`** | ```json { "userId": 88, "status": "ONLINE" or "OFFLINE", IF offline += "lastSeen": "xxxx" } ``` | Update user's online/offline status in real-time. |

#### B. Error Handling
Server sends these events when logical or validation errors occur.

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `roomError` | `{ message: "based on error" }` | Error related to room/group operations. |
| `messageError` | `{ message: "based on error" }` | Error when sending/editing/deleting messages. |
| `invite error` | `{ message: "User already in group" }` | Failed to invite friend. |
| `participantError` | `{ message: based on error }` | Error related to participant features. |
| `error` | `{ message: "Internal Server Error" }` | General error (500). |


