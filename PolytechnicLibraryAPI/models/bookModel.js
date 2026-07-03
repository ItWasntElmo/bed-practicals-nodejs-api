const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all books (title, author, availability) — for members + librarians
async function getAllBooks() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection
      .request()
      .query("SELECT book_id, title, author, availability FROM Books ORDER BY book_id");
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Update a book's availability ('Y' / 'N') — librarian only. Returns updated book or null.
async function updateBookAvailability(bookId, availability) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("bookId", sql.Int, bookId);
    request.input("availability", sql.Char(1), availability);
    const result = await request.query(
      `UPDATE Books
       SET availability = @availability
       OUTPUT INSERTED.book_id, INSERTED.title, INSERTED.author, INSERTED.availability
       WHERE book_id = @bookId`
    );
    return result.recordset[0] || null; // null if no book with that id
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getAllBooks, updateBookAvailability };
