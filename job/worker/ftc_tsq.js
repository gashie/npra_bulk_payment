// ftcTsqWorker.js
const { gipTsqUrl } = require("../../config/config");
const { makeGipRequestService } = require("../../services/request");
const npradb = require("../db/db");
const {
  fetchFtcTsqRecords,
  updateTsqIteration,
  markTsqState,
  markFailed,
  sendJobToQueue,
  markSuccess,
  createOutgoingCallback,
} = require("../db/query");
const config = require("./config.json");

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
      console.error("Error in ftcTsqWorker loop:", err);
      await sleep(5000);
    }
  }
}

async function processFtcTsqRecord(record) {
  const client = await npradb.beginTransaction();
  try {
    const finalStatus = await makeGipRequestService(record, gipTsqUrl);

    if (finalStatus === "FAILED") {
      await markFailed(record.event_id, record.callback_id, client);
    } else if (["909", "912", null, "990"].includes(finalStatus)) {
      if ((record.tsq_attempts || 0) >= config.tsq.maxIterations) {
        await markFailed(record.event_id, record.callback_id, client);
      } else {
        await updateTsqIteration(record, client);
        await markTsqState(record.event_id, record.callback_id, client);
      }
    } else if (["000"].includes(finalStatus)) {
      await createOutgoingCallback(record, client);
      await sendJobToQueue(record, client);
      await markSuccess(record.event_id, record.callback_id, client);
    } else {
      await markFailed(record.event_id, record.callback_id, client);
    }

    await npradb.commitTransaction(client);
  } catch (error) {
    await npradb.rollbackTransaction(client);
    console.error(`Error processing FTC TSQ record ${record.id}:`, error);
    await markFailed(record.event_id, record.callback_id, client);
  }
}

module.exports = ftcTsqWorker;
