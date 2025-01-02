const repositoryFactory = require("../repositories");
const dbType = process.env.DB_TYPE || "postgres"; // Use environment variable for dbType

const type = "request";

async function saveReqestService(config) {
  const type = "request"; // Define a default or specific type here
  const repository = repositoryFactory.getRepository(dbType, type);
  return await repository.saveRequests(config);
}
async function saveJobService(config) {
  const type = "request"; // Define a default or specific type here
  const repository = repositoryFactory.getRepository(dbType, type);
  return await repository.saveJob(config);
}


async function findReferenceService(reference) {
  const repository = repositoryFactory.getRepository(dbType, type);
  return await repository.findReference(reference);
}

async function findUniqueReferenceService(reference_number,src_bank_code,request_timestamp) {
  const repository = repositoryFactory.getRepository(dbType, type);
  return await repository.findUniqueReference(reference_number,src_bank_code,request_timestamp);
}
async function uniqueIdGeneratorService(reference) {
  const repository = repositoryFactory.getRepository(dbType, type);
  return await repository.generateRef(reference);
}
async function makeNecRequestService(payload, srcBankCode, destBankCode) {
  const repository = repositoryFactory.getRepository("api", "gip");
  return await repository.makeNecRequest(payload, srcBankCode, destBankCode);
}

async function makeGipRequestService(payload, url) {
  const repository = repositoryFactory.getRepository("api", "gip");
  return await repository.gipGeneral(payload, url);
}


async function makeRtgsRequestService(payload, srcBankCode, destBankCode) {
  const repository = repositoryFactory.getRepository("api", "rtgs");
  return await repository.makeRtgsRequest(payload, srcBankCode, destBankCode);
}

async function findParticipantService(code) {
  const repository = repositoryFactory.getRepository("json", "participant");
  return await repository.findRoutingItem(code);
}
async function findActCodeService(code) {
  const repository = repositoryFactory.getRepository("json", "actcodes");
  return await repository.findActCode(code);
}

async function reportService(query) {
  const repository = repositoryFactory.getRepository(dbType, "reports");
  return await repository.requestReporter(query);
}

async function logEvents(payload) {
  console.log('Service---- NAME_ENQUIRY event:', payload);

}

module.exports = {
  saveReqestService,
  findReferenceService,
  uniqueIdGeneratorService,
  makeNecRequestService,
  findParticipantService,
  findActCodeService,
  makeRtgsRequestService,
  reportService,
  saveJobService,
  findUniqueReferenceService,
  logEvents,
  makeGipRequestService
};
