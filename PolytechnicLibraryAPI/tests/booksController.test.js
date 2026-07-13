// booksController.test.js — unit tests for the book controller (Practical 09 Part A, step 2)
const bookController = require("../controllers/bookController");
const Book = require("../models/bookModel");

// Mock the Book model so the controller is tested in isolation from the database
jest.mock("../models/bookModel");

// Build a fake res whose methods are chainable, like Express's real res
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("bookController.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all books and return them as JSON with status 200", async () => {
    const mockBooks = [
      { book_id: 1, title: "The Lord of the Rings", author: "J.R.R. Tolkien", availability: "Y" },
      { book_id: 2, title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", availability: "N" },
    ];
    Book.getAllBooks.mockResolvedValue(mockBooks);

    const req = {};
    const res = mockRes();

    await bookController.getAllBooks(req, res);

    expect(Book.getAllBooks).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBooks);
  });

  it("should return 500 when the model throws", async () => {
    Book.getAllBooks.mockRejectedValue(new Error("Database error"));

    const req = {};
    const res = mockRes();

    await bookController.getAllBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("bookController.updateAvailability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update availability and return the updated book", async () => {
    const updatedBook = { book_id: 1, title: "The Lord of the Rings", author: "J.R.R. Tolkien", availability: "N" };
    Book.updateBookAvailability.mockResolvedValue(updatedBook);

    const req = { params: { bookId: "1" }, body: { availability: "N" } };
    const res = mockRes();

    await bookController.updateAvailability(req, res);

    expect(Book.updateBookAvailability).toHaveBeenCalledWith(1, "N");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Availability updated", book: updatedBook });
  });

  it("should return 400 when the book id is not a number", async () => {
    const req = { params: { bookId: "abc" }, body: { availability: "Y" } };
    const res = mockRes();

    await bookController.updateAvailability(req, res);

    expect(Book.updateBookAvailability).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid book id" });
  });

  it("should return 400 when availability is not 'Y' or 'N'", async () => {
    const req = { params: { bookId: "1" }, body: { availability: "MAYBE" } };
    const res = mockRes();

    await bookController.updateAvailability(req, res);

    expect(Book.updateBookAvailability).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "availability must be 'Y' or 'N'" });
  });

  it("should return 404 when the book does not exist", async () => {
    Book.updateBookAvailability.mockResolvedValue(null);

    const req = { params: { bookId: "999" }, body: { availability: "Y" } };
    const res = mockRes();

    await bookController.updateAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
  });

  it("should return 500 when the model throws", async () => {
    Book.updateBookAvailability.mockRejectedValue(new Error("Database error"));

    const req = { params: { bookId: "1" }, body: { availability: "Y" } };
    const res = mockRes();

    await bookController.updateAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});
