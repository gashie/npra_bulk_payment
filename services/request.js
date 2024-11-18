const repositoryFactory = require('../repositories');
const dbType = process.env.DB_TYPE || 'postgres'; // Use environment variable for dbType

const type = 'request';

async function saveReqestService(config) {
    const type = 'request'; // Define a default or specific type here
    const repository = repositoryFactory.getRepository(dbType, type);
    return await repository.saveRequests(config);
}

async function findReferenceService(reference) {
    const repository = repositoryFactory.getRepository(dbType, type);
    return await repository.findReference(reference);
}
async function uniqueIdGeneratorService(reference) {
    const repository = repositoryFactory.getRepository(dbType, type);
    return await repository.generateRef(reference);
}



module.exports = { saveReqestService,findReferenceService,uniqueIdGeneratorService };
