const pool = require("../db");

exports.addUser = async (req, res) => {
  console.log("Adding user...", req.body);
  const { username, email, password } = req.body;
  console.log("Received data:", { username, email, password });

  const query = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [username, email, password];

  try {
    const result = await pool.query(query, values);
    console.log("Користувач доданий:", result.rows[0]);
  } catch (err) {
    console.error("Помилка:", err);
  }

  const users = await pool.query("SELECT * FROM users");

  res.status(200).json({
    message: `User added successfully ... `,
    users: users.rows,
  });
};

exports.getUsers = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const users = await pool.query(
      "SELECT id, username, email, created_at FROM users"
    );
    res.status(200).json({
      message: "Users retrieved successfully",
      users: users.rows,
    });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

exports.getUserCount = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM users");
    res.status(200).json({
      message: "User count retrieved successfully",
      count: parseInt(result.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error retrieving user count:", err);
    res.status(500).json({ message: "Error retrieving user count" });
  }
};
