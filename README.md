
# 🗨️ Mini Team Chat App  
A real-time multi-user chat application featuring channels, authentication, message history, typing indication and online presence — built using **React + TypeScript + Node.js + WebSockets + Prisma + JWT**.

---

## 🚀 Features

| Feature | Status |
|--------|--------|
| User registration + login (JWT Auth) | ✅ |
| Real-time chat with Socket.IO | ✅ |
| Channels (#general by default) | ✔️ |
| Online user presence indicator | ⚙️ (base implemented) |
| Message history storage using Prisma | ⚙️ |
| Frontend UI (Vite + Tailwind) | ⚙️ functional layout |
| Future: Private DMs, file sharing, notifications | 🔜 |

---

## 🏗 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React + TypeScript + Vite + Tailwind |
| Backend | Node.js + Express + TypeScript |
| Realtime | Socket.IO |
| Database | Prisma ORM + SQLite (swappable to Postgres) |
| Auth | JWT Token-based Authentication |

---

## 📂 Folder Structure

```
team-chat-app/
│── backend/ ─ Express + SocketIO + Prisma
│── frontend/ ─ React + Zustand + Tailwind
│── prisma/ ─ Database models
└── README.md
```

---

## 🔧 Installation

Clone the repository:
```bash
git clone https://github.com/dhawalsarode/team-chat-app.git
cd team-chat-app
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open app → **http://localhost:5173**

---

## 🔮 Future Improvements

- Channel creation UI
- Private chats / DMs
- File uploads & media messages
- Message search & filters
- Online user list with avatars
- Proper refresh token rotation

---

## 📄 License  
MIT — free to modify and improve.

---
