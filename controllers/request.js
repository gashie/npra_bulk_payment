const requestService = require('../services/request');
const { sendResponse } = require('../utils/utilfunc');
const asynHandler = require("../middleware/async");
const { formatAmount } = require('../helper/func');


exports.sendRequest = asynHandler(async (req, res) => {
    const payload = req.body;

    //-*1.-Validate reference and make sure it unique
    //-*2.-Convert amount to padded value
    //-*3.-Generate unique id
    //-*4.-Push to gip
    //-*5.-Save response + request

    const unique_result = await requestService.uniqueIdGeneratorService(payload.reference_number);

    console.log('unique_result',unique_result.rows[0]);
    const ref_result = await requestService.findReferenceService(payload.reference_number);

    if (ref_result.rowCount === 1) {
        return sendResponse(res, 0, 200, "Sorry, this record already exist", []);
    }
    
//     let cleanAmount = formatAmount(payload.amount)
//    payload.amount = cleanAmount

   //emit event to send api request with payload


    payload.session_id = unique_result.rows[0].session_id
    payload.tracking_number = unique_result.rows[0].tracking_number
    const result = await requestService.saveReqestService(payload);
    return result.rowCount === 1
        ? sendResponse(res, 1, 200, "Record saved", [])
        : sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", []);
});
