const { convertTimestampToCustomFormat } = require('../../helper/func');
const { sendSoapRequest } = require('../../utils/soapClient');



async function makeNecRequest(payload,srcBankCode,destBankCode) {
    const request_timestamp = convertTimestampToCustomFormat();
    const soapPayload = {
        'soapenv:Body': {
            'com:GIPTransaction': {
                'ReqGIPTransaction': {
                        Amount:payload.amount,
                        datetime:request_timestamp,
                        TrackingNum: payload.tracking_number,
                        FunctionCode:230, 
                        OrigineBank:srcBankCode.participant,
                        DestBank:destBankCode.participant,
                        SessionID:payload.session_id,
                        ChannelCode:100,
                        NameToDebit:'PDM', 
                        AccountToCredit:payload.dest_account_number,
                        Narration:payload.narration,
                    },
            },
        },
    };

    try {
        // Make the SOAP request
        console.log(soapPayload);
        
        const { xmlResponse, jsonResponse } = await sendSoapRequest(
            'http://localhost:3004/NED',
            soapPayload
        );

        // Log the responses
        console.log('XML Response:', xmlResponse);
        console.log('JSON Response:', JSON.stringify(jsonResponse, null, 2));

       
        return { xmlResponse, jsonResponse };
    } catch (error) {
        console.error('Error during SOAP request:', error);
        throw error; 
    }
}

module.exports = { makeNecRequest };
