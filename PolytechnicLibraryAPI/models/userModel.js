const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Find a user by their username (used by both register + login)
async function getUserByUsername(username) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("username", sql.VarChar, username);
    const result = await request.query(
      "SELECT user_id, username, passwordHash, role FROM Users WHERE username = @username"
    );
    return result.recordset[0] || null; // null if the username doesn't exist
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Create a new user. passwordHash must already be bcrypt-hashed by the controller.
async function createUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("username", sql.VarChar, userData.username);
    request.input("passwordHash", sql.VarChar, userData.passwordHash);
    request.input("role", sql.VarChar, userData.role);
    const result = await request.query(
      `INSERT INTO Users (username, passwordHash, role)
       OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.role
       VALUES (@username, @passwordHash, @role)`
    );
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getUserByUsername, createUser };
