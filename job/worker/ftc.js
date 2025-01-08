const { markSuccess, markTsqState, markFailed, saveOutgoingCallback, fetchFtcPendingCallbacks } = require("../db/query");


/**
 * Helper function to sleep for a given number of milliseconds.
 * Useful for throttling loops or retry logic.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

async function ftcWorker() {
    while (true) {
      try {
        // 1. Fetch all pending FTC callbacks
        const ftcCallbacks = await fetchFtcPendingCallbacks();
  
        if (ftcCallbacks.length === 0) {
          await sleep(5000);
          continue;
        }
  
        for (const record of ftcCallbacks) {
          await processFtcRecord(record);
        }
      } catch (err) {
        console.error('Error in ftcWorker loop:', err);
        await sleep(5000);
      }
    }
  }
  
  async function processFtcRecord(record) {
    try {
      const actionCode = record.action_code;
  
      // If code is 000 or 001, success
      if (['000'].includes(actionCode)) {
        await saveOutgoingCallback(record);
        await markSuccess(record.event_id, record.callback_id);
      }
      // If code in [909, 912, null, 990]
      else if ([ '909', '912', null, '990'].includes(actionCode)) {
        await markTsqState(record.event_id, record.callback_id);
      }
      // If some other code => your fallback logic (maybe fail?)
      else {
        await markFailed(record.event_id, record.callback_id);
      }
    } catch (error) {
      console.error(`Error processing FTC record ${record.event_id}:`, error);
      await markFailed(record.event_id, record.callback_id);
    }
  }

  
  module.exports = ftcWorker