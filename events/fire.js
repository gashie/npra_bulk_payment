const { CALLBACK_URL, FTD_CODE, CHANNEL_CODE, gipFtdUrl } = require('../config/config');
const { convertTimestampToCustomFormat } = require('../helper/func');
const service = require('../services/request');
const globalEventEmitter = require('../utils/eventEmitter');
const ftdEventName = "FTD_REQUEST";


globalEventEmitter.on('NEC', async (payload) => {
    const dateTime = convertTimestampToCustomFormat();
    try {

        await service.logEvents(payload)
    } catch (error) {

        console.error('Error handling NAME_ENQUIRY event:', error.message);
    }
});


globalEventEmitter.on(ftdEventName, async (payload) => {
    try {
       

        let ftdPayload = {
            accountToCredit: payload.src_account_number,
            accountToDebit: payload.dest_account_number,
            channelCode: CHANNEL_CODE,
            dateTime: payload.request_timestamp,
            destBank: payload.dest_bank_code,
            functionCode: FTD_CODE,
            narration: payload.narration,
            originBank: payload.src_bank_code,
            callbackUrl: CALLBACK_URL,
            sessionId: payload.session_id,
            trackingNumber: payload.tracking_number,
            amount: payload.amount,
            nameToCredit: payload.src_account_name,
            nameToDebit: payload.dest_account_name
        }

        console.log('ftdPayload',ftdPayload);
        
        let event_response = await service.makeGipRequestService(ftdPayload, gipFtdUrl)
        let final_response = event_response.response;
        let eventPayload = {
            event_name: ftdEventName,
            event_payload: ftdPayload,
            event_url: gipFtdUrl,
            event_response: event_response.response,
            status: "PENDING",
            callback: payload.callback_url,
            session_id: payload.session_id,
            action_code: final_response.actionCode,
            tracking_number: payload.tracking_number,
            approval_code: final_response.actionCode,
            account_to_debit: payload.dest_account_number,
            account_to_credit: payload.src_account_number,
            name_to_debit: payload.dest_account_name,
            name_to_credit: payload.src_account_name,
            src_bank_code:payload.src_bank_code
        }
        await service.saveEventService(eventPayload)


    } catch (error) {

        console.error('Error handling FTD event:', error.message);
    }
});

globalEventEmitter.on('FTC', async (payload) => {
    try {

        await service.logEvents(payload)
    } catch (error) {

        console.error('Error handling NAME_ENQUIRY event:', error.message);
    }
});


