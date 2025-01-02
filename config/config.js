const config = {
  dbType: process.env.DB_TYPE || "postgres", // Use environment variable or default to postgres
  version: process.env.VERSION || "/api/",
  service_name: process.env.SERVICE_NAME || "gip",
  GateRepo: "gateway",
  gipNedUrl:"http://localhost:3004/ned",
  gipNecUrl:"http://localhost:3004/nec",
  NEC_CODE:230,
  FTD_CODE:241,
  FTC_CODE:240,
  CHANNEL_CODE:100,
  // Add other configurations as needed
};

module.exports = config;
