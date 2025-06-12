const pool = require("../db");

module.exports = {
  async submitResponse(req, res) {
    const { questionnaireId } = req.params;
    const { answers } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const {
        rows: [response],
      } = await client.query(
        `INSERT INTO responses (questionnaire_id, answers) 
         VALUES ($1, $2) RETURNING *`,
        [questionnaireId, answers]
      );

      for (const answer of answers) {
        const { questionId, answerText } = answer;
        await client.query(
          `INSERT INTO response_details (response_id, question_id, answer_text) 
           VALUES ($1, $2, $3)`,
          [response.id, questionId, answerText]
        );
      }
      await client.query("COMMIT");
      res.status(201).json(response);
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  },

  async getResponses(req, res) {
    const { questionnaireId } = req.params;

    try {
      const { rows: responses } = await pool.query(
        `SELECT * FROM responses WHERE questionnaire_id = $1`,
        [questionnaireId]
      );
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addResponse(req, res) {
    const { questionnaireId } = req.params;
    const { answers } = req.body;

    try {
      const {
        rows: [response],
      } = await pool.query(
        `INSERT INTO responses (questionnaire_id, answers) 
         VALUES ($1, $2) RETURNING *`,
        [questionnaireId, answers]
      );
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateResponse(req, res) {
    const { id } = req.params;
    const { answers } = req.body;

    try {
      const {
        rows: [response],
      } = await pool.query(
        `UPDATE responses SET answers = $1 WHERE id = $2 RETURNING *`,
        [answers, id]
      );

      if (!response) {
        return res.status(404).json({ error: "Response not found" });
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteResponse(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query("DELETE FROM responses WHERE id = $1", [
        id,
      ]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Response not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getResponseById(req, res) {
    const { id } = req.params;

    try {
      const {
        rows: [response],
      } = await pool.query("SELECT * FROM responses WHERE id = $1", [id]);

      if (!response) {
        return res.status(404).json({ error: "Response not found" });
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async exportToCSV(req, res) {
    const { questionnaireId } = req.params;

    try {
      const { rows: responses } = await pool.query(
        `SELECT * FROM responses WHERE questionnaire_id = $1`,
        [questionnaireId]
      );

      if (responses.length === 0) {
        return res.status(404).json({ error: "No responses found" });
      }

      const csvRows = [];
      const headers = Object.keys(responses[0]);
      csvRows.push(headers.join(","));

      for (const response of responses) {
        const values = headers.map((header) => response[header]);
        csvRows.push(values.join(","));
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="responses.csv"`
      );
      res.send(csvRows.join("\n"));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
