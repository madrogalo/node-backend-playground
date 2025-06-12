const pool = require("../db");

module.exports = {
  async getQuestionnaireSummary(req, res) {
    try {
      const { id } = req.params;

      const totalResponses = await pool.query(
        `SELECT COUNT(*) as count FROM responses WHERE questionnaire_id = $1`,
        [id]
      );

      const questionCounts = await pool.query(
        `SELECT q.id, q.question_text, COUNT(a.id) as count
         FROM questions q
         LEFT JOIN answers a ON q.id = a.question_id
         WHERE q.questionnaire_id = $1
         GROUP BY q.id, q.question_text`,
        [id]
      );

      res.json({
        totalResponses: totalResponses.rows[0].count,
        questionCounts: questionCounts.rows,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getQuestionStats(req, res) {
    try {
      const { id } = req.params;

      const questionStats = await pool.query(
        `SELECT o.option_text, COUNT(a.id) as count
         FROM options o
         LEFT JOIN answers a ON o.id = a.option_id
         WHERE o.question_id = $1
         GROUP BY o.option_text, o.option_order
         ORDER BY o.option_order`,
        [id]
      );

      const textAnswers = await pool.query(
        `SELECT answer_text 
         FROM answers 
         WHERE question_id = $1 AND answer_text IS NOT NULL`,
        [id]
      );

      res.json({
        options: questionStats.rows,
        textAnswers: textAnswers.rows.map((a) => a.answer_text),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getResponsesCount(req, res) {
    try {
      const { questionnaireId } = req.params;

      const result = await pool.query(
        `SELECT COUNT(*) as count 
         FROM responses 
         WHERE questionnaire_id = $1`,
        [questionnaireId]
      );

      res.json({ count: parseInt(result.rows[0].count, 10) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getResponseHeatmap(req, res) {
    try {
      const { questionnaireId } = req.params;

      const result = await pool.query(
        `SELECT question_id, COUNT(*) as count 
         FROM answers 
         WHERE questionnaire_id = $1 
         GROUP BY question_id`,
        [questionnaireId]
      );

      const heatmapData = result.rows.map((row) => ({
        questionId: row.question_id,
        count: parseInt(row.count, 10),
      }));

      res.json(heatmapData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
