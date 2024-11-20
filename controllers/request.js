const requestService = require('../services/request');
const humps = require('humps')
const { sendResponse } = require('../utils/utilfunc');
const asynHandler = require("../middleware/async");
const { formatAmount, toSnakeCase } = require('../helper/func');


exports.sendRequest = asynHandler(async (req, res) => {

    const payload = toSnakeCase(req.body)

    //-*1.-Validate reference and make sure it unique
    //-*2.-Convert amount to padded value
    //-*3.-Generate unique id
    //-*4.-Push to gip
    //-*5.-Save response + request

    // check src and dest bank
    const srcBankCode = await requestService.findParticipantService(payload.src_bank_code);
    const destBankCode = await requestService.findParticipantService(payload.dest_bank_code);

    if (!(srcBankCode && destBankCode)) {
        return sendResponse(res, 0, 200, "Sorry, Participant", []);
    }

    // generate session_id and tracking number
    const unique_result = await requestService.uniqueIdGeneratorService(payload.reference_number);

    // find reference
    const ref_result = await requestService.findReferenceService(payload.reference_number);

    if (ref_result.rowCount === 1) {
        return sendResponse(res, 0, 200, "Sorry, this record already exist", []);
    }

    if (payload.request_type === "FTC") {
        let cleanAmount = formatAmount(payload.amount)
        payload.amount = cleanAmount
    } else {
        payload.amount = "000000000000"
    }
    payload.session_id = unique_result.rows[0].session_id
    payload.tracking_number = unique_result.rows[0].tracking_number
    //emit event to send api request with payload

    const nec_result = await requestService.makeNecRequestService(payload, srcBankCode, destBankCode);
    let gip_response = nec_result.jsonResponse['soapenv:Body']['com:GIPTransaction'].ReqGIPTransaction

    payload.gip_response = gip_response

    //make act code decision here
    
    const result = await requestService.saveReqestService(payload);
    return result.rowCount === 1
        ? sendResponse(res, 1, 200, "Record saved", [])
        : sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", []);
});
