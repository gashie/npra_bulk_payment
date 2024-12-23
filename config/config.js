const config = {
  dbType: process.env.DB_TYPE || "postgres", // Use environment variable or default to postgres
  version: process.env.VERSION || "/api/",
  service_name: process.env.SERVICE_NAME || "gip",
  GateRepo: "gateway",
  // Add other configurations as needed
};

module.exports = config;
