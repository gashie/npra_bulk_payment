const express = require("express");
const router = express.Router();

const requestController = require("../controllers/request");
const requestftcController = require("../controllers/request_ftc");
const institutionController = require("../controllers/institutions");
const settlementAccountController = require("../controllers/settlement_accounts")
const reportController = require("../controllers/reports")
const approvalController = require("../controllers/approval")

router.post("/ne", requestController.sendRequest);
router.post("/ft", requestftcController.sendRequest);

router.post("/create-institution", institutionController.createInstitution);
router.post("/view-institutions", institutionController.viewInstitutions);
router.post("/update-institution", institutionController.updateInstitution);
router.post("/delete-institution", institutionController.deleteInstitution);

router.post("/create-settlement-account", settlementAccountController.createSettlementAccount);
router.post("/view-settlement-accounts", settlementAccountController.viewSettlementAccount);
router.post("/update-settlement-account", settlementAccountController.updateSettlementAccount);
router.post("/delete-settlement-account", settlementAccountController.deleteSettlementAccount);

router.post("/report", reportController.mainReportController);

router.post("/approval", approvalController.ApproveOrDeny);

module.exports = router;
