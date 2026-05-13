const express = require("express");
const sql = require("mssql"); // Assuming you've installed mssql
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

app.use(express.json()); // middleware inbuilt in express to recognize the incoming Request Object as a JSON Object.
app.use(express.urlencoded()); // middleware inbuilt in express to recognize the incoming Request Object as strings or arrays

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});

// --- GET Routes ---

// GET all students
app.get("/students", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT student_id, name, address FROM Students`;
    const request = connection.request();
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /students:", error);
    res.status(500).send("Error retrieving students");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// GET student by ID
app.get("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @id`;
    const request = connection.request();
    request.input("id", studentId);
    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Student not found");
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /students/${studentId}:`, error);
    res.status(500).send("Error retrieving student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- POST Route ---

// POST create new student
app.post("/students", async (req, res) => {
  const newStudentData = req.body; // { name, address }

  // **WARNING:** No validation is performed here. Invalid data may cause database errors.

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `INSERT INTO Students (name, address) VALUES (@name, @address); SELECT SCOPE_IDENTITY() AS student_id;`;
    const request = connection.request();
    request.input("name", newStudentData.name);
    request.input("address", newStudentData.address);
    const result = await request.query(sqlQuery);

    const newStudentId = result.recordset[0].student_id;

    // Re-fetch the newly created student to return it
    const getNewStudentQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @id`;
    const getNewStudentRequest = connection.request();
    getNewStudentRequest.input("id", newStudentId);
    const newStudentResult = await getNewStudentRequest.query(getNewStudentQuery);

    res.status(201).json(newStudentResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).send("Error creating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- PUT Route ---

// PUT update existing student
app.put("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }
  const updatedStudentData = req.body; // { name, address }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `UPDATE Students SET name = @name, address = @address WHERE student_id = @id`;
    const request = connection.request();
    request.input("id", studentId);
    request.input("name", updatedStudentData.name);
    request.input("address", updatedStudentData.address);
    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }

    // Re-fetch the updated student to return it
    const getUpdatedStudentQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @id`;
    const getUpdatedStudentRequest = connection.request();
    getUpdatedStudentRequest.input("id", studentId);
    const updatedStudentResult = await getUpdatedStudentRequest.query(getUpdatedStudentQuery);

    res.status(200).json(updatedStudentResult.recordset[0]);
  } catch (error) {
    console.error(`Error in PUT /students/${studentId}:`, error);
    res.status(500).send("Error updating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- DELETE Route ---

// DELETE remove existing student
app.delete("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `DELETE FROM Students WHERE student_id = @id`;
    const request = connection.request();
    request.input("id", studentId);
    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(`Error in DELETE /students/${studentId}:`, error);
    res.status(500).send("Error deleting student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});
