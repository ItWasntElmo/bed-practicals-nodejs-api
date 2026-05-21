// Edit student page — GET /students/:id + PUT /students/:id (Topic 8 pattern)

const editStudentForm = document.getElementById("editStudentForm");
const loadingMessageDiv = document.getElementById("loadingMessage");
const messageDiv = document.getElementById("message");
const studentIdInput = document.getElementById("studentId");
const editNameInput = document.getElementById("editName");
const editAddressInput = document.getElementById("editAddress");

const apiBaseUrl = "http://localhost:3001";

function getStudentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchStudentData(studentId) {
  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`);

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

    return await response.json();
  } catch (error) {
    console.error("Error fetching student data:", error);
    messageDiv.textContent = `Failed to load student data: ${error.message}`;
    messageDiv.style.color = "red";
    loadingMessageDiv.textContent = "";
    return null;
  }
}

function populateForm(student) {
  studentIdInput.value = student.student_id;
  editNameInput.value = student.name;
  editAddressInput.value = student.address;
  loadingMessageDiv.style.display = "none";
  editStudentForm.style.display = "block";
}

// --- Page load: read id, fetch, populate ---

const studentIdToEdit = getStudentIdFromUrl();

if (studentIdToEdit) {
  fetchStudentData(studentIdToEdit).then((student) => {
    if (student) {
      populateForm(student);
    } else {
      loadingMessageDiv.textContent = "Student not found or failed to load.";
      messageDiv.textContent = "Could not find the student to edit.";
      messageDiv.style.color = "red";
    }
  });
} else {
  loadingMessageDiv.textContent = "No student ID specified for editing.";
  messageDiv.textContent =
    "Please provide a student ID in the URL (e.g., edit-student.html?id=1).";
  messageDiv.style.color = "orange";
}

// --- Submit: PUT /students/:id ---

editStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  messageDiv.textContent = "";

  const studentId = studentIdInput.value;
  const updatedStudentData = {
    name: editNameInput.value,
    address: editAddressInput.value,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudentData),
    });

    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 200) {
      messageDiv.textContent = `Student updated successfully! Redirecting...`;
      messageDiv.style.color = "green";
      console.log("Updated Student:", responseBody);
      setTimeout(() => {
        window.location.href = "students.html";
      }, 1000);
    } else if (response.status === 400) {
      messageDiv.textContent = `Validation Error: ${responseBody.message}`;
      messageDiv.style.color = "red";
    } else if (response.status === 404) {
      messageDiv.textContent = `Student ${studentId} not found.`;
      messageDiv.style.color = "red";
    } else {
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message}`
      );
    }
  } catch (error) {
    console.error("Error updating student:", error);
    messageDiv.textContent = `Failed to update student: ${error.message}`;
    messageDiv.style.color = "red";
  }
});
