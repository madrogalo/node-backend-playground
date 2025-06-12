const pool = require("./db");
(async () => {
  try {
    const query = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
    const values = ["username", "email", "password"];

    const result = await pool.query(query, values);
    // const result = await pool.query("SELECT * FROM users");
    console.log("✅ Database connection is OK:", result.rows);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  } finally {
    await pool.end();
  }
})();
