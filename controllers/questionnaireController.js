const pool = require("../db");

module.exports = {
  async createQuestionnaire(req, res) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { title, questions } = req.body;

      const {
        rows: [questionnaire],
      } = await client.query(
        "INSERT INTO questionnaires (title) VALUES ($1) RETURNING id, title",
        [title || "New Questionnaire"]
      );

      for (const [order, question] of questions.entries()) {
        const {
          rows: [q],
        } = await client.query(
          `INSERT INTO questions 
           (questionnaire_id, question_text, question_type, question_order) 
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [questionnaire.id, question.question, question.type, order + 1]
        );

        if (question.options && question.options.length > 0) {
          for (const [optOrder, option] of question.options.entries()) {
            await client.query(
              `INSERT INTO options 
               (question_id, option_text, option_order, is_correct) 
               VALUES ($1, $2, $3, $4)`,
              [q.id, option.value, optOrder + 1, option.checked || false]
            );
          }
        }
      }

      await client.query("COMMIT");
      res.status(201).json({
        ...questionnaire,
        message: "Questionnaire created successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  },

  async getQuestionnaireWithDetails(req, res) {
    try {
      const { id } = req.params;

      const {
        rows: [questionnaire],
      } = await pool.query("SELECT * FROM questionnaires WHERE id = $1", [id]);

      if (!questionnaire) {
        return res.status(404).json({ error: "Анкета не знайдена" });
      }

      const { rows: questions } = await pool.query(
        `SELECT q.*, 
         json_agg(
           CASE WHEN o.id IS NOT NULL THEN 
             json_build_object('id', o.id, 'text', o.option_text, 'order', o.option_order)
           ELSE NULL END
         ) FILTER (WHERE o.id IS NOT NULL) as options
         FROM questions q
         LEFT JOIN options o ON q.id = o.question_id
         WHERE q.questionnaire_id = $1
         GROUP BY q.id
         ORDER BY q.question_order`,
        [id]
      );

      res.json({ ...questionnaire, questions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllQuestionnaires(req, res) {
    try {
      const { rows: questionnaires } = await pool.query(
        "SELECT * FROM questionnaires ORDER BY created_at DESC"
      );
      res.json(questionnaires);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getQuestionnaireById(req, res) {
    try {
      const { id } = req.params;
      const { rows: questionnaires } = await pool.query(
        "SELECT * FROM questionnaires WHERE id = $1",
        [id]
      );

      if (questionnaires.length === 0) {
        return res.status(404).json({ error: "Анкета не знайдена" });
      }

      res.json(questionnaires[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateQuestionnaire(req, res) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { id } = req.params;
      const { title, description, questions } = req.body;

      const {
        rows: [questionnaire],
      } = await client.query(
        "UPDATE questionnaires SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
        [title, description, id]
      );

      if (!questionnaire) {
        return res.status(404).json({ error: "Анкета не знайдена" });
      }

      await client.query("DELETE FROM questions WHERE questionnaire_id = $1", [
        id,
      ]);
      await client.query(
        "DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE questionnaire_id = $1)",
        [id]
      );

      for (const [index, question] of questions.entries()) {
        const {
          rows: [q],
        } = await client.query(
          `INSERT INTO questions 
           (questionnaire_id, question_text, question_type, question_order) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [id, question.text, question.type, index + 1]
        );

        if (question.options && question.options.length > 0) {
          for (const [optIndex, option] of question.options.entries()) {
            await client.query(
              "INSERT INTO options (question_id, option_text, option_order) VALUES ($1, $2, $3)",
              [q.id, option.text, optIndex + 1]
            );
          }
        }
      }

      await client.query("COMMIT");
      res.json(questionnaire);
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  },

  async deleteQuestionnaire(req, res) {
    const { id } = req.params;

    try {
      await pool.query("DELETE FROM questions WHERE questionnaire_id = $1", [
        id,
      ]);
      await pool.query(
        "DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE questionnaire_id = $1)",
        [id]
      );

      // Видаляємо анкету
      await pool.query("DELETE FROM questionnaires WHERE id = $1", [id]);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addQuestion(req, res) {
    const { questionnaireId, text, type, order, isRequired = false } = req.body;

    try {
      const {
        rows: [question],
      } = await pool.query(
        `INSERT INTO questions 
         (questionnaire_id, question_text, question_type, question_order, is_required) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [questionnaireId, text, type, order, isRequired]
      );

      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateQuestion(req, res) {
    const { id } = req.params;
    const { text, type, order, isRequired } = req.body;

    try {
      const {
        rows: [question],
      } = await pool.query(
        `UPDATE questions 
         SET question_text = $1, question_type = $2, question_order = $3, is_required = $4, updated_at = NOW() 
         WHERE id = $5 RETURNING *`,
        [text, type, order, isRequired, id]
      );

      if (!question) {
        return res.status(404).json({ error: "Питання не знайдено" });
      }

      res.json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteQuestion(req, res) {
    const { id } = req.params;

    try {
      await pool.query("DELETE FROM options WHERE question_id = $1", [id]);

      const result = await pool.query("DELETE FROM questions WHERE id = $1", [
        id,
      ]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Питання не знайдено" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
