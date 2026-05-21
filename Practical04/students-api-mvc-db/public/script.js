// Students list page — GET all + delete + view details + edit redirect

const studentsListDiv = document.getElementById("studentsList");
const fetchStudentsBtn = document.getElementById("fetchStudentsBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3001";

// GET /students — Topic 6 pattern
async function fetchStudents() {
  try {
    studentsListDiv.innerHTML = "Loading students...";
    messageDiv.textContent = "";

    const response = await fetch(`${apiBaseUrl}/students`);

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

    const students = await response.json();

    studentsListDiv.innerHTML = "";
    if (students.length === 0) {
      studentsListDiv.innerHTML = "<p>No students found.</p>";
    } else {
      students.forEach((student) => {
        const studentElement = document.createElement("div");
        studentElement.classList.add("student-item");
        studentElement.setAttribute("data-student-id", student.student_id);
        studentElement.innerHTML = `
          <h3>${student.name}</h3>
          <p>Address: ${student.address}</p>
          <p>ID: ${student.student_id}</p>
          <button class="btn-update" onclick="viewStudentDetails(${student.student_id})">View Details</button>
          <button class="btn-update" onclick="editStudent(${student.student_id})">Edit</button>
          <button class="btn-create delete-btn" data-id="${student.student_id}">Delete</button>
        `;
        studentsListDiv.appendChild(studentElement);
      });
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    studentsListDiv.innerHTML = `<p style="color: red;">Failed to load students: ${error.message}</p>`;
  }
}

// GET /students/:id — Topic 6 single-book variant
async function viewStudentDetails(studentId) {
  console.log("View details for student ID:", studentId);
  messageDiv.textContent = "Loading student details...";
  messageDiv.style.color = "black";

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

    const student = await response.json();
    messageDiv.innerHTML = `<strong>Student Details:</strong> ID ${student.student_id} — ${student.name} (${student.address})`;
    messageDiv.style.color = "blue";
  } catch (error) {
    console.error("Error fetching student details:", error);
    messageDiv.textContent = `Failed to load student details: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

function editStudent(studentId) {
  console.log("Edit student with ID:", studentId);
  window.location.href = `edit-student.html?id=${studentId}`;
}

// DELETE /students/:id — Topic 9 pattern
async function handleDeleteClick(event) {
  const studentId = event.target.getAttribute("data-id");
  console.log("Attempting to delete student with ID:", studentId);

  if (!confirm(`Are you sure you want to delete student with ID ${studentId}?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      const studentElement = document.querySelector(
        `.student-item[data-student-id="${studentId}"]`
      );
      if (studentElement) studentElement.remove();
      messageDiv.textContent = `Student ${studentId} deleted successfully.`;
      messageDiv.style.color = "green";
    } else if (response.status === 404) {
      messageDiv.textContent = `Student ${studentId} not found.`;
      messageDiv.style.color = "red";
    } else {
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
    console.error("Error deleting student:", error);
    messageDiv.textContent = `Failed to delete student: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

fetchStudentsBtn.addEventListener("click", fetchStudents);
