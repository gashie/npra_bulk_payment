const { convertTimestampToCustomFormat } = require('../helper/func');
const service = require('../services/request');
const globalEventEmitter = require('../utils/eventEmitter');

globalEventEmitter.on('NEC', async (payload) => {
    const dateTime = convertTimestampToCustomFormat();
    try {

        await service.logEvents(payload)
        } catch (error) {

        console.error('Error handling NAME_ENQUIRY event:', error.message);
    }
});

 
globalEventEmitter.on('FTD', async (payload) => {
    try {
        
        await service.logEvents(payload)
        } catch (error) {

        console.error('Error handling NAME_ENQUIRY event:', error.message);
    }
});

globalEventEmitter.on('FTC', async (payload) => {
    try {
        
        await service.logEvents(payload)
        } catch (error) {

        console.error('Error handling NAME_ENQUIRY event:', error.message);
    }
});


