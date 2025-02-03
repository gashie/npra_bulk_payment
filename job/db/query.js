const {
  gipFtdUrl,
  CHANNEL_CODE,
  CALLBACK_URL,
  FTC_CODE,
  gipFtcUrl,
} = require("../../config/config");
const { makeGipRequestService } = require("../../services/request");
const npradb = require("./db"); // your dynamic CRUD + transaction helpers
const pool = require("./pool");
const config = require("../worker/config.json");
const globalEventEmitter = require("../../utils/eventEmitter");

/**
 * Create an FTC_REQUEST event in the `event` table.
 * Wraps the insert in a transaction.
 * @param {Object} record - Data needed to create the new event.
 * @returns {Object} The newly created event row.
 */
async function createFtcRequest(record, client, request_id) {
  try {
    // payload for the new event
    const ftcPayload = {
      accountToCredit: record.src_account_number,
      accountToDebit: record.dest_account_number,
      channelCode: CHANNEL_CODE,
      dateTime: record.request_timestamp, //autogenerate here
      destBank: record.src_bank_code,
      functionCode: FTC_CODE,
      narration: record.narration,
      originBank: record.dest_bank_code,
      callbackUrl: CALLBACK_URL,
      sessionId: record.session_id, //autogenerate here
      trackingNumber: record.tracking_number, //autogenerate here
      amount: record.amount,
      nameToCredit: record.dest_account_name,
      nameToDebit: record.dest_account_name,
    };

    let event_response = await makeGipRequestService(ftcPayload, gipFtdUrl);
    let eventPayload = {
      event_name: "FTC_REQUEST",
      event_payload: ftcPayload,
      event_url: gipFtcUrl,
      event_response: event_response.response,
      status: "PENDING",
      callback: record.callback_url,
      session_id: record.session_id,
      action_code: event_response.response.actionCode,
      tracking_number: record.tracking_number,
      approval_code: event_response.response.actionCode,
      account_to_debit: record.dest_account_number,
      account_to_credit: record.src_account_number,
      name_to_debit: record.src_account_name,
      name_to_credit: record.dest_account_name,
      src_bank_code: record.dest_bank_code,
      dest_bank_code: record.src_bank_code,
      request_id: request_id,
    };

    // Use npradb.Create with the transaction client
    const newFtc = await npradb.Create(eventPayload, "event", null, client);

    eventTimelinePayload = {
      transaction_id: newFtc.event_id,
      event_type: newFtc.event_name,
      event_details: "FTC created",
      status: "PENDING",
      remarks: newFtc.id,
    };

    await globalEventEmitter.emit("EVENT_TIMELINE", eventTimelinePayload);

    return newFtc;
  } catch (err) {
    throw err; // bubble up the error
  }
}

/**
 * Mark an event/callback as FAILED and enqueue a job in `job_queue`.
 * @param {Object} record - Must contain `event_id`, `callback_id`, etc.
 */
async function markFailedAndEnqueueJob(record, client) {
  try {
    // 1) Update event -> FAILED
    if (record.event_id) {
      await npradb.Update(
        { status: "FAILED" },
        "event",
        "event_id",
        record.event_id,
        client
      );
    }

    // 2) Update callback -> FAILED
    if (record.callback_id) {
      await npradb.Update(
        { status: "FAILED" },
        "callback",
        "callback_id",
        record.callback_id,
        client
      );
    }

    // 3) Insert a job into `job_queue`
    const jobPayload = {
      reason: "markFailedAndEnqueueJob",
      record,
    };
    await npradb.Create({ payload: jobPayload }, "job_queue", null, client);

    console.log("Event & callback marked FAILED, job enqueued.");
  } catch (err) {
    throw err;
  }
}

/**
 * Mark an event & callback as COMPLETED in a single transaction.
 */
