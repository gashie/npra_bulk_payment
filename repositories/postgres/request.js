const { addItem, getItemById, getItems, updateItem } = require('../../helper/dynamic');
const { uniqueIds } = require('../../model/Request');



async function saveRequests(payload) {
    let results = await addItem('requests', payload);
    return results
}

async function findReference(reference_number) {
    const tableName = "requests";
    const columnsToSelect = []; // Use string values for column names
    const conditions = [{ column: "reference_number", operator: "=", value: reference_number }];
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
    generateRef
};
