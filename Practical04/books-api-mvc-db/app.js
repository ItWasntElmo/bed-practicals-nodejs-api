const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
// Load environment variables
dotenv.config();

const bookController = require("./controllers/bookController");
const {
  validateBook,
  validateBookId,
} = require("./middlewares/bookValidation"); // import Book Validation Middleware
const userController = require("./controllers/userController");
const {
  validateUser,
  validateUserId,
} = require("./middlewares/userValidation"); // import User Validation Middleware

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---

// --- Serve static files from the 'public' directory ---
// When a request comes in for a static file (like /index.html, /styles.css, /script.js),
// Express will look for it in the 'public' folder relative to the project root.
app.use(express.static(path.join(__dirname, "public")));

// Routes for books
// Apply middleware *before* the controller function for routes that need it
app.get("/books", bookController.getAllBooks);
app.get("/books/:id", validateBookId, bookController.getBookById); // Use validateBookId middleware
app.post("/books", validateBook, bookController.createBook); // Use validateBook middleware
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook); // Validate ID and body
app.delete("/books/:id", validateBookId, bookController.deleteBook); // Validate ID

// Routes for users
// NOTE: /search and /with-books must stay ABOVE /users/:id, or ":id" swallows them
app.get("/users/search", userController.searchUsers);
app.get("/users/with-books", userController.getUsersWithBooks);
app.post("/users", validateUser, userController.createUser); // Validate body
app.get("/users", userController.getAllUsers);
app.get("/users/:id", validateUserId, userController.getUserById); // Validate ID
app.put("/users/:id", validateUserId, validateUser, userController.updateUser); // Validate ID and body
app.delete("/users/:id", validateUserId, userController.deleteUser); // Validate ID

// 404 — no route matched
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// General error handler — anything passed to next(err), or thrown in a route,
// ends up here instead of crashing the server. Must be last, and must take 4 args.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});
