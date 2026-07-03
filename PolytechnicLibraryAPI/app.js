require("dotenv").config();
const express = require("express");

const authController = require("./controllers/authController");
const bookController = require("./controllers/bookController");
const { verifyJWT } = require("./middlewares/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ---------- Public (no token needed) ----------
app.post("/register", authController.register);
app.post("/login", authController.login);

// ---------- Protected (JWT + role checked in verifyJWT) ----------
app.get("/books", verifyJWT, bookController.getAllBooks);
app.put("/books/:bookId/availability", verifyJWT, bookController.updateAvailability);

app.listen(PORT, () => {
  console.log(`Polytechnic Library API running on http://localhost:${PORT}`);
});
