//rabbitmq
const amqp = require("amqplib");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

// forest.js
const axios = require("axios");
const GlobalModel = require("../model/Global");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

// Function to add a forest
async function addItem(tableName, payload) {
  // Logic to add new record to the database
  let results = await GlobalModel.Create(payload, tableName, "");
  return results;
}

// Function to get list of items from db
async function getItems(tableName, columnsToSelect, conditions) {
  let results = await GlobalModel.Finder(
    tableName,
    columnsToSelect,
    conditions
  );
  return results;
}

async function getItemById(tableName, columnsToSelect, conditions) {
  let results = await GlobalModel.Finder(
    tableName,
    columnsToSelect,
    conditions
  );
  return results;
}

async function updateItem(payload, tableName, recordId, recordValue) {
  payload.updated_at = systemDate;

  const runupdate = await GlobalModel.Update(
    payload,
    tableName,
    recordId,
    recordValue
  );

  return runupdate;
}

async function makeApiCall(
  url,
  method = "POST",
  data = null,
  headers = {},
  authType = null,
  authValue = null
) {
  try {
    const config = {
      method: method.toUpperCase(),
      url,
      headers,
    };

    if (authType && authValue) {
      if (authType.toLowerCase() === "basic") {
        config.auth = {
          username: authValue.username,
          password: authValue.password,
        };
      } else if (authType.toLowerCase() === "bearer") {
        config.headers["Authorization"] = `Bearer ${authValue}`;
      } else {
        // Handle other authentication types as needed
        // Add conditions for other auth types
      }
    }

    console.log(config.url);
    if (data) {
      if (
        headers["Content-Type"] &&
        headers["Content-Type"].toLowerCase() === "application/json"
      ) {
        config.data = data;
      } else if (data instanceof FormData) {
        config.data = data;
        Object.assign(headers, data.getHeaders());
      } else {
        config.data = JSON.stringify(data);
        headers["Content-Type"] = "application/json";
      }
    }

    const response = await axios(config);

    //store response
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getActiveJiraInstance() {
  let results = await GlobalModel.Finder(
    "jira_instances",
    [],
    [{ column: "status", operator: "=", value: "active" }]
  );
  return results;
}

// Function to send a payload to RabbitMQ and emit an event
async function sendtoRabbitMQ(payload) {
  // Configuration
  const QUEUE_NAME = "jira_requests";
  const RABBITMQ_URL = "amqp://localhost"; // Replace with your RabbitMQ URL
  const INTERVAL_MS = 1000; // Interval to manage CPU load
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME);

    // Send payload to RabbitMQ
    const message = JSON.stringify(payload);
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
    console.log(`Sent to RabbitMQ: ${message}`);

    // Emit an event indicating a new message has been added
    eventEmitter.emit("newMessage");
  } catch (error) {
    console.error("Failed to send message to RabbitMQ:", error);
  }
}

module.exports = {
  addItem,
  getItems,
  getItemById,
  updateItem,
  makeApiCall,
  getActiveJiraInstance,
  sendtoRabbitMQ,
};
