const express = require("express");
const router = express.Router();
const responseController = require("../controllers/responseController");
const { validateResponse } = require("../middleware/validation");

router.post(
  "/:questionnaireId",
  validateResponse,
  responseController.submitResponse
);
router.get("/:questionnaireId", responseController.getResponses);
router.get("/:questionnaireId/:responseId", responseController.getResponseById);

router.get("/:questionnaireId/export/csv", responseController.exportToCSV);
// router.get("/:questionnaireId/export/excel", responseController.exportToExcel);

module.exports = router;
