const reportService = require("../services/global_db_service");
const asynHandler = require("../middleware/async");
const { sendResponse } = require("../utils/utilfunc");
const { toSnakeCase } = require("../helper/func");

exports.mainReportController = asynHandler(async (req, res) => {
  const payload = toSnakeCase(req.body);
  const results = await reportService.runSavedQuery(payload.query,payload.values);

  sendResponse(res, 1, 200, "Record Found", results);

});
