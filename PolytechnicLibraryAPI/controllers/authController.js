const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const validRoles = ["member", "librarian"];

// POST /register — create a new user with a bcrypt-hashed password
async function register(req, res) {
  const { username, password, role } = req.body;
  try {
    // --- validation ---
    if (!username || !password || !role) {
      return res.status(400).json({ message: "username, password and role are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "role must be 'member' or 'librarian'" });
    }

    // --- username must be unique ---
    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // --- hash the password (never store the plain text) ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- create the user ---
    const newUser = await userModel.createUser({
      username,
      passwordHash: hashedPassword,
      role,
    });

    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /login — verify credentials and return a JWT token
async function login(req, res) {
  const { username, password } = req.body;
  try {
    // find the user
    const user = await userModel.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // compare the given password with the stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // sign a JWT carrying the user's id + role
    const payload = { id: user.user_id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" }); // 1 hour

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { register, login };
