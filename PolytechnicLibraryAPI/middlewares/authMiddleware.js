const jwt = require("jsonwebtoken");

// Which roles may call which endpoint (method + path).
// Keys are matched as regexes against "<METHOD> <url>".
const authorizedRoles = {
  "GET /books": ["member", "librarian"],              // anyone logged in can view books
  "PUT /books/[0-9]+/availability": ["librarian"],    // only librarians update availability
};

// Verify the JWT and check the caller's role is allowed for this endpoint.
function verifyJWT(req, res, next) {
  // token comes in as "Authorization: Bearer <token>"
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // no token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" }); // bad / expired token
    }

    const requestedEndpoint = `${req.method} ${req.url}`;
    const userRole = decoded.role;

    // find a rule whose pattern matches this request AND allows this role
    const match = Object.entries(authorizedRoles).find(([endpoint, roles]) => {
      const regex = new RegExp(`^${endpoint}$`);
      return regex.test(requestedEndpoint) && roles.includes(userRole);
    });

    if (!match) {
      return res.status(403).json({ message: "Forbidden" }); // role not allowed
    }

    req.user = decoded; // attach {id, role} for downstream handlers
    next();
  });
}

module.exports = { verifyJWT };
