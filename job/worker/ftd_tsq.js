const { markFailedAndEnqueueJob, markEventAndCallbackAsComplete, markTsqState, markFailed } = require("../db/query");

/**
 * Helper function to sleep for a given number of milliseconds.
 * Useful for throttling loops or retry logic.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  
  
  

async function ftdTsqWorker() {
    while (true) {
      try {
        const ftdTsqRecords = await fetchFtdTsqRecords();
  
        if (ftdTsqRecords.length === 0) {
          await sleep(5000);
          continue;
        }
  
        for (const record of ftdTsqRecords) {
          await processFtdTsqRecord(record);
        }
      } catch (err) {
        console.error('Error in ftdTsqWorker loop:', err);
        await sleep(5000);
      }
    }
  }
  
  async function processFtdTsqRecord(record) {
    try {
      // 1. Perform API request or internal logic to re-check the transaction status
      const finalStatus = await performTsqCheck(record);
  
      if (finalStatus === 'FAILED') {
        await markFailedAndEnqueueJob(record);
      } else if (['000'].includes(finalStatus)) {
        // create new FTC_REQUEST
        await createFtcRequest(record);
        // possibly update the record to COMPLETED
        await markEventAndCallbackAsComplete(record.event_id, record.callback_id);
      } else {
        // If finalStatus in [909, 912, null, 990], or anything else
        // Keep in TSQ_STATE or do whatever next step is needed
        await markTsqState(record.event_id, record.callback_id);
      }
    } catch (error) {
      console.error(`Error processing FTD TSQ record ${record.id}:`, error);
      await markFailed(record.event_id, record.callback_id);
    }
  }
  
  module.exports = ftdTsqWorker