async function markEventAndCallbackAsComplete(eventId, callbackId, client) {
  try {
    if (eventId) {
      await npradb.Update(
        { status: "COMPLETED" },
        "event",
        "event_id",
        eventId,
        client
      );
    }
    if (callbackId) {
      await npradb.Update(
        { status: "COMPLETED" },
        "callback",
        "callback_id",
        callbackId,
        client
      );
    }

    console.log(`Event ${eventId} & Callback ${callbackId} => COMPLETED`);
  } catch (err) {
    throw err;
  }
}
/**
 * Create a new "outgoing" callback record.
 */
async function createOutgoingCallback(record, client) {
  try {
    const payload = {
      payload: record.payload || {}, // JSONB of the callback info
      action_code: record.action_code || null,
      status: "PENDING",
      outgoing_url: record.outgoing_url || null,
    };

    const newCallback = await npradb.Create(payload, "callback", null, client);

    console.log("Created outgoing callback:", newCallback.id);
    return newCallback;
  } catch (err) {
    throw err;
  }
}
/**
 * Add a new job to the job_queue.
 */
async function sendJobToQueue(record, client) {
  try {
    const jobPayload = {
      type: "OUTGOING_CALLBACK",
      data: record,
    };
    const newJob = await npradb.Create(
      { payload: jobPayload },
      "job_queue",
      null,
      client
    );

    console.log("Enqueued job:", newJob.id);
    return newJob;
  } catch (err) {
    throw err;
  }
}

/**
 * Mark an event & callback as SUCCESS in one transaction.
 */
async function markSuccess(eventId, callbackId, client) {
  try {
    if (eventId) {
      await npradb.Update(
        { status: "SUCCESS" },
        "event",
        "event_id",
        eventId,
        client
      );
    }
    if (callbackId) {
      await npradb.Update(
        { status: "SUCCESS" },
        "callback",
        "callback_id",
        callbackId,
        client
      );
    }

    console.log(`Event ${eventId} & Callback ${callbackId} => SUCCESS`);
  } catch (err) {
    throw err;
  }
}

/**
 * Mark event & callback as FAILED in one transaction (no job queue insertion).
 */
async function markFailed(eventId, callbackId, client) {
  try {
    if (eventId) {
      await npradb.Update(
        { status: "FAILED" },
        "event",
        "event_id",
        eventId,
        client
      );
    }
    if (callbackId) {
      await npradb.Update(
        { status: "FAILED" },
        "callback",
        "callback_id",
        callbackId,
        client
      );
    }

    console.log(`Event ${eventId} & Callback ${callbackId} => FAILED`);
  } catch (err) {
    throw err;
  }
}

/**
 * Mark event & callback as TSQ_STATE, also set event.tsq_state = true if that column exists.
 */
async function markTsqState(eventId, callbackId, client) {
  try {
    if (eventId) {
      await npradb.Update(
        { status: "TSQ_STATE", tsq_state: true },
        "event",
        "event_id",
        eventId,
        client
      );
    }
    if (callbackId) {
      await npradb.Update(
        { status: "TSQ_STATE" },
        "callback",
        "callback_id",
        callbackId,
        client
      );
    }
    console.log(`Event ${eventId} & Callback ${callbackId} => TSQ_STATE`);
  } catch (err) {
    throw err;
  }
}

/**
 * Perform the TSQ check (Status Query).
 * GIP API call. Returns a final status code or actionCode.
 */
async function performTsqCheck(record, client) {
  try {
    // Example: Make an HTTP request to  "GIP"
    // const response = await axios.post('https://processor.example.com/tsq', { record });
    // let finalStatus = response.data.action_code;
    // return finalStatus;

    // For demonstration, pick from random:
    const possibleCodes = ["000", "001", "909", "912", "990", "FAILED"];
    const randomIndex = Math.floor(Math.random() * possibleCodes.length);
    const finalStatus = possibleCodes[randomIndex];
    console.log(`TSQ check for record ${record.id} => ${finalStatus}`);
    return finalStatus;
  } catch (error) {
    console.error("performTsqCheck error:", error.message);
    // Return some fallback status or throw
    return "FAILED";
  }
}

/**
 * Fetch pending FTD callbacks by joining callback + event tables.
 */
