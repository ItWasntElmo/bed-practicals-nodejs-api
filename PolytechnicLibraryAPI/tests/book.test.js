// book.test.js — unit tests for the Book model (Practical 09 Part A, step 3)
const Book = require("../models/bookModel");
const sql = require("mssql");

// Mock the mssql library so no real database connection is made
jest.mock("mssql");

// sql.Int / sql.Char are used as parameter types by the model. jest.mock replaces the
// whole module with auto-mocks, so give Char a callable stub — the real one is a factory.
sql.Char = jest.fn(() => "Char");

describe("Book.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all books from the database", async () => {
    const mockBooks = [
      { book_id: 1, title: "The Lord of the Rings", author: "J.R.R. Tolkien", availability: "Y" },
      { book_id: 2, title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", availability: "N" },
    ];

    const mockRequest = {
      query: jest.fn().mockResolvedValue({ recordset: mockBooks }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const books = await Book.getAllBooks();

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(books).toHaveLength(2);
    expect(books[0].book_id).toBe(1);
    expect(books[0].title).toBe("The Lord of the Rings");
    expect(books[0].author).toBe("J.R.R. Tolkien");
    expect(books[0].availability).toBe("Y");
    expect(books[1].book_id).toBe(2);
    expect(books[1].title).toBe("The Hitchhiker's Guide to the Galaxy");
    expect(books[1].author).toBe("Douglas Adams");
    expect(books[1].availability).toBe("N");
  });

  it("should handle errors when retrieving books", async () => {
    sql.connect.mockRejectedValue(new Error("Database Error"));

    await expect(Book.getAllBooks()).rejects.toThrow("Database Error");
  });
});

describe("Book.updateBookAvailability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the availability of a book and return the updated row", async () => {
    const updatedBook = {
      book_id: 1,
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      availability: "N",
    };

    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ recordset: [updatedBook] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await Book.updateBookAvailability(1, "N");

    // the bookId and availability must be bound as parameters, not string-concatenated
    expect(mockRequest.input).toHaveBeenCalledWith("bookId", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith("availability", expect.anything(), "N");
    expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE Books"));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(result).toEqual(updatedBook);
  });

  it("should return null if the book with the given id does not exist", async () => {
    const mockRequest = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValue({ recordset: [] }), // no rows updated
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
    sql.connect.mockResolvedValue(mockConnection);

    const result = await Book.updateBookAvailability(999, "Y");

    expect(result).toBeNull();
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
  });

  it("should handle database errors", async () => {
    sql.connect.mockRejectedValue(new Error("Database Error"));

    await expect(Book.updateBookAvailability(1, "Y")).rejects.toThrow("Database Error");
  });
});
