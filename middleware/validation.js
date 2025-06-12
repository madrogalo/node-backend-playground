const { body, validationResult } = require("express-validator");

exports.validateQuestionnaire = [
  body("title").notEmpty().withMessage("Назва анкети обов'язкова"),
  body("questions")
    .isArray({ min: 1 })
    .withMessage("Додайте хоча б одне питання"),
  body("questions.*.text").notEmpty().withMessage("Текст питання обов'язковий"),
  body("questions.*.type")
    .isIn(["single", "multiple", "text"])
    .withMessage("Невірний тип питання"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateResponse = [
  body("answers").isArray().withMessage("Відповіді мають бути масивом"),
  body("answers.*.questionId").isInt().withMessage("Невірний ID питання"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
