const express = require("express");
const router = express.Router();
const questionnaireController = require("../controllers/questionnaireController");
const { validateQuestionnaire } = require("../middleware/validation");

router.post(
  "/",
  // validateQuestionnaire,
  questionnaireController.createQuestionnaire
);
router.get("/", questionnaireController.getAllQuestionnaires);
router.get("/:id", questionnaireController.getQuestionnaireById);
router.put(
  "/:id",
  // validateQuestionnaire,
  questionnaireController.updateQuestionnaire
);
router.delete("/:id", questionnaireController.deleteQuestionnaire);

router.post("/:id/questions", questionnaireController.addQuestion);
router.put(
  "/:id/questions/:questionId",
  questionnaireController.updateQuestion
);
router.delete(
  "/:id/questions/:questionId",
  questionnaireController.deleteQuestion
);

// router.post(
//   "/:id/questions/:questionId/options",
//   questionnaireController.addOption
// );
// router.put(
//   "/:id/questions/:questionId/options/:optionId",
//   questionnaireController.updateOption
// );
// router.delete(
//   "/:id/questions/:questionId/options/:optionId",
//   questionnaireController.deleteOption
// );

module.exports = router;
