// swagger.js — generates swagger-output.json from the Express routes (Practical 09 Part B)
// Run with: npm run swagger
const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json";
const routes = ["./app.js"]; // swagger-autogen parses the route definitions in app.js

const doc = {
  info: {
    title: "Polytechnic Library API",
    description:
      "Practical 07-09 — books and user authentication for the Polytechnic Library. " +
      "Register/login are public; /books routes require a JWT, and updating availability is librarian-only.",
    version: "1.0.0",
  },
  host: "localhost:3001",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "JWT token. Format: Bearer <token>",
    },
  },
};

swaggerAutogen(outputFile, routes, doc);
