const ftcWorker = require("./worker/ftc");
const ftdWorker = require("./worker/ftd");

async function startAllServices() {
    //ftdWorker();      // never returns
    ftcWorker();      // never returns
    // ftdTsqWorker();   // never returns
    // ftcTsqWorker();   // never returns
  }
  
  startAllServices();
  