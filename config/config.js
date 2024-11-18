const config = {
    dbType: process.env.DB_TYPE || 'postgres', // Use environment variable or default to postgres
    version: process.env.VERSION || '/api/v1/',
    service_name: process.env.SERVICE_NAME || 'bulk_pension',
    GateRepo:'gateway',
    // Add other configurations as needed
};

module.exports = config;
