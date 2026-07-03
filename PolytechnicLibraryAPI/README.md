# Practical 7 & 8 — Polytechnic Library API

A secure REST API for a polytechnic library, built with **Node.js + Express + Microsoft SQL Server**, using **bcryptjs** for password hashing and **JWT** (jsonwebtoken) for authentication & role-based authorization.

## Roles
- **member** — can view books
- **librarian** — can view books **and** update a book's availability

## Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | public | Register a user (`username`, `password`, `role`) — password is bcrypt-hashed |
| POST | `/login` | public | Log in; returns a JWT token |
| GET | `/books` | member + librarian | List all books (JWT required) |
| PUT | `/books/:bookId/availability` | librarian only | Set availability to `Y`/`N` (JWT + role required) |

Protected requests must send the token in the header: `Authorization: Bearer <token>`

## Setup
1. `npm install`
2. Copy the connection settings into a `.env` file (see the variables in `dbConfig.js`): `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_DATABASE`, `DB_PORT`, `PORT`, `JWT_SECRET`.
3. In SSMS (or sqlcmd), run `database/schema.sql` — it creates the `polytechnic_library` database, the `Users` + `Books` tables, and seeds some books.
4. `npm start` → API runs on `http://localhost:3001`.

## Project structure
```
PolytechnicLibraryAPI/
├── app.js                 # Express entry point + routes
├── dbConfig.js            # SQL Server connection (from .env)
├── database/schema.sql    # DB + tables + seed books
├── models/                # userModel.js, bookModel.js (DB access)
├── controllers/           # authController.js (register/login), bookController.js
└── middlewares/           # authMiddleware.js (verifyJWT + role check)
```

## Dependencies
- `express`, `mssql`, `bcryptjs`, `jsonwebtoken`, `dotenv`
