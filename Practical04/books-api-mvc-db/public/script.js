// Get references to the HTML elements you'll interact with:
const booksListDiv = document.getElementById("booksList");
const fetchBooksBtn = document.getElementById("fetchBooksBtn");
const messageDiv = document.getElementById("message"); // Get reference to the message div
const apiBaseUrl = "http://localhost:3000";

// Function to fetch books from the API and display them
async function fetchBooks() {
  try {
    booksListDiv.innerHTML = "Loading books..."; // Show loading state
    messageDiv.textContent = ""; // Clear any previous messages (assuming a message div exists or add one)

    // Make a GET request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/books`);

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      // Attempt to read error body if available, otherwise use status text
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    // Parse the JSON response
    const books = await response.json();

    // Clear previous content and display books
    booksListDiv.innerHTML = ""; // Clear loading message
    if (books.length === 0) {
      booksListDiv.innerHTML = "<p>No books found.</p>";
    } else {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        // Use data attributes or similar to store ID on the element if needed later
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>ID: ${book.id}</p>
                    <button onclick="viewBookDetails(${book.id})">View Details</button>
                    <button onclick="editBook(${book.id})">Edit</button>
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
                `;
        booksListDiv.appendChild(bookElement);
      });
      // Add event listeners for delete buttons after they are added to the DOM
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    booksListDiv.innerHTML = `<p style="color: red;">Failed to load books: ${error.message}</p>`;
  }
}

// Placeholder functions for other actions (to be implemented later or in other files)
// View a single book via GET /books/:id (Topic 6 pattern, single-book variant)
async function viewBookDetails(bookId) {
  console.log("View details for book ID:", bookId);
  messageDiv.textContent = "Loading book details...";
  messageDiv.style.color = "black";

  try {
    // GET (no options object) — default method
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    // response.json() returns the parsed body (a single book object)
    const book = await response.json();
    messageDiv.innerHTML = `<strong>Book Details:</strong> ID ${book.id} — "${book.title}" by ${book.author}`;
    messageDiv.style.color = "blue";
  } catch (error) {
    console.error("Error fetching book details:", error);
    messageDiv.textContent = `Failed to load book details: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

function editBook(bookId) {
  console.log("Edit book with ID:", bookId);
  // In a real app, redirect to edit.html with the book ID
  window.location.href = `edit.html?id=${bookId}`; // Assuming you create edit.html
}

// Delete a book via DELETE /books/:id (Topic 9 pattern)
async function handleDeleteClick(event) {
  const bookId = event.target.getAttribute("data-id");
  console.log("Attempting to delete book with ID:", bookId);

  // confirm() gate — only fire the request if the user clicks OK
  if (!confirm(`Are you sure you want to delete book with ID ${bookId}?`)) {
    return;
  }

  try {
    // DELETE has no body and no Content-Type — the ID goes in the URL
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      // 204 No Content = success, nothing to parse — remove the card from the DOM
      const bookElement = document.querySelector(
        `.book-item[data-book-id="${bookId}"]`
      );
      if (bookElement) bookElement.remove();
      messageDiv.textContent = `Book ${bookId} deleted successfully.`;
      messageDiv.style.color = "green";
    } else if (response.status === 404) {
      messageDiv.textContent = `Book ${bookId} not found.`;
      messageDiv.style.color = "red";
    } else {
      // Some other error — read body and throw
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    messageDiv.textContent = `Failed to delete book: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Fetch books when the button is clicked
fetchBooksBtn.addEventListener("click", fetchBooks);

// Optionally, fetch books when the page loads
// window.addEventListener('load', fetchBooks); // Or call fetchBooks() directly
