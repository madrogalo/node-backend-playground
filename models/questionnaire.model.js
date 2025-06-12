const pool = require("../db");

module.exports = {
  async create(title, description) {
    const { rows } = await pool.query(
      "INSERT INTO questionnaires (title, description) VALUES ($1, $2) RETURNING *",
      [title, description]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM questionnaires WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query("SELECT * FROM questionnaires");
    return rows;
  },

  async update(id, title, description) {
    const { rows } = await pool.query(
      "UPDATE questionnaires SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [title, description, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM questionnaires WHERE id = $1", [id]);
  },
};
