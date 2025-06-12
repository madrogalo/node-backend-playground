const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get(
  "/questionnaires/:id/summary",
  analyticsController.getQuestionnaireSummary
);
router.get(
  "/questionnaires/:id/responses-count",
  analyticsController.getResponsesCount
);
router.get("/questions/:id/stats", analyticsController.getQuestionStats);

router.get(
  "/questionnaires/:id/heatmap",
  analyticsController.getResponseHeatmap
);

module.exports = router;
