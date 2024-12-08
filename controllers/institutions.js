const institionService = require("../services/institution");
const asynHandler = require("../middleware/async");
const { sendResponse } = require("../utils/utilfunc");
const { toSnakeCase } = require("../helper/func");

exports.createInstitution = asynHandler(async (req, res) => {
  const payload = toSnakeCase(req.body);

  const result = await institionService.createInstitutionService(payload);

  if (result.rowCount == 1) {
    return sendResponse(res, 1, 200, "Record Saved", []);
  } else {
    return sendResponse(
      res,
      0,
      200,
      "Sorry, error saving record: contact administrator",
      []
    );
  }
});

exports.viewInstitutions = asynHandler(async (req, res) => {
  const results = await institionService.viewInstitutionService();

  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }

  sendResponse(res, 1, 200, "Record Found", results.rows);
});

exports.updateInstitution = asynHandler(async (req, res) => {
  const payload = toSnakeCase(req.body);

  const runupdate = await institionService.updateInstitutionService(payload,payload.id);

  if (runupdate.rowCount == 1) {
    return sendResponse(res, 1, 200, "Record Updated", []);
  } else {
    return sendResponse(res, 0, 200, "Update failed, please try later", []);
  }
});

exports.deleteInstitution = asynHandler(async (req, res) => {
  const payload = toSnakeCase(req.body);

  const runupdate = await institionService.updateInstitutionService(payload,payload.id);

  if (runupdate.rowCount == 1) {
    return sendResponse(res, 1, 200, "Record Deleted", []);
  } else {
    return sendResponse(res, 0, 200, "Delete failed, please try later", []);
  }
});