const fetchFtdPendingCallbacks = async () => {
  const sql = `
    SELECT 
      c.*, 
      e.*,
      c.action_code,
      e.action_code AS event_action_code
    FROM callback c
    JOIN event e ON e.session_id = c.session_id
    WHERE c.status = 'PENDING'
      AND e.event_name = 'FTD_REQUEST'
      AND e.tsq_state = false
    LIMIT 20
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

// ---------- fetchFtdTsqRecords ----------
const fetchFtdTsqRecords = async () => {
  const sql = `
    SELECT 
      c.*, 
      e.*,
      c.action_code,
      e.action_code AS event_action_code
    FROM callback c
    JOIN event e ON e.session_id = c.session_id
    WHERE c.status = 'TSQ_STATE'
      AND e.event_name = 'FTD_REQUEST'
      AND e.tsq_state = true
    LIMIT 20
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

// ---------- fetchFtcTsqRecords ----------
const fetchFtcTsqRecords = async () => {
  const sql = `
    SELECT 
      c.*, 
      e.*,
      c.action_code,
      e.action_code AS event_action_code
    FROM callback c
    JOIN event e ON e.session_id = c.session_id
    WHERE c.status = 'TSQ_STATE'
      AND e.event_name = 'FTC_REQUEST'
      AND e.tsq_state = true
    LIMIT 20
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

// ---------- fetchFtcPendingCallbacks ----------
const fetchFtcPendingCallbacks = async () => {
  const sql = `
    SELECT 
      c.*, 
      e.*,
      c.action_code,
      e.action_code AS event_action_code
    FROM callback c
    JOIN event e ON e.session_id = c.session_id
    WHERE c.status = 'PENDING'
      AND e.event_name = 'FTC_REQUEST'
      AND e.tsq_state = false
    LIMIT 20
  `;
  const { rows } = await pool.query(sql);
  return rows;
};
/**
 * Save (create) a new outgoing callback record in the `callback` table.
 * Uses a transaction with beginTransaction/commitTransaction/rollbackTransaction.
 *
 * @param {Object} record - Data needed for the outgoing callback.
 * @returns {Promise<Object>} The newly saved callback record.
 */
async function saveOutgoingCallback(record, client = null) {
  try {
    // Use a passed-in client or fallback to pool
    const usedClient = client;

    const payload = {
      payload: {
        srcBankCode: record.src_bank_code,
        srcAccountNumber: record.src_account_number,
        referenceNumber: record.reference_number,
        requestTimestamp: record.request_timestamp,
        sessionId: record.session_id,
        destBankCode: record.dest_bank_code,
        destAccountNumber: record.dest_account_number,
        narration: record.narration,
        responseCode: "000",
        responseMessage: "Approved",
        status: "SUCCESSFUL",
      },
      status: "PENDING",
      retries: 0,
      callback_url: record.callback,
    };

    // Simply create the record using npradb.Create without wrapping in a new transaction
    const newCallback = await npradb.Create(
      payload,
      "job_queue",
      null,
      usedClient
    );
    console.log(`pushing new job: Created job ${newCallback.id}`);

    return newCallback;
  } catch (err) {
    console.error("Error in saveOutgoingCallback:", err.message);
    throw err;
  }
}

async function updateTsqIteration(record, client) {
  // example: increment attempts, set next tsq time
  await npradb.Update(
    {
      tsq_attempts: (record.tsq_attempts || 0) + 1,
      next_tsq_time: new Date(Date.now() + config.tsq.intervalMinutes * 60_000),
    },
    "event",
    "event_id",
    record.event_id,
    client
  );
}

module.exports = {
  createFtcRequest,
  markFailedAndEnqueueJob,
  markEventAndCallbackAsComplete,
  createOutgoingCallback,
  sendJobToQueue,
  markSuccess,
  markFailed,
  markTsqState,
  performTsqCheck,
  fetchFtdPendingCallbacks,
  fetchFtcPendingCallbacks,
  fetchFtcTsqRecords,
  fetchFtdTsqRecords,
  saveOutgoingCallback,
  updateTsqIteration,
};
