const requestService = require("../services/request");
const asynHandler = require("../middleware/async");
const { sendResponse } = require("../utils/utilfunc");
const { toSnakeCase } = require("../helper/func");

exports.mainReportController = asynHandler(async (req, res) => {
  const payload = toSnakeCase(req.body);
  const results = await requestService.reportService(payload.query[0]);

  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }

  sendResponse(res, 1, 200, "Record Found", results.rows);
});
