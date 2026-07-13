const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
// Load environment variables
dotenv.config();

const studentController = require("./controllers/studentController");
const {
  validateStudent,
  validateStudentId,
} = require("./middlewares/studentValidation"); // import Student Validation Middleware

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Serve static files from the 'public' directory ---
app.use(express.static(path.join(__dirname, "public")));

// Routes for students
// Apply middleware *before* the controller function for routes that need it
app.get("/students", studentController.getAllStudents);
app.get("/students/:id", validateStudentId, studentController.getStudentById);
app.post("/students", validateStudent, studentController.createStudent);
app.put(
  "/students/:id",
  validateStudentId,
  validateStudent,
  studentController.updateStudent
);
app.delete(
  "/students/:id",
  validateStudentId,
  studentController.deleteStudent
);

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
