const {markTsqState, markFailed, sendJobToQueue, markSuccess, createOutgoingCallback } = require("../db/query");

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
    try {
      // Check status from external or internal system
      const finalStatus = await performTsqCheck(record);
  
      if (finalStatus === 'FAILED') {
        await markFailed(record.event_id, record.callback_id);
      } else if (['909', '912', null, '990'].includes(finalStatus)) {
        await markTsqState(record.event_id, record.callback_id);
      } else if (['000'].includes(finalStatus)) {
        await createOutgoingCallback(record);
        await sendJobToQueue(record);
        await markSuccess(record.event_id, record.callback_id);
      } else {
        // fallback
        await markFailed(record.event_id, record.callback_id);
      }
    } catch (error) {
      console.error(`Error processing FTC TSQ record ${record.id}:`, error);
      await markFailed(record.event_id, record.callback_id);
    }
  }
  

module.exports = ftcTsqWorker