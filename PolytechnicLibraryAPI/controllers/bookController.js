const bookModel = require("../models/bookModel");

// GET /books — list all books (members + librarians)
async function getAllBooks(req, res) {
  try {
    const books = await bookModel.getAllBooks();
    return res.status(200).json(books);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /books/:bookId/availability — set 'Y' / 'N' (librarian only, enforced by middleware)
async function updateAvailability(req, res) {
  const bookId = parseInt(req.params.bookId);
  const { availability } = req.body;
  try {
    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }
    if (availability !== "Y" && availability !== "N") {
      return res.status(400).json({ message: "availability must be 'Y' or 'N'" });
    }

    const updated = await bookModel.updateBookAvailability(bookId, availability);
    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({ message: "Availability updated", book: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getAllBooks, updateAvailability };
