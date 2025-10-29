# 🗒️ Node Journal

A minimalist, local-first journaling app built with **Node.js**, **Express**, and **Prisma (SQLite)**. Features a secure **HTTPS dev server**, a clean vanilla JavaScript frontend, and a complete **CRUD** API.

---- 

## ✨ Features
- ✅ **Write, edit, and delete** daily journal entries
- 🕓 One entry per day (auto-created on first load)
- 💾 Stored locally using **SQLite** through Prisma ORM
- 🔐 HTTPS-ready local dev environment via **mkcert**
- ⚡ Clean vanilla JS frontend, no frameworks
- 🧠 Fully self-contained — zero external dependencies beyond npm packages

---- 

## 🧩 Stack

| Layer             | Tech                    | Purpose                                             |
| ----------------- | ----------------------- | --------------------------------------------------- |
| **Backend**       | Node.js + Express       | RESTful API routes (`GET`, `POST`, `PUT`, `DELETE`) |
| **ORM**           | Prisma                  | Data modeling and migrations with SQLite            |
| **Frontend**      | Vanilla JavaScript      | Fetch API for CRUD operations                       |
| **Security**      | Helmet + HTTPS (mkcert) | Safe local development environment                  |
| **Logging**       | pino-http               | Lightweight structured logs                         |
| **Rate Limiting** | express-rate-limit      | Basic DDoS & brute-force protection                 |

---- 

## ⚙️ Setup

### 1. Clone the repo
	git clone https://github.com/YOUR\_USERNAME/node-journal.git
	cd node-journal

### 2. Install dependencies
	npm install

### 3. Initialize Prisma & the database
	npx prisma db push

### 4. Generate HTTPS certs
If you haven’t already installed mkcert:

	brew install mkcert
	mkcert -install
	mkdir certs
	mkcert localhost 127.0.0.1 ::1

### 5. Start the server
	npm run dev

Then open:
- HTTPS: https://localhost:8443
- HTTP: http://localhost:8080

---- 

## 🧠 API Reference

| **Method** | **Endpoint**       | **Description**                         |
| ---------- | ------------------ | --------------------------------------- |
| GET        | /api/entries       | List entries (supports ?from / ?to)     |
| GET        | /api/entries/:date | Get entry for YYYY-MM-DD                |
| POST       | /api/entries       | Create entry (one per date)             |
| PUT        | /api/entries/:date | **Create-or-replace** (upsert) an entry |
| DELETE     | /api/entries/:date | Delete entry by date                    |

---- 

## 💡 Development Notes
- The frontend lives in /public (it’s automatically served by Express).
- Each day’s entry is stored as a single row in the SQLite database.
- The server listens on both HTTP (8080) and HTTPS (8443) simultaneously.
- The app uses load() to auto-create or retrieve entries for the current date.
- All network calls use the Fetch API with async/await for clarity.

---- 

## 🧱 Directory Structure

node-journal/
├── prisma/              # Prisma schema and migrations
│   └── schema.prisma
├── public/              # Frontend (HTML, JS, CSS)
│   ├── index.html
│   ├── js/
│   │   └── main.js
│   └── css/
│       └── style.css
├── src/
│   ├── db.js            # Prisma client instance
│   └── server.js        # Express app and API routes
├── certs/               # mkcert local SSL certs
├── package.json
├── .env
└── README.md

---- 

## 🧰 Scripts

| **Command**        | **Description**                 |
| ------------------ | ------------------------------- |
| npm run dev        | Start server (nodemon)          |
| npx prisma db push | Apply schema to local SQLite DB |
| npx prisma studio  | Prisma’s visual DB browser      |

---- 

## 🚀 Future Plans

### ✍️ Markdown Support

Render entries with markdown styling using a library like Marked or markdown-it, allowing headers, lists, and inline formatting.

### 🧾 PDF Export

Add a server-side or client-side PDF export option (e.g. html-pdf or pdf-lib) to archive entries or export monthly collections.

### 👤 User Authentication

Implement login and multi-user support using JWTs or NextAuth-style session handling.
Optional integration with SQLite or PostgreSQL for multi-user storage.

### ☁️ Sync & Backup

Allow syncing to a remote database or encrypted cloud backup to preserve entries between machines.

### 📱 Mobile-Friendly UI

Add responsive styling and PWA (Progressive Web App) capabilities for offline access.

### 🧠 Search & Tagging

Enable fuzzy search, keyword filtering, and optional tag support for organizing long-term journals.

### 🕵️‍♂️ Encryption

Consider end-to-end encryption using libsodium or crypto APIs for local data privacy.

---- 

## 🛠️ License

MIT © 2025 John Kakuk

---- 

It’s clean, structured, and future-friendly.