// ftdTsqWorker.js
const npradb = require("../db/db");
const { fetchFtdTsqRecords, updateTsqIteration, markFailedAndEnqueueJob, markEventAndCallbackAsComplete, markTsqState, markFailed, createFtcRequest } = require("../db/query");
const config = require("./config.json"); // { tsq: { intervalMinutes, maxIterations } }

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ftdTsqWorker() {
  while (true) {
    try {
      const ftdTsqRecords = await fetchFtdTsqRecords(); // read-only select, no transaction

      if (ftdTsqRecords.length === 0) {
        await sleep(5000);
        continue;
      }

      for (const record of ftdTsqRecords) {
        await processFtdTsqRecord(record);
      }
    } catch (err) {
      console.error("Error in ftdTsqWorker loop:", err);
      await sleep(5000);
    }
  }
}

async function processFtdTsqRecord(record) {
  const client = await npradb.beginTransaction();
  try {
    const finalStatus = await performTsqCheck(record, client);

    if (finalStatus === "FAILED") {
      await markFailedAndEnqueueJob(record, client);
    } else if (["000"].includes(finalStatus)) {
      await createFtcRequest(record, client);
      await markEventAndCallbackAsComplete(record.event_id, record.callback_id, client);
    } else if (["909", "912", null, "990"].includes(finalStatus)) {
      // If we've hit max TSQ attempts, fail; else remain in TSQ
      if ((record.tsq_attempts || 0) >= config.tsq.maxIterations) {
        await markFailedAndEnqueueJob(record, client);
      } else {
        // increment TSQ attempt, remain TSQ
        await updateTsqIteration(record, client);  // e.g. increments a tsq_attempts column by 1
        await markTsqState(record.event_id, record.callback_id, client);
      }
    } else {
      // fallback
      await markFailed(record.event_id, record.callback_id, client);
    }

    await npradb.commitTransaction(client);
  } catch (error) {
    await npradb.rollbackTransaction(client);
    console.error(`Error processing FTD TSQ record ${record.id}:`, error);
    await markFailed(record.event_id, record.callback_id, client);
  }
}

module.exports = ftdTsqWorker;

