const config = {
  dbType: process.env.DB_TYPE || "postgres", // Use environment variable or default to postgres
  version: process.env.VERSION || "/api/",
  service_name: process.env.SERVICE_NAME || "gip",
  GateRepo: "gateway",
  gipNedUrl: "http://172.21.8.21:9000/SwitchGIP/WSGIP",
  gipNecUrl: "http://172.21.8.21:9000/SwitchGIP/WSGIP",
  gipFtdUrl: "http://172.21.8.21:9000/SwitchGIP/WSGIP",
  gipFtcUrl: "http://172.21.8.21:9000/SwitchGIP/WSGIP",
  gipTsqUrl: "http://172.21.8.21:9000/SwitchGIP/WSGIP",
  NEC_CODE: 230,
  FTD_CODE: 241,
  FTC_CODE: 240,
  CHANNEL_CODE: 100,
  CALLBACK_URL: "http://172.21.8.21:3002/api/gip/debit/v1/callback",
  // Add other configurations as needed
};

module.exports = config;
