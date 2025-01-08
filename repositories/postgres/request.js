const { addItem, getItemById, getItems, updateItem } = require('../../helper/dynamic');
const { uniqueIds } = require('../../model/Request');



async function saveRequests(payload) {
    let results = await addItem('requests', payload);
    return results
}

async function saveEvents(payload) {
    let results = await addItem('event', payload);
    return results
}
async function saveCallback(payload) {
    let results = await addItem('callback', payload);
    return results
}
async function saveJob(payload) {
    let results = await addItem('job_queue', payload);
    return results
}

async function findReference(reference_number) {
    const tableName = "requests";
    const columnsToSelect = []; // Use string values for column names
    const conditions = [{ column: "reference_number", operator: "=", value: reference_number }];
    let results = await getItemById(tableName, columnsToSelect, conditions);
    return results
}
async function findUniqueReference(reference_number,src_bank_code,request_timestamp) {
    const tableName = "requests";
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
        { column: "reference_number", operator: "=", value: reference_number },
        { column: "src_bank_code", operator: "=", value: src_bank_code },
        { column: "request_timestamp", operator: "=", value: request_timestamp }


    ];

    let results = await getItemById(tableName, columnsToSelect, conditions);
    return results
}

async function generateRef(reference_number) {
    let results = await uniqueIds(reference_number);
    return results
}
module.exports = {
    saveRequests,
    findReference,
    generateRef,
    saveJob,
    findUniqueReference,
    saveCallback,
    saveEvents
};
