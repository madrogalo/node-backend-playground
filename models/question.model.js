const pool = require("../db");

module.exports = {
  async create(questionnaireId, text, type, order, isRequired = false) {
    const { rows } = await pool.query(
      `INSERT INTO questions 
       (questionnaire_id, question_text, question_type, question_order, is_required) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [questionnaireId, text, type, order, isRequired]
    );
    return rows[0];
  },

  async findByQuestionnaire(questionnaireId) {
    const { rows } = await pool.query(
      "SELECT * FROM questions WHERE questionnaire_id = $1 ORDER BY question_order",
      [questionnaireId]
    );
    return rows;
  },
};
