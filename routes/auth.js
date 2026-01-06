const express = require("express");
const router = express.Router();

/**
 * DEMO USERS (enterprise-style emails)
 * In production → DB / SSO
 */
const users = {
  "admin@company.com": {
    password: "admin123",
    role: "admin"
  },
  "employee@company.com": {
    password: "user123",
    role: "user"
  }
};

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.user = {
    username,
    role: user.role
  };

  res.json({ role: user.role });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
