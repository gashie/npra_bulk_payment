const npradb = require("../db/db");
const {markTsqState, markFailed, sendJobToQueue, markSuccess, createOutgoingCallback, fetchFtcTsqRecords } = require("../db/query");

/**
 * Helper function to sleep for a given number of milliseconds.
 * Useful for throttling loops or retry logic.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  


async function ftcTsqWorker() {
    while (true) {
      try {
        const ftcTsqRecords = await fetchFtcTsqRecords();
  
        if (ftcTsqRecords.length === 0) {
          await sleep(5000);
          continue;
        }
  
        for (const record of ftcTsqRecords) {
          await processFtcTsqRecord(record);
        }
      } catch (err) {
        console.error('Error in ftcTsqWorker loop:', err);
        await sleep(5000);
      }
    }
  }
  
  async function processFtcTsqRecord(record) {
    const client = await npradb.beginTransaction();
    try {
      // Check status from external or internal system
      const finalStatus = await performTsqCheck(record,client);
  
      if (finalStatus === 'FAILED') {
        await markFailed(record.event_id, record.callback_id,client);
      } else if (['909', '912', null, '990'].includes(finalStatus)) {
        await markTsqState(record.event_id, record.callback_id,client);
      } else if (['000'].includes(finalStatus)) {
        await createOutgoingCallback(record,client);
        await sendJobToQueue(record,client);
        await markSuccess(record.event_id, record.callback_id,client);
      } else {
        // fallback
        await markFailed(record.event_id, record.callback_id,client);
      }
      // Finally, commit once
          await npradb.commitTransaction(client);
    } catch (error) {
        // Roll back if anything goes wrong
            await npradb.rollbackTransaction(client);
      console.error(`Error processing FTC TSQ record ${record.id}:`, error);
      await markFailed(record.event_id, record.callback_id,client);
    }
  }
  

module.exports = ftcTsqWorker