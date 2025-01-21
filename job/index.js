const ftcWorker = require("./worker/ftc");
const ftdWorker = require("./worker/ftd");
const ftdTsqWorker = require("./worker/ftd_tsq");
const ftcTsqWorker = require("./worker/ftc_tsq");

async function startAllServices() {
  ftdWorker(); // never returns
  ftcWorker(); // never returns
  ftdTsqWorker(); // never returns
  ftcTsqWorker(); // never returns
}

startAllServices();
