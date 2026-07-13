const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to Homework API");
});

app.get("/intro", (req, res) => {
  res.send("Hi i like to sleep");
});

app.get("/name", (req, res) => {
  res.send("James");
});

app.get("/hobbies", (req, res) => {
  res.send(["coding", "reading", "cycling"]);
});

app.get("/food", (req, res) => {
  res.send("None, but coffee");
});

app.get("/student", (req, res) => {
  res.send({
    name: "James",
    hobbies: ["coding", "reading", "cycling"],
    intro: "Hi i like to sleep",
  });
});

// Listen on the port after defining routes
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});